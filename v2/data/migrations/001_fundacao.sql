-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  Baluarte V2 — fundação da Data Layer + fila de tarefas                   ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Referências: docs/v2/V2_DECISION_LOG.md (Decisões 5 e 6) · V2_STACK.md §2.
--
-- ── A decisão que molda tudo abaixo ─────────────────────────────────────────
-- "Se um bot encontrar uma informação hoje e outra fonte contradizer daqui a
--  seis meses, o Baluarte não deveria simplesmente sobrescrever."
--
-- Por isso `afirmacao` é um log: linha entra e NUNCA é atualizada. Contradição
-- não é erro a resolver na escrita — é fato sobre o mundo, e o sistema tem que
-- conseguir dizer "existem duas informações conflitantes; a mais recente veio da
-- fonte X". Um UPDATE apagaria exatamente essa capacidade.
--
-- É a mesma lição das 71 chaves da V1, um nível acima: dado alheio não se
-- sobrescreve sem plano.

BEGIN;

CREATE SCHEMA IF NOT EXISTS baluarte;
SET search_path TO baluarte, public;

-- ── FONTES ─────────────────────────────────────────────────────────────────
-- De onde o conhecimento veio. Sem isto, proveniência é texto solto.
CREATE TABLE fonte (
  id           bigserial PRIMARY KEY,
  slug         text        NOT NULL UNIQUE,           -- 'wikipedia-pt', 'dof', 'operador'
  nome         text        NOT NULL,
  tipo         text        NOT NULL CHECK (tipo IN ('web','api','arquivo','operador','derivado')),
  url_base     text,
  -- 0..1. `derivado` (um bot inferiu) nasce mais baixo que `operador` (o humano
  -- afirmou) de propósito: confiança é do CANAL, e o canal humano vale mais.
  confianca    numeric(3,2) NOT NULL DEFAULT 0.50 CHECK (confianca BETWEEN 0 AND 1),
  criada_em    timestamptz NOT NULL DEFAULT now()
);

-- ── ENTIDADES ──────────────────────────────────────────────────────────────
-- O "sobre o que" de uma afirmação. Deliberadamente magra: nome e tipo. Todo o
-- resto vira afirmação, para poder ter proveniência — inclusive o nome, se um
-- dia duas fontes discordarem de como a coisa se chama.
CREATE TABLE entidade (
  id           bigserial PRIMARY KEY,
  tipo         text        NOT NULL,                  -- 'veiculo', 'pessoa', 'conflito'…
  chave        text        NOT NULL,                  -- identificador estável dentro do tipo
  rotulo       text        NOT NULL,
  criada_em    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tipo, chave)
);

-- ── AFIRMAÇÕES ─────────────────────────────────────────────────────────────
-- APPEND-ONLY. Não existe UPDATE nesta tabela — ver o cabeçalho.
CREATE TABLE afirmacao (
  id             bigserial PRIMARY KEY,
  entidade_id    bigint      NOT NULL REFERENCES entidade(id) ON DELETE CASCADE,
  atributo       text        NOT NULL,                -- 'alcance_km', 'fabricante'
  valor          jsonb       NOT NULL,                -- jsonb: número, texto ou estrutura

  -- proveniência: as colunas que a Decisão 5 exige, e sem as quais isto seria
  -- um depósito em vez de infraestrutura de conhecimento
  fonte_id       bigint      NOT NULL REFERENCES fonte(id),
  fonte_url      text,
  coletado_em    timestamptz NOT NULL DEFAULT now(),
  coletor        text        NOT NULL,                -- qual bot/versão afirmou
  confianca      numeric(3,2) CHECK (confianca BETWEEN 0 AND 1),

  -- ciclo de verificação — a afirmação existe antes de ser confiável
  estado         text        NOT NULL DEFAULT 'nao_verificada'
                             CHECK (estado IN ('nao_verificada','verificada','refutada','obsoleta')),
  -- quando outra afirmação a substitui, aponta-se para a nova em vez de apagar
  substituida_por bigint     REFERENCES afirmacao(id),
  registrada_em  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX afirmacao_entidade_atributo ON afirmacao (entidade_id, atributo);
CREATE INDEX afirmacao_fonte              ON afirmacao (fonte_id);
CREATE INDEX afirmacao_valor_gin          ON afirmacao USING gin (valor);
-- Só as vivas: o índice parcial mantém a consulta quente pequena mesmo quando o
-- log crescer para milhões de linhas históricas.
CREATE INDEX afirmacao_vivas ON afirmacao (entidade_id, atributo)
  WHERE substituida_por IS NULL AND estado <> 'refutada';

-- A trava que faz o append-only ser real em vez de convenção. Convenção não
-- sobrevive ao primeiro bot com pressa.
CREATE OR REPLACE FUNCTION afirmacao_imutavel() RETURNS trigger AS $$
BEGIN
  -- `estado` e `substituida_por` são metadados do ciclo de verificação, não o
  -- conteúdo afirmado. Alterar o resto seria reescrever a história.
  IF NEW.entidade_id IS DISTINCT FROM OLD.entidade_id
     OR NEW.atributo IS DISTINCT FROM OLD.atributo
     OR NEW.valor    IS DISTINCT FROM OLD.valor
     OR NEW.fonte_id IS DISTINCT FROM OLD.fonte_id
     OR NEW.coletor  IS DISTINCT FROM OLD.coletor THEN
    RAISE EXCEPTION 'afirmacao é append-only: registre uma nova e aponte substituida_por (id=%)', OLD.id;
  END IF;
  RETURN NEW;
END $$ LANGUAGE plpgsql;

CREATE TRIGGER afirmacao_sem_update BEFORE UPDATE ON afirmacao
  FOR EACH ROW EXECUTE FUNCTION afirmacao_imutavel();

-- ── RELAÇÕES ───────────────────────────────────────────────────────────────
-- O grafo. Também com proveniência: "A se relaciona com B" é uma afirmação
-- sobre o mundo como qualquer outra, e alguém pode estar errado.
CREATE TABLE relacao (
  id           bigserial PRIMARY KEY,
  origem_id    bigint      NOT NULL REFERENCES entidade(id) ON DELETE CASCADE,
  tipo         text        NOT NULL,                  -- 'opera', 'sucede', 'fabrica'
  destino_id   bigint      NOT NULL REFERENCES entidade(id) ON DELETE CASCADE,
  fonte_id     bigint      NOT NULL REFERENCES fonte(id),
  coletado_em  timestamptz NOT NULL DEFAULT now(),
  confianca    numeric(3,2) CHECK (confianca BETWEEN 0 AND 1),
  CHECK (origem_id <> destino_id),
  UNIQUE (origem_id, tipo, destino_id, fonte_id)
);
CREATE INDEX relacao_origem  ON relacao (origem_id, tipo);
CREATE INDEX relacao_destino ON relacao (destino_id, tipo);

-- ── CONFLITO: a consulta que justifica o desenho ───────────────────────────
-- Mostra onde duas fontes discordam do mesmo atributo. Numa tabela com UPDATE
-- esta view seria impossível de escrever: o valor antigo não existiria mais.
CREATE VIEW afirmacao_conflito AS
SELECT a.entidade_id,
       e.rotulo,
       a.atributo,
       count(DISTINCT a.valor)    AS valores_distintos,
       count(DISTINCT a.fonte_id) AS fontes,
       jsonb_agg(DISTINCT jsonb_build_object(
         'valor', a.valor, 'fonte', f.slug, 'em', a.coletado_em, 'confianca', a.confianca
       ) ORDER BY jsonb_build_object(
         'valor', a.valor, 'fonte', f.slug, 'em', a.coletado_em, 'confianca', a.confianca
       )) AS versoes
FROM afirmacao a
JOIN entidade e ON e.id = a.entidade_id
JOIN fonte    f ON f.id = a.fonte_id
WHERE a.substituida_por IS NULL AND a.estado <> 'refutada'
GROUP BY a.entidade_id, e.rotulo, a.atributo
HAVING count(DISTINCT a.valor) > 1;

-- ── FILA DE TAREFAS ────────────────────────────────────────────────────────
-- Decisão 6: os bots formam ecossistema, não fila — mas sem gerente de tarefas
-- eles "criam trabalho infinitamente e o sistema vira tempestade de processos".
CREATE TABLE tarefa (
  id           bigserial PRIMARY KEY,
  tipo         text        NOT NULL,
  carga        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  prioridade   int         NOT NULL DEFAULT 100,      -- menor = antes
  estado       text        NOT NULL DEFAULT 'QUEUED'
                           CHECK (estado IN ('QUEUED','RUNNING','WAITING','COMPLETED','FAILED','CANCELLED')),
  origem       text,                                  -- quem criou (bot, operador, evento)
  depende_de   bigint      REFERENCES tarefa(id),
  tentativas   int         NOT NULL DEFAULT 0,
  max_tentativas int       NOT NULL DEFAULT 3,
  -- Sem isto, worker que morre deixa a tarefa RUNNING para sempre. O lease é
  -- renovado por heartbeat; vencido, a tarefa volta para a fila.
  lease_ate    timestamptz,
  worker       text,
  erro         text,
  resultado    jsonb,
  criada_em    timestamptz NOT NULL DEFAULT now(),
  iniciada_em  timestamptz,
  concluida_em timestamptz
);

-- Índice parcial: a fila quente é minúscula perto do histórico de concluídas.
CREATE INDEX tarefa_fila ON tarefa (prioridade, id) WHERE estado = 'QUEUED';
CREATE INDEX tarefa_lease ON tarefa (lease_ate)     WHERE estado = 'RUNNING';

-- Reivindicar trabalho. `SKIP LOCKED` é o que permite N workers em paralelo sem
-- coordenação externa nem broker: cada um pula as linhas que outro travou.
CREATE OR REPLACE FUNCTION reivindicar_tarefa(p_worker text, p_lease_seg int DEFAULT 300, p_tipos text[] DEFAULT NULL)
RETURNS SETOF tarefa AS $$
  UPDATE tarefa SET
    estado      = 'RUNNING',
    worker      = p_worker,
    tentativas  = tentativas + 1,
    iniciada_em = COALESCE(iniciada_em, now()),
    lease_ate   = now() + make_interval(secs => p_lease_seg)
  WHERE id = (
    SELECT t.id FROM tarefa t
    WHERE t.estado = 'QUEUED'
      AND (p_tipos IS NULL OR t.tipo = ANY(p_tipos))
      -- dependência não satisfeita não é elegível: é o que impede um bot de
      -- classificar um dado que ainda não foi coletado
      AND (t.depende_de IS NULL OR EXISTS (
            SELECT 1 FROM tarefa d WHERE d.id = t.depende_de AND d.estado = 'COMPLETED'))
    ORDER BY t.prioridade, t.id
    FOR UPDATE SKIP LOCKED
    LIMIT 1
  )
  RETURNING *;
$$ LANGUAGE sql;

-- Devolve à fila o que venceu o lease (worker morto). Acima do teto de
-- tentativas vira FAILED em vez de girar para sempre.
CREATE OR REPLACE FUNCTION recuperar_tarefas_vencidas()
RETURNS TABLE (id bigint, novo_estado text) AS $$
  UPDATE tarefa SET
    estado    = CASE WHEN tentativas >= max_tentativas THEN 'FAILED' ELSE 'QUEUED' END,
    worker    = NULL,
    lease_ate = NULL,
    erro      = CASE WHEN tentativas >= max_tentativas
                     THEN 'lease vencido; excedeu max_tentativas' ELSE erro END
  WHERE estado = 'RUNNING' AND lease_ate < now()
  RETURNING tarefa.id, tarefa.estado;
$$ LANGUAGE sql;

COMMIT;
