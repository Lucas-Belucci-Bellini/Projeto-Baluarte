/**
 * Política do Baluarte — o lugar único onde o sistema DECLARA o que existe.
 *
 * Os três módulos de fundação (`permissions`, `storage`, `flags`) são motores
 * vazios: sabem cobrar regra, não sabem quais regras. Este arquivo é o
 * conteúdo. Ler ele de cima a baixo responde três perguntas de uma vez:
 *
 *   - o que o Baluarte é capaz de fazer, e o que é perigoso?   → PERMISSOES
 *   - o que ele guarda no navegador, e o quão sensível é?      → ESQUEMAS
 *   - o que está pronto para a 1.0.0, e o que é experimento?   → FLAGS
 *
 * Isso mora junto de propósito. Espalhado por 100 páginas, ninguém consegue
 * responder "o que um agente com acesso total conseguiria fazer aqui?" — e essa
 * é exatamente a pergunta que a fase de hardening (#420) existe para responder.
 *
 * Chamado uma vez no boot, por `aplicarPolitica()`.
 */

import * as permissoes from './permissions.js';
import * as flags from './flags.js';
import { storage, registrarEsquema } from './storage.js';
import { bus } from './events.js';

/* ==============================================================
 *  1. PERMISSÕES — o que o Baluarte é capaz de fazer
 * ============================================================== */

/**
 * Risco, relembrando (`permissions.js`):
 *   leitura  — lê o que o operador já veria na tela. Curinga alcança.
 *   escrita  — altera dado/estado persistente. Curinga alcança.
 *   restrito — executa código, alcança arquivo real, fala com a rede em nome do
 *              operador, gasta dinheiro, OU expõe dado classificado como
 *              `sensivel`. Curinga NÃO alcança.
 */
export const PERMISSOES = [
  /* ── Navegação e conteúdo público ──────────────────────────────────────── */
  { id: 'app.navegar', risco: 'leitura', descricao: 'Trocar de rota dentro do Baluarte' },
  { id: 'arsenal.read', risco: 'leitura', descricao: 'Consultar o Arsenal' },
  { id: 'elites.read', risco: 'leitura', descricao: 'Consultar as equipes de elite' },
  { id: 'cronicas.read', risco: 'leitura', descricao: 'Consultar os arcos das Crônicas' },
  { id: 'biblioteca.read', risco: 'leitura', descricao: 'Consultar a Biblioteca' },
  { id: 'nexus.read', risco: 'leitura', descricao: 'Consultar o grafo do Git Nexus' },

  /* ── Sistema ───────────────────────────────────────────────────────────── */
  { id: 'sistema.diagnostico', risco: 'leitura', descricao: 'Ler status, versão e estado do site' },

  /* ── Ferramentas ───────────────────────────────────────────────────────── */
  { id: 'ferramentas.calcular', risco: 'leitura', descricao: 'Avaliar expressão matemática' },
  { id: 'ferramentas.write', risco: 'escrita', descricao: 'Alterar o estado de uma ferramenta (cor, preset…)' },
  { id: 'editor.write', risco: 'escrita', descricao: 'Abrir o Editor com conteúdo pré-carregado' },

  /* ── JARVIS ────────────────────────────────────────────────────────────── */
  { id: 'jarvis.use', risco: 'leitura', descricao: 'Conversar com o JARVIS' },
  { id: 'jarvis.skills.ler', risco: 'leitura', descricao: 'Listar as skills aprendidas' },

  /* Estes três são `restrito` e o motivo é diferente do óbvio: */

  /* Criar/apagar skill é escrever código que DEPOIS será executado pelo
   * sandbox de `jarvis-skills.js`. Escrita que vira execução é execução. */
  { id: 'jarvis.skills.escrever', risco: 'restrito', descricao: 'Criar ou apagar uma skill (código que será executado)' },
  { id: 'jarvis.skills.executar', risco: 'restrito', descricao: 'Rodar uma skill aprendida' },

  /* Ler a memória do JARVIS é `leitura` pela mecânica, mas o dado é
   * classificado `sensivel` (conversas do operador). Dado sensível não pode
   * sair de graça num `conceder('*')`. */
  { id: 'jarvis.memoria.ler', risco: 'restrito', descricao: 'Ler o histórico de conversas do JARVIS' },

  /* ── Capacidades que AINDA NÃO existem, declaradas de propósito ─────────
   * Declarar antes de implementar tem uma consequência prática: no dia em que a
   * tool aparecer, ela já nasce atrás de uma permissão que ninguém concedeu, em
   * vez de nascer aberta e "ser protegida depois". */
  { id: 'terminal.executar', risco: 'restrito', descricao: 'Rodar comando no terminal virtual' },
  { id: 'arquivos.ler', risco: 'restrito', descricao: 'Ler arquivo real pela ponte do Launcher' },
  { id: 'arquivos.escrever', risco: 'restrito', descricao: 'Escrever arquivo real pela ponte do Launcher' },
  { id: 'rede.chamar', risco: 'restrito', descricao: 'Chamar API externa em nome do operador' }
];

/**
 * O que o **operador na própria máquina** recebe no primeiro boot.
 *
 * Duas partes, e a separação é o ponto:
 *
 *   `'*'`  — tudo que é leitura/escrita. Por construção **não** inclui
 *            `restrito`: é a garantia estrutural, não uma lista para manter.
 *
 *   a lista explícita — as três capacidades `restrito` que a interface do
 *            Baluarte **já expunha antes desta fase**. Elas aparecem uma a uma,
 *            escritas por extenso, porque conceder `restrito` por engano não
 *            pode ser possível: só dá para fazer digitando o nome inteiro.
 *
 * Por que conceder `restrito` a alguém: o modelo de ameaça aqui não é
 * "visitante contra dono" — tudo roda no `localStorage` de quem está no teclado.
 * É **chamador autônomo**: JARVIS em modo agente, e depois MCP, escolhendo a
 * ação sem ninguém olhando. Esses recebem um conjunto próprio e mais estreito,
 * não este. O que a fronteira garante é que uma capacidade NOVA (terminal,
 * arquivos, rede) não entra nesta lista sozinha.
 */
export const PADRAO_OPERADOR = [
  '*',
  'jarvis.memoria.ler',
  'jarvis.skills.ler',
  'jarvis.skills.escrever',
  'jarvis.skills.executar'
];

/* ==============================================================
 *  2. ESQUEMAS DE STORAGE — o que fica guardado no navegador
 * ============================================================== */

/**
 * ⚠️ Todo esquema aqui está na **versão 1 com `migrar` identidade**, e isso é
 * obrigatório, não descuido.
 *
 * O dado que já está no navegador do operador foi gravado ANTES do envelope
 * existir — para o storage ele é "versão 0". Sem um `migrar`, `get()` de uma
 * chave versionada com dado v0 devolve o fallback, ou seja: as abas do editor
 * dele somem no primeiro deploy. A identidade declara o que é verdade — *v0 e
 * v1 têm o mesmo formato* — e o dado antigo atravessa e é reembalado.
 *
 * Quando o formato de uma destas chaves mudar de verdade: **suba a versão e
 * escreva a migração real**. O teste `politica.test.js` cobra que toda chave
 * declarada sobreviva a um valor legado.
 */
const IDENTIDADE = (dados) => dados;

export const ESQUEMAS = [
  { chave: 'editor:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'biblioteca:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'ui:sidebarCollapsed', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'musicas:acervoLoop', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'nucleo:glbUrl', versao: 1, classe: 'local', migrar: IDENTIDADE },

  { chave: 'color-studio:color', versao: 1, classe: 'publico', migrar: IDENTIDADE },

  /* Pública POR DESIGN, não por descuido: é chave de anti-abuso da RPC de
   * ingestão, e qualquer visitante a veria no bundle de qualquer jeito
   * (ver o cabeçalho de `utils/nexus.js`). Classificar como `publico` é a
   * afirmação honesta — fingir que é segredo seria pior. */
  { chave: 'nexus:key', versao: 1, classe: 'publico', migrar: IDENTIDADE },

  /* Histórico de comandos do terminal — o que o operador digitou. */
  { chave: 'terminal:history', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'perfil:config', versao: 1, classe: 'local', migrar: IDENTIDADE },

  /* A sessão do usuário (JWT + refresh token do Supabase).
   *
   * `sensivel`, **não** `secreto`, e a distinção é o ponto: `secreto` é recusado
   * na gravação, e a sessão PRECISA viver no navegador — é assim que auth web
   * funciona. O que a protege não é escondê-la do frontend (impossível), é ela
   * ser o JWT do próprio usuário, de vida curta, renovável, com o RLS do banco
   * decidindo o que ele alcança. Classificar como `secreto` aqui não deixaria
   * o Baluarte mais seguro — deixaria o login quebrado. */
  { chave: 'auth:session', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },

  /* Estado da própria política. */
  { chave: 'permissoes', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'flags', versao: 1, classe: 'local', migrar: IDENTIDADE },

  /* ══════════════════════════════════════════════════════════════════════════
   *  A VARREDURA (#420 — bloqueador achado às vésperas do congelamento)
   * ══════════════════════════════════════════════════════════════════════════
   *
   * As 12 chaves acima eram as declaradas. `scripts/gen-catalogo-storage.mjs`
   * varreu `src/` e achou **outras 59 em uso e sem esquema** — quase todas
   * acessadas por constante (`const KEY = 'ui:theme'`), forma que um grep pelo
   * literal dentro de `storage.get(...)` não enxerga. Por isso passaram batido
   * por tanto tempo: quem procurou, procurou pelo padrão errado.
   *
   * POR QUE ISSO BLOQUEIA A 1.0.0, e não é arrumação cosmética:
   *
   * Chave sem esquema não tem versão. Congelar a V1 assim deixaria a V2 — que
   * é reconstrução arquitetural, não evolução — **sem contrato nenhum** para ler
   * o dado gravado pela V1. E o modo de falha não avisa: uma chave que ganhe
   * esquema depois tem o dado antigo lido como versão 0 e, sem `migrar`,
   * `storage.get` devolve o fallback (storage.js:160-166). O operador perde o
   * que tinha sem erro, sem log, sem pista.
   *
   * Declarar agora, com identidade, é o que torna o congelamento reversível:
   * a partir daqui existe um formato v1 nomeado, e a V2 tem de onde migrar.
   *
   * SOBRE AS CLASSES: nenhuma credencial virou `secreto`. `secreto` é RECUSADO
   * na gravação por `core/storage.js`, e chave de API que o próprio operador
   * digita para usar a conta dele precisa viver no navegador — marcar assim não
   * deixaria o Baluarte mais seguro, deixaria o cofre quebrado. É o mesmo
   * raciocínio já registrado em `auth:session` acima. `sensivel` é a afirmação
   * correta: fica no navegador porque precisa, e o Baluarte não a envia a lugar
   * nenhum. */

  /* ── sensivel: credenciais, autenticação e conteúdo do operador ──────────
   * O critério é "o operador se importaria se isto aparecesse numa captura de
   * tela?". Chave de API, sessão, conversa, memória, localização, identidade e
   * o que ele escreveu entram; estado de tela, não. */
  { chave: 'apis:vault', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'voice:elevenKey', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'jarvis:config', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'jarvis:history', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'jarvis:memories', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'jarvis:skills', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'jarvis:guard', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'jarvis:guardlog', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'mark11:custom-skills', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'shadow:auth', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'shadow:session', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'nucleo:wsToken', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'nucleo:wsUrl', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'geo:track', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'find:db', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'media:bookmarks', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'mural:author', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'mural:posts', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },
  { chave: 'vfs:tree', versao: 1, classe: 'sensivel', migrar: IDENTIDADE },

  /* ── local: estado de tela, preferência e cache de dado público ──────────
   * Não sai do navegador e não vale nada fora dele. `json-studio:input` e
   * `qr-studio:text` guardam o que o operador digitou e ficaram AQUI de
   * propósito: são rascunho de ferramenta, e classificar todo campo de texto
   * como `sensivel` esvaziaria o sentido da palavra. */
  { chave: 'ui:theme', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'ui:universe', versao: 1, classe: 'local', migrar: IDENTIDADE },

  /* Em que versão o operador fechou a faixa "V2 em construção". Guarda a
   * VERSÃO, não um booleano: quando o aviso mudar de conteúdo, sobe-se
   * `VERSAO_AVISO` em `layout/aviso-v2.js` e a faixa reaparece para quem já
   * tinha dispensado — senão um aviso novo nasceria invisível justamente para
   * quem mais acompanha o projeto. Temporária, sai com a faixa. */
  { chave: 'aviso:v2', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'mark11:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'academia:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'arcade:current', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'arcade:players', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'arsenal:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'calc:cientifica', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'calc:numerica', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'calculadoras:active', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'ciberseg:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'cripto:active', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'dolar:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'dossie:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'economia:cache', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'elites:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'graficos:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'guia-pc:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'json-studio:input', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'logic-sim:circuit', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'logic-sim:saved', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'militar-enc:cat', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'modpack:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'morse:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'musicas:custom', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'nexus:lastTab', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'paleta:recentes', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'periodic:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'qr-studio:mode', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'qr-studio:text', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'radio:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'regex:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'robotica:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'simbolos:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'tabela-verdade:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'universo:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'videos:state', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'voice:lang', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'voice:on', versao: 1, classe: 'local', migrar: IDENTIDADE },
  { chave: 'webllm:semF16', versao: 1, classe: 'local', migrar: IDENTIDADE }
];

/**
 * ℹ️ O que **não** está aqui, e por quê.
 *
 * **`sessionStorage`.** Sete lugares usam `sessionStorage` direto (guarda do
 * reload de chunk, `booted` da intro, `sw:recarregou`, a sessão da Ponte Shadow,
 * flags de page-view/beacon/visita). Eles **continuam diretos de propósito**: o
 * wrapper é `localStorage`, que persiste para sempre, e a razão de existirem é
 * exatamente morrer quando a aba fecha. Migrá-los trocaria a semântica —
 * "já recarreguei uma vez" virando permanente transformaria a guarda anti-loop
 * do boot num bloqueio permanente. São flags de sessão, não dado do operador,
 * e todos já tratam a ausência de storage.
 *
 * **O cache da Wikipédia.** Passa pelo wrapper (`utils/wikipedia.js`), mas não
 * tem esquema: as chaves são dinâmicas (`wiki:sum:<lang>:<título>`) e esquema é
 * por chave. O que importava ali era o namespace, não a versão.
 *
 * **A varredura da `/shadow`.** Continua lendo `localStorage` cru porque o
 * trabalho dela é *medir* o que está gravado, incluindo o que o wrapper não
 * escreveu. É o único lugar onde acesso cru é a resposta certa.
 */

/* ==============================================================
 *  3. FLAGS — a tabela de estabilidade da 1.0.0
 * ============================================================== */

/**
 * Esta é a tabela que responde "o que a 1.0.0 promete?". O que está `estavel`
 * aqui é o que a issue #420 exige que seja previsível, testado, recuperável e
 * seguro. Promover algo para `estavel` é assumir isso — não é editar uma
 * palavra.
 */
export const FLAGS = [
  /* ── Estável: o que a 1.0.0 promete ────────────────────────────────────── */
  { id: 'core', nivel: 'estavel', padrao: true, descricao: 'Router, estado, eventos, storage' },
  { id: 'arsenal', nivel: 'estavel', padrao: true, descricao: 'Arsenal e Centro Militar' },
  { id: 'biblioteca', nivel: 'estavel', padrao: true, descricao: 'Biblioteca e Crônicas' },
  { id: 'calculadoras', nivel: 'estavel', padrao: true, descricao: 'Calculadoras e conversores' },
  { id: 'cripto', nivel: 'estavel', padrao: true, descricao: 'Criptografia e esteganografia' },
  { id: 'pwa', nivel: 'estavel', padrao: true, descricao: 'PWA e Service Worker' },

  /* ── Beta: funciona, ainda não cumpre todos os critérios ────────────────── */
  { id: 'jarvis', nivel: 'beta', padrao: true, descricao: 'JARVIS (chat e provedores)' },
  { id: 'terminal', nivel: 'beta', padrao: true, descricao: 'Terminal web (filesystem virtual)' },
  { id: 'editor', nivel: 'beta', padrao: true, descricao: 'Editor de código' },
  { id: 'media', nivel: 'beta', padrao: true, descricao: 'Media, FFT e áudio' },
  { id: 'gitNexus', nivel: 'beta', padrao: true, ambiente: 'app', descricao: 'Git Nexus com o motor real (só no Launcher)' },

  /* ── Experimental: nunca ligado por padrão (o motor de flags recusa) ────── */
  { id: 'jarvisAgente', nivel: 'experimental', descricao: 'JARVIS escolhendo ferramentas sozinho' },
  { id: 'nexusSync', nivel: 'experimental', descricao: 'Sincronização distribuída do Nexus' },
  { id: 'mcp', nivel: 'experimental', descricao: 'Baluarte como servidor MCP (V2 — ver docs/architecture/v2-vision.md)' }
];

/* ==============================================================
 *  Aplicação
 * ============================================================== */

/* Evita que o `importar()` da restauração dispare uma regravação do que
 * acabou de ser lido — barulho no boot e uma escrita à toa por sessão. */
let restaurando = false;

function persistirPermissoes() {
  if (restaurando) return;
  storage.set('permissoes', permissoes.exportar());
}

/**
 * Declara tudo e liga os motores ao ambiente. Idempotente: chamar duas vezes
 * não duplica nada (declarar é idempotente, conceder também).
 *
 * @param {{ambiente?:'web'|'app', search?:string}} [ctx]
 *        `ambiente` — de `window.baluarte.native`; `search` — de `location.search`.
 * @returns {{permissoes:number, esquemas:number, flags:number, primeiroBoot:boolean}}
 */
export function aplicarPolitica(ctx = {}) {
  /* ── 1. Declarações ─────────────────────────────────────────────────────── */
  permissoes.declararTodas(PERMISSOES);
  for (const e of ESQUEMAS) {
    registrarEsquema(e.chave, { versao: e.versao, classe: e.classe, migrar: e.migrar });
  }
  flags.declararTodas(FLAGS);

  /* ── 2. Ambiente ────────────────────────────────────────────────────────── */
  /* Antes de qualquer consulta a flag: uma flag app-only precisa saber onde
   * está para responder. O padrão do motor já é 'web' (o caso mais fechado). */
  flags.configurarAmbiente(ctx.ambiente === 'app' ? 'app' : 'web');

  /* ── 3. Flags: persistência + override de URL ────────────────────────────── */
  flags.conectarPersistencia({
    ler: () => storage.get('flags', {}) || {},
    gravar: (obj) => storage.set('flags', obj)
  });
  if (ctx.search) flags.aplicarDaURL(ctx.search);

  /* ── 4. Permissões: restaura ou semeia ──────────────────────────────────── */
  const salvo = storage.get('permissoes', null);
  const primeiroBoot = !salvo;

  restaurando = true;
  try {
    if (salvo) {
      permissoes.importar(salvo);
    } else {
      permissoes.conceder(PADRAO_OPERADOR, { origem: 'boot:padrao-operador' });
    }
  } finally {
    restaurando = false;
  }
  /* Grava sempre no primeiro boot: sem isso o padrão seria "reconcedido" a cada
   * sessão, e uma revogação do operador voltaria sozinha na próxima. */
  if (primeiroBoot) persistirPermissoes();

  /* Mudança posterior (o operador liga/desliga no /diagnostico) persiste. */
  bus.on('permissions:concedida', persistirPermissoes);
  bus.on('permissions:revogada', persistirPermissoes);

  return {
    permissoes: PERMISSOES.length,
    esquemas: ESQUEMAS.length,
    flags: FLAGS.length,
    primeiroBoot
  };
}

/** Fotografia completa da política — alimenta `/diagnostico`. */
export function estadoPolitica() {
  return {
    permissoes: permissoes.estado(),
    esquemas: storage.estadoEsquemas(),
    flags: flags.listar(),
    porNivel: flags.porNivel(),
    ambiente: flags.ambiente()
  };
}
