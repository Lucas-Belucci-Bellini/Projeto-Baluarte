/**
 * /git-nexus (GATE leve) — mega-plano #238, Fase 2.
 *
 * O Git Nexus completo é PESADO (grafo 3D + codemap + codemap-symbols ~460 KB +
 * jarvis-brain). Pela regra "web = leve / app = completo", este gate decide o
 * que carregar SEM importar nada pesado de forma estática:
 *
 *   • App desktop (`window.baluarte.native`) → faz `import()` da experiência
 *     completa (`git-nexus-full.js`). O chunk pesado só baixa aqui.
 *   • Web puro → mostra um teaser "abre no app" (CTA pra /baixar) + atalho pro
 *     Raio-X do Código (versão leve). O chunk pesado NUNCA é baixado.
 *
 * Como este módulo só importa `helpers` + `router`, a rota /git-nexus na web fica
 * minúscula e o boot do site não arrasta o grafo 3D nem os mapas de código.
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';

/** Roda DENTRO do Baluarte Launcher? (a ponte só existe no app). */
function isNative() {
  return typeof window !== 'undefined' && !!window.baluarte && window.baluarte.native === true;
}

export function gitNexusPage(args) {
  /* Web puro: teaser leve, sem tocar no chunk pesado. */
  if (!isNative()) return gitNexusTeaser();

  /* App: carrega a experiência completa sob demanda (só aqui o chunk pesado vem). */
  const host = h('div', { className: 'page-gitnexus' },
    h('div', { className: 'gn-loading anim-fade-in' },
      h('span', { className: 'gn-loading__orb' }),
      h('p', { className: 'u-text-muted' }, 'Acordando o Git Nexus…')));

  import('./git-nexus-full.js')
    .then((m) => { empty(host); host.appendChild(m.gitNexusFull(args)); })
    .catch((err) => {
      console.error('[git-nexus] falha ao carregar a experiência completa:', err);
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
        h('span', null, 'IA & JARVIS'), h('span', null, '›'), h('span', null, 'GIT NEXUS')),
      h('h1', { className: 'page-header__title' }, '🔗 Git Nexus'),
      h('p', { className: 'page-header__description' },
        'O núcleo de código em ', h('span', { className: 'u-text-cyan' }, '3D'),
        ' — grafo de conhecimento com comunidades, impacto e centralidade, ',
        'ligado ao ', h('span', { className: 'u-text-cyan' }, 'motor real do GitNexus'),
        '. É uma ferramenta pesada: roda completa no app desktop.'))
  );

  page.appendChild(
    h('div', { className: 'gn-teaser anim-fade-in' },
      h('div', { className: 'gn-teaser__orb', 'aria-hidden': 'true' },
        h('span', { className: 'gn-teaser__ring' }),
        h('span', { className: 'gn-teaser__ring gn-teaser__ring--b' }),
        h('span', { className: 'gn-teaser__dot' })),
      h('h2', { className: 'gn-teaser__title' },
        failed ? 'Não deu pra abrir o Git Nexus aqui' : 'O Git Nexus completo roda no app'),
      h('p', { className: 'gn-teaser__lead' },
        'Pra manter o site leve e rápido, o grafo 3D, os mapas de código (~460 KB) e a ',
        'conexão com o motor real ', h('span', { className: 'u-text-cyan' }, '(gitnexus serve)'),
        ' ficam no ', h('strong', null, 'Baluarte Launcher'),
        ' — onde dá pra rodar pesado sem as travas do navegador.'),
      h('div', { className: 'gn-teaser__feats' },
        teaserFeat('🧠', 'Motor real', 'Grafo de verdade (tree-sitter + LadybugDB), não o mapa de build.'),
        teaserFeat('🌐', 'Grafo 3D vivo', 'Orbe que gira: comunidades, impacto e centralidade.'),
        teaserFeat('🖥', 'Console do Nexus', 'context · impact · path · rename · query sobre o grafo.')),
      h('div', { className: 'gn-teaser__cta' },
        h('button', { className: 'btn btn--primary', onclick: () => router.navigate('/baixar') }, '⬇ Baixar o app'),
        h('button', { className: 'btn', onclick: () => router.navigate('/codigo') }, '🔬 Ver o Raio-X do Código (web)')),
      h('p', { className: 'gn-teaser__hint u-text-muted' },
        'Já está no app? Abra esta página por lá que o grafo carrega automaticamente.'))
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
