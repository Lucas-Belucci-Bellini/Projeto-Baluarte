/**
 * Banco de prova: a fundação da V2 dirigindo o router REAL da V1.
 *
 * A pergunta que este arquivo responde, e que nenhum teste com mock responde:
 * **o boot da V2 consegue servir as páginas da V1?**
 *
 * Se a resposta fosse não, o lugar de descobrir é aqui — num arquivo
 * descartável — e não depois de reescrever o `main.js` do site.
 */

import { criarRegistry } from '../core/registry.js';
import { criarBoot } from '../core/boot.js';
/* A fachada operacional. O banco de prova dirigia o `boot` na mão — subia e
 * pronto, sem supervisor, sem saúde, sem status de lifecycle. As três peças
 * existiam e eram testadas em isolamento, mas nada as compunha em execução
 * real, então "a fundação está de pé" era verdade em teste e hipótese em campo.
 * Passar por aqui é o que torna o entrypoint oficial equivalente ao que a V2
 * promete entregar. */
import { criarPlataforma } from '../core/plataforma.js';
import { criarBus } from '../core/bus.js';
import { criarLog, definirDestino } from '../core/log.js';
/* O módulo nativo usa métricas, escalonador e contratos. Sem injetá-los aqui, o
 * contexto não os expõe e a view quebra no primeiro clique — construir o
 * ambiente pela metade é o jeito mais fácil de "passar" sem funcionar. */
import { criarMetricas } from '../core/metricas.js';
import { criarEscalonador } from '../core/trabalho.js';
import { criarResolvedorApi } from '../core/api.js';
/* Sem o decisor, o `militar` — que declara NETWORK — nem monta contexto. É de
 * propósito: um Core que serve módulo com permissão declarada e não tem a quem
 * perguntar está mal montado, e o lugar de descobrir isso é aqui. */
import { criarPermissoes } from '../core/permissoes.js';
/* O Runtime Host por módulo. Existia, era testado, e tinha um único consumidor
 * de produção — o `vertical-slice.js`, que não é o caminho por onde os módulos
 * sobem. Ligá-lo aqui é o que faz `running` significar "autorização disponível"
 * em campo, e não só na definição. */
import { criarLifecycleRuntime } from '../core/module-runtime-lifecycle.js';
import { criarGrantRuntime } from '../core/runtime-bootstrap.js';
/* O Runtime do renderer: IPC, não stdio. Devolve `null` fora do app. */
import { criarRuntimeApp } from '../core/runtime-app.js';
import { criarRuntimeHealth } from '../core/module-runtime-health.js';
import { criarModuleRegistryHealth } from '../core/module-registry-health.js';

/* O router da V1, sem alteração nenhuma. É o ponto: adaptar, não reescrever. */
import { router } from '../../src/core/router.js';
/* O bus da V1 — o router NÃO monta nada, ele emite `route:change` e quem monta
 * é o `shell.js`. Achado no banco de prova: sem assinar este evento, as 17
 * rotas registram e a tela fica vazia. É a peça que o `main.js` do site vai
 * precisar ligar quando a V2 assumir. */
import { bus as busV1 } from '../../src/core/events.js';
import { storage } from '../../src/core/storage.js';
import { aplicarPolitica } from '../../src/core/politica.js';
import { createRegistryNavigationObserver } from '../../src/layout/registry-observer.ts';
import { projectRegistryNavigation } from '../../src/layout/navigation.ts';
import { projectCommandCenter, searchCommandCenter } from '../../src/layout/command-center.ts';
import { reconcileNavigationCatalogs } from '../../src/layout/catalog-reconciliation.ts';
import { decideModuleAlignment } from '../../src/layout/module-alignment.ts';
import { evaluatePromotionGate } from '../../src/layout/promotion-gate.ts';
import { projectPlatformDiagnostic } from '../../src/layout/runtime-observation.ts';
import { projectPlatformDiagnosticEnvelope, sealPlatformObservationEnvelope } from '../../src/layout/platform-observation-transport.ts';

import cripto from '../modules/cripto/module.js';
import editor from '../modules/editor/module.js';
import militar from '../modules/militar/module.js';
import briefing from '../modules/briefing/module.js';
/* O consumidor do engine 3D. Sem ele o `cena.js` teria testes e nenhum caminho
 * de execução — preparação que não vira peça viva. */
import visor3d from '../modules/visor3d/module.js';

/* Expõe os registros para o teste de navegador inspecionar sem depender de
 * texto na tela — asserção sobre pixel é frágil, sobre estado não. */
const registros = [];
definirDestino((r) => { registros.push(r); console.log(`[${r.modulo}] ${r.msg}`, r.campos ?? ''); });

const log = criarLog('harness');

async function principal() {
  /* A política da V1 declara as chaves; sem ela o storage cai no fallback. */
  aplicarPolitica();

  const registry = criarRegistry();
  [cripto, editor, militar, briefing, visor3d].forEach((m) => registry.registrar(m));
  const selo = registry.selar();
  /* O diagnóstico do Registry agora observa a saúde do boot real. Ele continua
   * sendo um adaptador de observabilidade: não concede permissões, não inicia
   * módulos e não substitui a autorização server-side. */
  const runtimeHealth = criarRuntimeHealth();
  const registryHealth = criarModuleRegistryHealth(registry, runtimeHealth);

  const bus = criarBus({ log });
  const metricas = criarMetricas();
  const trabalho = criarEscalonador({ limite: 4 }, { log, metricas });
  const apis = criarResolvedorApi(registry, { log });
  /* SEM política: nenhum módulo recebe nada. É o estado padrão do sistema, não
   * uma escolha do banco de prova — e é o que faz `militar` subir com NETWORK
   * declarada e negada, que é exatamente o que se quer ver funcionando. */
  const permissoes = criarPermissoes({ bus });

  /* O Host real, com a AUTORIZAÇÃO como sessão e sem transporte — o transporte
   * concreto é item posterior da fila, e inventá-lo aqui seria construir a
   * fronteira antes de o contrato dela estar fechado.
   *
   * O que isto prova: o ciclo pede autorização a cada módulo antes do `init`, e
   * `criarGrantRuntime` levanta se o registry não estiver selado ou o módulo não
   * estiver ativo. O que NÃO prova: nada sobre o Runtime Rust, que não existe no
   * navegador. Grant vazio é autorização disponível — `militar` sobe com NETWORK
   * declarada e negada, como antes; "sem permissão concedida" não é "sem
   * autorização", e confundir os dois derrubaria um módulo correto. */
  const runtime = criarLifecycleRuntime(registry, {
    abrir: async (reg, perm, id) => { criarGrantRuntime(reg, perm, id); },
    fechar: async () => {}
  }, permissoes);

  const saida = document.getElementById('saida');

  /* A alça de Runtime que os módulos recebem no contexto. `null` fora do app —
   * e `null` faz `deps.runtime` ficar indefinido, devolvendo ao contexto a forma
   * exata que ele tinha antes desta linha. É o gate do mega-plano #238: web
   * leve, app completo.
   *
   * O Host acima continua autorizando LOCALMENTE (`criarGrantRuntime`), mesmo no
   * app. É de propósito: quem cobra `READ_FILES` de verdade é o Runtime, na hora
   * da leitura, e trocar a autorização local pela nativa faria um binário ausente
   * derrubar módulos que hoje sobem. Autorização local + uso nativo não afrouxa
   * nada — o Rust nega a leitura de quem não recebeu a permissão. */
  const runtimeApp = criarRuntimeApp(registry, permissoes, globalThis.baluarte);

  /* O ambiente, deduzido da MESMA detecção que o adaptador do Runtime usa.
   *
   * Sem esta linha a regra de `ambiente` existia no ciclo e ninguém a chamava —
   * peça pronta e desligada, criada na mesma rodada em que outra foi consertada.
   * O manifesto declara, o `manifest.js` valida, o ciclo aplica, e é AQUI que
   * alguém finalmente informa onde estamos.
   *
   * Uma fonte só para as duas perguntas ("tenho Runtime?" e "sou app?") não é
   * economia: duas detecções divergiriam no dia em que uma mudasse, e o sistema
   * passaria a se achar app para um lado e web para o outro. */
  const ambiente = globalThis.baluarte?.native === true ? 'app' : 'web';

  const navigationObserver = createRegistryNavigationObserver({
    currentPhase: 21,
  });

  const boot = criarBoot(
    registry,
    { storage, bus, metricas, trabalho, apis, permissoes, ...(runtimeApp ? { runtime: runtimeApp } : {}) },
    {
    router,
    renderNav: (itens) => {
      /* UI-03 observa e compara; não substitui renderSidebar() nem publica
       * disponibilidade no shell V1. A superfície #nav pertence somente ao
       * harness, que é um banco de prova da V2. */
      navigationObserver.observe(itens);
      const nav = document.getElementById('nav');
      nav.innerHTML = '';
      for (const item of itens) {
        const a = document.createElement('a');
        a.href = `#${item.path}`;
        /* `textContent`, não `innerHTML`: o nome vem do manifesto, que é dado de
         * módulo — e dado de módulo é entrada não confiável (Regra 37). */
        a.textContent = `${item.icone ?? ''} ${item.nome}`;
        nav.appendChild(a);
      }
    }
  }, { runtime, health: runtimeHealth, ambiente });

  /* Quem sobe agora é a Plataforma, não o boot. O supervisor decide `ready` ou
   * `degraded` a partir das falhas, e a saúde/lifecycle passam a existir em
   * runtime — não só em teste unitário. */
  const plataforma = criarPlataforma(registry, boot, { registryHealth });
  const partida = await plataforma.iniciar();
  /* `iniciar()` devolve `{ estado, duracaoMs, resultado, diagnostico }`; o
   * `resultado` é o que `boot.subir()` devolvia. Na chamada idempotente ele vem
   * ausente — não acontece aqui (partida única), mas o banco de prova é onde se
   * descobre o caso raro, então falhamos alto em vez de dar `undefined` seis
   * linhas adiante. */
  const r = partida.resultado;
  if (!r) throw new Error(`plataforma não subiu: estado "${partida.estado}"`);

  /* O ciclo já atualizou o mesmo RuntimeHealth durante as transições reais de
   * runtime → init → start. Não repetimos as marcações aqui: uma falha repetida
   * artificialmente consumiria orçamento de restart e mentiria sobre a saúde. */
  document.getElementById('resumo').textContent =
    `${r.vivos.length} módulos · ${r.rotas} rotas · ${r.nav.length} na navegação` +
    (r.falhas.length ? ` · ${r.falhas.length} falhas` : ' · sem falhas');

  router.setNotFound(() => {
    const d = document.createElement('div');
    d.textContent = 'rota não encontrada';
    return d;
  });

  /* A montagem: o router resolve e ANUNCIA; quem escuta decide onde põe. É um
   * desenho bom — desacopla resolução de renderização — e é justamente por isso
   * que não dá pra "só registrar rotas" e esperar tela. */
  const montar = ({ view }) => {
    saida.replaceChildren();
    if (view instanceof Node) saida.appendChild(view);
    else if (view) saida.textContent = `view não é um nó: ${typeof view}`;
  };
  busV1.on('route:change', montar);
  busV1.on('route:notfound', montar);
  busV1.on('route:error', ({ error }) => {
    saida.textContent = `falha ao carregar: ${error?.message ?? error}`;
    saida.dataset.erro = '1';
  });

  router.start('/cripto');

  const commandCenterPilot = () => {
    const registryNavigation = projectRegistryNavigation(r.nav);
    const center = projectCommandCenter(registryNavigation, [
      { id: 'global', label: 'Global', icon: '⌂', domainIds: ['inicio'], order: 1 },
      { id: 'ia', label: 'IA', icon: '◉', domainIds: ['ia-jarvis'], order: 2 },
      { id: 'development', label: 'Desenvolvimento', icon: '</>', domainIds: ['codigo-dev', 'caixa-de-ferramentas'], order: 3 },
      { id: 'knowledge', label: 'Conhecimento', icon: '◇', domainIds: ['conhecimento'], order: 4 },
      { id: 'creative', label: 'Criativo', icon: '✦', domainIds: ['criativo', 'midia'], order: 5 },
      { id: 'ecosystem', label: 'Ecossistema', icon: '⬡', domainIds: ['ecossistema'], order: 6 },
    ]);
    return {
      projection: center,
      search: searchCommandCenter(center, 'editor'),
    };
  };

  const moduleAlignmentPilot = () => {
    const reconciliation = reconcileNavigationCatalogs(r.nav, { currentPhase: 21 });
    const healthByModule = new Map(
      registryHealth.resumo().map((entry) => [entry.id, entry]),
    );
    const knownRoutes = typeof router.list === 'function' ? router.list() : [];

    return reconciliation.rows
      .filter((row) => row.registryModuleId !== null)
      .map((row) => {
        const health = row.registryModuleId
          ? healthByModule.get(row.registryModuleId)
          : undefined;
        const fallback = row.disposition === 'registry-only'
          ? 'registry-observation'
          : 'v1-preserved';
        return decideModuleAlignment(row, {
          health: {
            mode: health?.mode ?? 'unregistered',
            status: health?.status ?? 'unregistered',
            source: health ? 'runtime-registry' : 'unknown',
          },
          deepLink: knownRoutes.includes(row.path) ? 'verified' : 'broken',
          fallback,
        });
      });
  };

  const promotionGatePilot = () => {
    const editor = moduleAlignmentPilot().find((decision) => decision.path === '/editor');
    if (!editor) return null;
    return evaluatePromotionGate({
      alignment: editor,
      authority: {
        source: 'unknown',
        permitted: false,
        actorRole: 'unknown',
        requestId: null,
        auditId: null,
      },
      rollback: {
        reversible: true,
        fallbackPath: '/editor',
        rollbackReference: 'commit:24685606',
      },
    });
  };

  const renderCommandCenterVisualPilot = () => {
    const root = document.getElementById('command-center-pilot');
    const categoriesElement = document.getElementById('command-center-categories');
    const empty = document.getElementById('command-center-empty');
    const searchInput = document.getElementById('command-center-search');
    const status = document.getElementById('command-center-status');
    if (!root || !categoriesElement || !empty || !searchInput || !status) return;

    const pilot = commandCenterPilot();
    const query = searchInput.value;
    const matches = new Set(searchCommandCenter(pilot.projection, query).map((command) => command.id));
    const hasQuery = query.trim() !== '';
    let visibleCommands = 0;
    let visibleCategories = 0;
    categoriesElement.replaceChildren();

    for (const category of pilot.projection.categories) {
      const commands = category.commands.filter((command) => !hasQuery || matches.has(command.id));
      if (commands.length === 0) continue;
      visibleCategories += 1;
      visibleCommands += commands.length;

      const section = document.createElement('section');
      section.className = 'pilot-category';
      section.dataset.categoryId = category.id;
      section.setAttribute('aria-labelledby', `pilot-category-${category.id}`);

      const heading = document.createElement('h2');
      heading.id = `pilot-category-${category.id}`;
      heading.textContent = `${category.icon} ${category.label}`;
      const count = document.createElement('span');
      count.className = 'pilot-category__count';
      count.textContent = `${commands.length}`;
      heading.appendChild(count);
      section.appendChild(heading);

      for (const command of commands) {
        const link = document.createElement('a');
        link.className = 'pilot-command';
        link.href = `#${command.path}`;
        link.dataset.commandId = command.id;
        link.textContent = `${command.icon} ${command.label}`;
        const meta = document.createElement('span');
        meta.className = 'pilot-command__meta';
        meta.textContent = `${command.title} · ${command.availability} · ${command.source}`;
        link.appendChild(meta);
        section.appendChild(link);
      }
      categoriesElement.appendChild(section);
    }

    empty.hidden = visibleCommands !== 0;
    status.textContent = `${visibleCommands} comandos · ${visibleCategories} categorias · somente harness`;
    root.dataset.commandCount = String(visibleCommands);
    root.dataset.categoryCount = String(visibleCategories);
  };

  const commandCenterSearchInput = document.getElementById('command-center-search');
  commandCenterSearchInput?.addEventListener('input', renderCommandCenterVisualPilot);
  const commandCenterToggle = document.getElementById('command-center-toggle');
  commandCenterToggle?.addEventListener('click', () => {
    const root = document.getElementById('command-center-pilot');
    if (!root || !commandCenterToggle) return;
    const collapsed = root.dataset.collapsed !== 'true';
    root.dataset.collapsed = String(collapsed);
    commandCenterToggle.setAttribute('aria-expanded', String(!collapsed));
    commandCenterToggle.textContent = collapsed ? 'Expandir' : 'Recolher';
  });

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isEditable = target instanceof HTMLInputElement
      || target instanceof HTMLTextAreaElement
      || target instanceof HTMLSelectElement
      || target instanceof HTMLElement && target.isContentEditable;
    if (event.key === '/' && !isEditable) {
      event.preventDefault();
      commandCenterSearchInput?.focus();
      return;
    }
    if (event.key === 'Escape' && target === commandCenterSearchInput && commandCenterSearchInput?.value) {
      commandCenterSearchInput.value = '';
      renderCommandCenterVisualPilot();
      return;
    }
    if (event.key === 'ArrowDown' && target === commandCenterSearchInput) {
      const firstCommand = document.querySelector('#command-center-categories .pilot-command');
      if (firstCommand instanceof HTMLElement) {
        event.preventDefault();
        firstCommand.focus();
      }
    }
  });
  renderCommandCenterVisualPilot();

  /* Ponte para o teste: estado, não pixel. */
  // @ts-ignore — superfície de teste, só no banco de prova
  window.__v2 = {
    selo,
    resultado: r,
    /* Também função — e este escapou da primeira correção. Quando as métricas
     * deixaram de ser valor congelado, o `diagnostico` continuou sendo: um
     * retrato do boot, servido como se fosse o estado atual. Bastou existir algo
     * que muda em runtime (concessão de permissão) para o defeito reaparecer no
     * campo vizinho. Regra 5 dos testes, segunda vez. */
    /* Continua sendo o diagnóstico do BOOT, de propósito: o
     * `scripts/v2-integracao.mjs` lê `.modulos` daqui. A fachada entra ao lado,
     * em campo próprio — integrar não é motivo para quebrar quem já afirma. */
    diagnostico: () => boot.diagnostico(),
    /* A fachada composta: supervisor + saúde + lifecycle + boot num retrato só.
     * Função, não valor, pela mesma razão das métricas logo abaixo — estado que
     * muda em runtime servido como instantâneo mente sobre o sistema vivo. */
    plataforma: () => plataforma.diagnostico(),
    platformRuntimeObservation: () => projectPlatformDiagnostic(plataforma.diagnostico()),
    platformRuntimeObservationEnvelope: async () => sealPlatformObservationEnvelope(
      projectPlatformDiagnosticEnvelope(plataforma.diagnostico()),
    ),
    /* Como a partida terminou: `ready` ou `degraded`, e quanto demorou. Antes
     * isso não existia em lugar nenhum — o harness sabia quantos módulos
     * subiram, mas não se o sistema se considerava saudável. */
    partida: { estado: partida.estado, duracaoMs: partida.duracaoMs },
    /* Quais módulos têm sessão de Runtime aberta. FUNÇÃO pela mesma razão dos
     * vizinhos: o conjunto muda na descida, e um valor congelado no boot
     * responderia sobre o passado (Regra 5). É o que deixa o portão perguntar
     * "a autorização foi realmente pedida?" em vez de supor que foi. */
    runtimeAbertos: () => runtime.abertas(),
    /* O ambiente que o entrypoint deduziu. Exposto para o portão poder cobrar
     * que a regra é de fato INFORMADA — declarar `ambiente` no manifesto e
     * aplicá-lo no ciclo não vale nada se ninguém disser onde estamos, e esse é
     * exatamente o tipo de elo que passa despercebido por ser trivial. */
    /* O que o CICLO recebeu, não o que este arquivo calculou. A diferença é o
     * ponto: a variável local sobrevive à remoção do repasse, e uma asserção
     * sobre ela aprovaria um entrypoint que parou de informar o ambiente. */
    ambiente: boot.ciclo.ambiente,
    parar: () => plataforma.parar(),
    rotasNoRouter: router.list ? router.list() : null,
    totalRotas: router.count ? router.count() : null,
    navigationObservation: () => navigationObserver.latest(),
    commandCenterPilot,
    commandCenterVisualPilot: () => ({
      visibility: document.getElementById('command-center-pilot')?.dataset.visibility ?? 'missing',
      commandCount: document.getElementById('command-center-pilot')?.dataset.commandCount ?? '0',
      categoryCount: document.getElementById('command-center-pilot')?.dataset.categoryCount ?? '0',
      publicSidebarUntouched: true,
    }),
    commandCenterAccessibilityPilot: () => ({
      searchLabel: document.querySelector('label[for="command-center-search"]')?.textContent ?? '',
      searchShortcut: document.getElementById('command-center-search')?.getAttribute('aria-keyshortcuts') ?? '',
      toggleExpanded: document.getElementById('command-center-toggle')?.getAttribute('aria-expanded') ?? '',
      reducedMotion: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
    }),
    moduleAlignmentPilot,
    promotionGatePilot,
    registros,
    eventos: bus.contagem(),
    /* FUNÇÃO, não valor: a primeira versão tirava o retrato uma vez, no boot, e
     * o teste lia um instantâneo anterior ao clique — dava "medido: {}" com a
     * métrica funcionando. Ponte de teste que congela estado mente sobre o
     * sistema vivo. */
    metricas: () => metricas.retrato(),
    /* Idem: função, porque concessão muda em runtime e o teste precisa ver a
     * mudança, não o retrato do boot. */
    permissoes: () => permissoes.retrato(),
    conceder: (m, p) => permissoes.conceder(m, p, { origem: 'teste' }),
    revogar: (m, p) => permissoes.revogar(m, p, { origem: 'teste' }),
    /* Superfície para o teste exercitar a api sem passar pela UI. */
    api: (alvo, metodo, ...args) => apis.usar('harness', [alvo], alvo)[metodo](...args)
  };

  log.info('banco de prova pronto', { modulos: r.vivos.length, rotas: r.rotas });
  saida.dataset.pronto = '1';
}

principal().catch((err) => {
  console.error('[harness] falhou', err);
  const s = document.getElementById('saida');
  if (s) { s.textContent = `falhou: ${err.message}`; s.dataset.erro = '1'; }
  // @ts-ignore
  window.__v2 = { erro: String(err && err.message) };
});
