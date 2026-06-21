/**
 * Página /perfil — Dossiê do Operador (redesign #195: 3D/imersivo).
 *
 * Identidade do operador + estatísticas do projeto + configurações, no estilo
 * cinematográfico do redesign (emblema com anel girando, brilho neon, cards com
 * glow/lift, parallax sutil do brilho com o mouse).
 */

import '../styles/perfil.css';
import { h } from '../utils/helpers.js';
import { createHeroWebGL } from '../utils/hero-webgl.js';
import { createHeroField } from '../utils/hero3d.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { router } from '../core/router.js';
import { VERSION } from '../data/version.js';
import { THEMES, getThemeId, setTheme } from '../utils/theme.js';
import { UNIVERSE_SKINS, getUniverseId, setUniverse } from '../utils/universe-theme.js';

const STORAGE_KEY = 'perfil:config';

function loadConfig() {
  return storage.get(STORAGE_KEY) || {
    nome: 'Lucas Belucci Bellini',
    callsign: 'OMEGA-01',
    reduceMotion: false,
    confirmActions: true
  };
}

const STATS = [
  { label: 'Versão', value: 'v' + VERSION, icon: '◆' },
  { label: 'Rotas ativas', value: '60+', icon: '◫' },
  { label: 'Ferramentas', value: '40', icon: '⚙' },
  { label: 'Equipes catalogadas', value: '26', icon: '◆' },
  { label: 'Arcos das Crônicas', value: '24', icon: '◫' },
  { label: 'Capítulos da saga', value: '1127', icon: '⌨' }
];

const LINKS = [
  { label: 'Repositório GitHub', url: 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte', icon: '⎇' },
  { label: 'Crônicas da Baluarte', route: '/biblioteca', icon: '◫' },
  { label: 'Hub de Ferramentas', route: '/ferramentas', icon: '⚙' },
  { label: 'Ponte de Comando', route: '/home', icon: '⬡' }
];

function sectionTitle(icon, title) {
  return h('div', { className: 'pf-section' },
    h('span', { className: 'pf-section__icon' }, icon),
    h('h2', { className: 'pf-section__title' }, title));
}

export function perfilPage() {
  const config = loadConfig();
  const page = h('div', { className: 'page-perfil' });

  /* ---- cabeçalho ---- */
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'PERFIL')),
      h('h1', { className: 'page-header__title' }, '◔ Perfil do Operador'),
      h('p', { className: 'page-header__description' },
        'Identidade, estatísticas do projeto e configurações da plataforma.'))
  );

  /* ---- HERO / dossiê ---- */
  const scopeCanvas = h('canvas', { className: 'pf-hero__canvas', 'aria-hidden': 'true' });
  const hero = h('div', { className: 'pf-hero anim-fade-in' },
    scopeCanvas,
    h('span', { className: 'pf-hud__br pf-hud__br--tl', 'aria-hidden': 'true' }),
    h('span', { className: 'pf-hud__br pf-hud__br--br', 'aria-hidden': 'true' }),
    h('div', { className: 'pf-hero__scan', 'aria-hidden': 'true' }),
    h('div', { className: 'pf-emblem' },
      h('span', { className: 'pf-emblem__ring' }),
      h('span', { className: 'pf-emblem__core' }, h('span', { className: 'pf-emblem__glyph' }, 'Ω'))),
    h('div', { className: 'pf-id' },
      h('div', { className: 'pf-kicker' }, 'Dossiê do Operador · Clearance OMEGA'),
      h('h2', { className: 'pf-name' }, config.nome),
      h('div', { className: 'pf-callsign' },
        h('span', { className: 'dot' }), 'CALLSIGN ', h('strong', null, config.callsign), ' · ONLINE'),
      h('div', { className: 'pf-badges' },
        h('span', { className: 'pf-badge pf-badge--omega' }, 'CLEARANCE OMEGA'),
        h('span', { className: 'pf-badge pf-badge--alfa' }, 'EQUIPE ALFA'),
        h('span', { className: 'pf-badge pf-badge--tango' }, 'EQUIPE TANGO')),
      h('p', { className: 'pf-bio' },
        'Operador-líder e arquiteto do Núcleo Infinity Dreadnought. ',
        'Responsável pelo Mark XIII — 13ª iteração do Projeto Baluarte. ',
        'Brasileiro. Construiu esta plataforma após 12 versões anteriores que falharam.'))
  );
  /* parallax sutil do brilho com o mouse */
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const gx = 78 + ((e.clientX - r.left) / r.width - 0.5) * 16;
    hero.style.setProperty('--gx', gx + '%');
  });
  hero.addEventListener('mouseleave', () => hero.style.setProperty('--gx', '78%'));

  /* fundo 3D nativo: variante 'scope' (mira/HUD, ref. Heart Health HUD #262),
   * com fallback 2D e auto-limpeza ao trocar de rota. */
  let pfFx = createHeroWebGL(scopeCanvas, { accent: '#00f0ff', accent2: '#ff00aa', variant: 'scope' });
  if (!pfFx) pfFx = createHeroField(scopeCanvas, { accent: '#00f0ff', accent2: '#ff00aa' });
  pfFx.start();
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(hero)) { try { pfFx.destroy(); } catch {} mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  page.appendChild(hero);

  /* ---- estatísticas ---- */
  page.appendChild(sectionTitle('◎', 'Estatísticas do Projeto'));
  page.appendChild(
    h('div', { className: 'pf-stats' },
      ...STATS.map((s) =>
        h('div', { className: 'pf-stat' },
          h('div', { className: 'pf-stat__icon' }, s.icon),
          h('div', { className: 'pf-stat__value' }, s.value),
          h('div', { className: 'pf-stat__label' }, s.label))))
  );

  /* ---- acesso rápido ---- */
  page.appendChild(sectionTitle('⊳', 'Acesso Rápido'));
  page.appendChild(
    h('div', { className: 'pf-links' },
      ...LINKS.map((l) =>
        h('button', {
          className: 'pf-link',
          onclick: () => {
            if (l.url) window.open(l.url, '_blank', 'noopener');
            else if (l.route) router.navigate(l.route);
          }
        },
          h('span', { className: 'pf-link__icon' }, l.icon),
          h('span', { className: 'pf-link__label' }, l.label),
          h('span', { className: 'pf-link__arrow' }, l.url ? '↗' : '→'))))
  );

  /* ---- configurações ---- */
  page.appendChild(sectionTitle('⚙', 'Configurações'));

  function toggle(key, label, desc) {
    const cb = h('input', {
      type: 'checkbox',
      checked: config[key],
      onchange: (e) => {
        config[key] = e.target.checked;
        storage.set(STORAGE_KEY, config);
        if (key === 'reduceMotion') {
          document.documentElement.classList.toggle('reduce-motion', config[key]);
        }
        toast(`${label}: ${config[key] ? 'ativado' : 'desativado'}`, { type: 'info' });
      }
    });
    return h('label', { className: 'pf-toggle' },
      h('div', null,
        h('div', { className: 'pf-toggle__label' }, label),
        h('div', { className: 'pf-toggle__desc u-text-muted' }, desc)),
      cb);
  }

  const nomeInput = h('input', {
    className: 'input pf-input', type: 'text', value: config.nome,
    oninput: (e) => { config.nome = e.target.value; storage.set(STORAGE_KEY, config); }
  });
  const callsignInput = h('input', {
    className: 'input pf-input', type: 'text', value: config.callsign,
    oninput: (e) => { config.callsign = e.target.value; storage.set(STORAGE_KEY, config); }
  });

  page.appendChild(
    h('div', { className: 'pf-config' },
      h('label', { className: 'pf-field' }, h('span', null, 'NOME'), nomeInput),
      h('label', { className: 'pf-field' }, h('span', null, 'CALLSIGN'), callsignInput),
      h('div', { className: 'pf-field' },
        h('span', null, 'TEMA'),
        h('div', { className: 'pf-themes' },
          ...THEMES.map((t) => h('button', {
            className: 'pf-theme' + (t.id === getThemeId() ? ' is-active' : ''),
            'data-theme': t.id, title: t.label,
            onclick: () => {
              setTheme(t.id);
              document.querySelectorAll('.pf-theme[data-theme]').forEach((b) =>
                b.classList.toggle('is-active', b.dataset.theme === t.id));
              toast('Tema: ' + t.label, { type: 'info' });
            }
          },
            h('span', {
              className: 'pf-theme__sw',
              style: { background: `linear-gradient(135deg, ${t.primary} 0 50%, ${t.secondary} 50% 100%)` }
            }),
            t.label))) ),
      h('div', { className: 'pf-field' },
        h('span', null, 'UNIVERSO (skin do site)'),
        h('div', { className: 'pf-themes' },
          ...UNIVERSE_SKINS.map((u) => h('button', {
            className: 'pf-theme' + (u.id === getUniverseId() ? ' is-active' : ''),
            'data-universe-btn': u.id, title: u.label,
            onclick: () => {
              setUniverse(u.id);
              document.querySelectorAll('[data-universe-btn]').forEach((b) =>
                b.classList.toggle('is-active', b.dataset.universeBtn === u.id));
              toast('Universo: ' + u.label, { type: 'info' });
            }
          },
            h('span', {
              className: 'pf-theme__sw',
              style: { background: `linear-gradient(135deg, ${u.primary} 0 50%, ${u.secondary} 50% 100%)` }
            }),
            u.label))) ),
      h('p', { className: 'u-text-muted', style: { fontSize: '11px', margin: '-4px 0 4px' } },
        '🌌 15 universos com skin completo — cor, tipografia, formas e atmosfera próprias.'),
      toggle('reduceMotion', 'Reduzir animações', 'Desativa transições e efeitos de movimento.'),
      toggle('confirmActions', 'Confirmar ações destrutivas', 'Pede confirmação antes de limpar dados.'),
      h('div', { className: 'pf-danger' },
        h('button', {
          className: 'btn btn--ghost btn--sm u-text-danger',
          onclick: () => {
            if (confirm('Isto apaga TODOS os dados locais do Baluarte (editor, terminal, configs, progresso). Continuar?')) {
              const keys = [];
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith('baluarte:')) keys.push(k);
              }
              keys.forEach((k) => localStorage.removeItem(k));
              toast('Todos os dados locais foram apagados', { type: 'warning' });
              setTimeout(() => location.reload(), 1000);
            }
          }
        }, '⚠ Limpar todos os dados locais')))
  );

  return page;
}
