-- Verificação da fundação (v2/data/migrations/001_fundacao.sql).
--
-- Roda contra um Postgres real. Cada bloco levanta exceção quando a garantia
-- falha, então "rodou até o fim" é a aprovação.

SET search_path TO baluarte, public;
\set ON_ERROR_STOP on

-- ════════ preparo ════════
INSERT INTO fonte (slug, nome, tipo, confianca) VALUES
  ('wikipedia-pt', 'Wikipédia PT', 'web', 0.60),
  ('janes',        'Janes',        'web', 0.90),
  ('operador',     'Operador',     'operador', 1.00);

INSERT INTO entidade (tipo, chave, rotulo) VALUES ('veiculo', 'leopard-2a6', 'Leopard 2A6');

-- ════════ 1. contradição é PRESERVADA, não sobrescrita ════════
-- Duas fontes discordam do alcance. Num modelo com UPDATE, a segunda apagaria a
-- primeira e a pergunta "quem disse o quê" ficaria sem resposta.
INSERT INTO afirmacao (entidade_id, atributo, valor, fonte_id, coletor, confianca)
SELECT e.id, 'alcance_km', '550'::jsonb, f.id, 'bot-militar/1.0', 0.60
FROM entidade e, fonte f WHERE e.chave='leopard-2a6' AND f.slug='wikipedia-pt';

INSERT INTO afirmacao (entidade_id, atributo, valor, fonte_id, coletor, confianca)
SELECT e.id, 'alcance_km', '500'::jsonb, f.id, 'bot-militar/1.0', 0.90
FROM entidade e, fonte f WHERE e.chave='leopard-2a6' AND f.slug='janes';

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM afirmacao WHERE atributo='alcance_km';
  IF n <> 2 THEN RAISE EXCEPTION 'as duas afirmações deviam coexistir, há %', n; END IF;

  SELECT count(*) INTO n FROM afirmacao_conflito WHERE atributo='alcance_km';
  IF n <> 1 THEN RAISE EXCEPTION 'o conflito não foi detectado pela view'; END IF;
  RAISE NOTICE '✓ 1. contradição preservada e visível na view';
END $$;

-- ════════ 2. append-only é TRAVA, não convenção ════════
DO $$
DECLARE ok boolean := false;
BEGIN
  BEGIN
    UPDATE afirmacao SET valor = '999'::jsonb WHERE atributo='alcance_km';
  EXCEPTION WHEN others THEN ok := true;
  END;
  IF NOT ok THEN RAISE EXCEPTION 'o UPDATE do valor passou — append-only é ficção'; END IF;

  -- mas o ciclo de verificação continua possível
  UPDATE afirmacao SET estado='verificada'
   WHERE atributo='alcance_km' AND fonte_id=(SELECT id FROM fonte WHERE slug='janes');
  RAISE NOTICE '✓ 2. valor imutável; estado ainda editável';
END $$;

-- ════════ 3. substituir aponta, não apaga ════════
DO $$
DECLARE nova bigint; antiga bigint;
BEGIN
  SELECT id INTO antiga FROM afirmacao
   WHERE atributo='alcance_km' AND fonte_id=(SELECT id FROM fonte WHERE slug='wikipedia-pt');

  INSERT INTO afirmacao (entidade_id, atributo, valor, fonte_id, coletor, confianca)
  SELECT e.id, 'alcance_km', '520'::jsonb, f.id, 'bot-militar/1.1', 0.70
  FROM entidade e, fonte f WHERE e.chave='leopard-2a6' AND f.slug='wikipedia-pt'
  RETURNING id INTO nova;

  UPDATE afirmacao SET substituida_por = nova WHERE id = antiga;

  IF NOT EXISTS (SELECT 1 FROM afirmacao WHERE id=antiga) THEN
    RAISE EXCEPTION 'a afirmação antiga sumiu — devia continuar legível';
  END IF;
  RAISE NOTICE '✓ 3. substituição preserva o histórico';
END $$;

-- ════════ 4. dependência não satisfeita não é reivindicável ════════
INSERT INTO tarefa (tipo, carga, origem) VALUES ('coletar', '{"url":"x"}', 'teste');
INSERT INTO tarefa (tipo, carga, origem, depende_de)
  VALUES ('classificar', '{}', 'teste', (SELECT id FROM tarefa WHERE tipo='coletar'));

DO $$
DECLARE t record; n int;
BEGIN
  SELECT count(*) INTO n FROM reivindicar_tarefa('w1', 300, ARRAY['classificar']);
  IF n <> 0 THEN RAISE EXCEPTION 'classificar foi reivindicada antes de coletar terminar'; END IF;

  SELECT * INTO t FROM reivindicar_tarefa('w1', 300, ARRAY['coletar']);
  IF t.id IS NULL THEN RAISE EXCEPTION 'coletar devia ser reivindicável'; END IF;
  UPDATE tarefa SET estado='COMPLETED', concluida_em=now() WHERE id=t.id;

  SELECT count(*) INTO n FROM reivindicar_tarefa('w1', 300, ARRAY['classificar']);
  IF n <> 1 THEN RAISE EXCEPTION 'classificar devia liberar depois de coletar'; END IF;
  RAISE NOTICE '✓ 4. dependência respeitada';
END $$;

-- ════════ 5. lease vencido volta à fila; teto vira FAILED ════════
INSERT INTO tarefa (tipo, origem, estado, worker, lease_ate, tentativas, max_tentativas)
  VALUES ('travada', 'teste', 'RUNNING', 'w-morto', now() - interval '1 min', 1, 3),
         ('desiste', 'teste', 'RUNNING', 'w-morto', now() - interval '1 min', 3, 3);

DO $$
DECLARE requeued int; falhou int;
BEGIN
  PERFORM recuperar_tarefas_vencidas();
  SELECT count(*) INTO requeued FROM tarefa WHERE tipo='travada' AND estado='QUEUED';
  SELECT count(*) INTO falhou   FROM tarefa WHERE tipo='desiste' AND estado='FAILED';
  IF requeued <> 1 THEN RAISE EXCEPTION 'worker morto não devolveu a tarefa à fila'; END IF;
  IF falhou   <> 1 THEN RAISE EXCEPTION 'tarefa acima do teto devia virar FAILED'; END IF;
  RAISE NOTICE '✓ 5. lease vencido recuperado; teto de tentativas respeitado';
END $$;

-- ════════ 6. prioridade ordena ════════
DELETE FROM tarefa;
INSERT INTO tarefa (tipo, origem, prioridade) VALUES ('c',' t',300),('a','t',10),('b','t',100);
DO $$
DECLARE t record;
BEGIN
  SELECT * INTO t FROM reivindicar_tarefa('w1');
  IF t.tipo <> 'a' THEN RAISE EXCEPTION 'esperava prioridade 10 primeiro, veio %', t.tipo; END IF;
  RAISE NOTICE '✓ 6. prioridade respeitada';
END $$;
