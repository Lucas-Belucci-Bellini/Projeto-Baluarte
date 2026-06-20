/**
 * /git-nexus (GATE leve) — mega-plano #238, Fase 2.
 *
 * A experiência completa do Git Nexus é PESADA: o `git-nexus.js` importa o grafo
 * 3D + `codemap` + `codemap-symbols` (~460 KB) + `jarvis-brain`. Pela regra
 * "web = leve / app = completo", este gate é quem a rota /git-nexus carrega — e
 * ele NÃO importa nada pesado de forma estática:
 *
 *   • App desktop (`window.baluarte.native`) → faz `import()` da experiência
 *     completa (`git-nexus.js`, export `gitNexusPage`). O chunk pesado só baixa aqui.
 *   • Web puro → mostra um teaser "abre no app" (CTA pra /baixar) + atalho pro
 *     Raio-X do Código (versão leve). O chunk pesado NUNCA é baixado.
 *
 * Como este módulo só importa `helpers` + `router`, a rota /git-nexus na web fica
 * minúscula e o boot do site não arrasta o grafo 3D nem os mapas de código.
 *
 * Obs.: o gate vive num arquivo separado de propósito — o `git-nexus.js` (a
 * implementação completa) fica intocado, então não há renomeação de arquivo
 * analisado (o que reabriria alertas pré-existentes do scanner por mudança de
 * fingerprint de caminho).
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';

/** Roda DENTRO do Baluarte Launcher? (a ponte só existe no app). */
function isNative() {
  return typeof window !== 'undefined' && !!window.baluarte && window.baluarte.native === true;
}

export function gitNexusGate(args) {
  /* Web puro: teaser leve, sem tocar no chunk pesado. */
  if (!isNative()) return gitNexusTeaser();

  /* App: carrega o cockpit do Núcleo de IA sob demanda (só aqui o pesado vem).
   * O cockpit traz a aba "Grafo de Código" (a experiência completa) + as
   * ferramentas IA, cada uma carregada sob demanda dentro dele. */
  const host = h('div', { className: 'page-gitnexus' },
    h('div', { className: 'gn-loading anim-fade-in' },
      h('span', { className: 'gn-loading__orb' }),
      h('p', { className: 'u-text-muted' }, 'Acordando o Núcleo de IA…')));

  import('./git-nexus-cockpit.js')
    .then((m) => { empty(host); host.appendChild(m.gitNexusCockpit(args)); })
    .catch((err) => {
      console.error('[git-nexus] falha ao carregar o Núcleo de IA:', err);
      empty(host);
      host.appendChild(gitNexusTeaser({ failed: true }));
    });

  return host;
}

/**
 * Teaser leve (web) — explica que o Git Nexus completo (grafo 3D + motor real)
 * vive no app e leva pro download. Reaproveita as classes globais (.gn-*, .btn).
 */
function gitNexusTeaser({ failed = false } = {}) {
  const page = h('div', { className: 'page-gitnexus' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'NÚCLEO DE IA')),
      h('h1', { className: 'page-header__title' }, '🔗 Núcleo de IA'),
      h('p', { className: 'page-header__description' },
        'O hub de IA do Baluarte — ', h('span', { className: 'u-text-cyan' }, 'grafo de código em 3D'),
        ', JARVIS, memória, segundo cérebro, ML, APIs e mais, num cockpit só. ',
        'É a parte pesada da plataforma: roda completa no app desktop.'))
  );

  page.appendChild(
    h('div', { className: 'gn-teaser anim-fade-in' },
      h('div', { className: 'gn-teaser__orb', 'aria-hidden': 'true' },
        h('span', { className: 'gn-teaser__ring' }),
        h('span', { className: 'gn-teaser__ring gn-teaser__ring--b' }),
        h('span', { className: 'gn-teaser__dot' })),
      h('h2', { className: 'gn-teaser__title' },
        failed ? 'Não deu pra abrir o Núcleo de IA aqui' : 'O Núcleo de IA roda no app'),
      h('p', { className: 'gn-teaser__lead' },
        'Pra manter o site leve e rápido, a seção de IA inteira — grafo 3D + mapas de código, ',
        'JARVIS, memória, segundo cérebro, ML, Mini-LLM e o ',
        h('span', { className: 'u-text-cyan' }, 'motor real (gitnexus serve)'),
        ' — fica no ', h('strong', null, 'Baluarte Launcher'),
        ', onde dá pra rodar pesado sem as travas do navegador.'),
      h('div', { className: 'gn-teaser__feats' },
        teaserFeat('🧠', 'Grafo + motor real', 'Git Nexus em 3D ligado ao motor (tree-sitter + LadybugDB).'),
        teaserFeat('◉', 'JARVIS & cérebro', 'Assistente, memória durável e o Segundo Cérebro, num cockpit.'),
        teaserFeat('📈', 'ML & Mini-LLM', 'Aprendizado da memória e o laboratório de LLM do zero.')),
      h('div', { className: 'gn-teaser__cta' },
        h('button', { className: 'btn btn--primary', onclick: () => router.navigate('/baixar') }, '⬇ Baixar o app'),
        h('button', { className: 'btn', onclick: () => router.navigate('/codigo') }, '🔬 Ver o Raio-X do Código (web)')),
      h('p', { className: 'gn-teaser__hint u-text-muted' },
        'Já está no app? Abra esta página por lá que o Núcleo de IA carrega automaticamente.'))
  );

  return page;
}

function teaserFeat(icon, title, desc) {
  return h('div', { className: 'gn-teaser__feat' },
    h('div', { className: 'gn-teaser__feat-icon' }, icon),
    h('div', null,
      h('div', { className: 'gn-teaser__feat-title' }, title),
      h('div', { className: 'gn-teaser__feat-desc u-text-muted' }, desc)));
}
