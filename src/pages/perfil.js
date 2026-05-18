/**
 * Página /perfil — Perfil do operador (Fase 18).
 *
 * Perfil de Lucas Belucci Bellini + estatísticas do projeto + configurações.
 */

import { h } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { router } from '../core/router.js';
import { VERSION } from '../data/version.js';

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
  { label: 'Rotas ativas', value: '36', icon: '◫' },
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

export function perfilPage() {
  const config = loadConfig();
  const fullPage = h('div', { className: 'page-perfil' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'PERFIL')),
      h('h1', { className: 'page-header__title' }, '◔ Perfil do Operador'),
      h('p', { className: 'page-header__description' },
        'Identidade, estatísticas do projeto e configurações da plataforma.')
    )
  );

  /* Cartão de identidade */
  fullPage.appendChild(
    h('div', { className: 'perfil-id' },
      h('div', { className: 'perfil-id__avatar' }, '⬡'),
      h('div', { className: 'perfil-id__body' },
        h('div', { className: 'perfil-id__name' }, config.nome),
        h('div', { className: 'perfil-id__callsign u-mono' }, 'Callsign: ' + config.callsign),
        h('div', { className: 'perfil-id__badges' },
          h('span', { className: 'badge badge--magenta' }, 'CLEARANCE OMEGA'),
          h('span', { className: 'badge badge--cyan' }, 'EQUIPE ALFA'),
          h('span', { className: 'badge badge--success' }, 'EQUIPE TANGO')
        ),
        h('p', { className: 'perfil-id__bio' },
          'Operador-líder e arquiteto do Núcleo Infinity Dreadnought. ',
          'Responsável pelo Mark XIII — 13ª iteração do Projeto Baluarte. ',
          'Brasileiro. Construiu esta plataforma após 12 versões anteriores que falharam.')
      )
    )
  );

  /* Estatísticas do projeto */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Estatísticas do Projeto'))
  );
  fullPage.appendChild(
    h('div', { className: 'perfil-stats' },
      ...STATS.map((s) =>
        h('div', { className: 'perfil-stat card' },
          h('div', { className: 'perfil-stat__icon' }, s.icon),
          h('div', { className: 'perfil-stat__value' }, s.value),
          h('div', { className: 'perfil-stat__label' }, s.label)
        )
      )
    )
  );

  /* Links rápidos */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Acesso Rápido'))
  );
  fullPage.appendChild(
    h('div', { className: 'perfil-links' },
      ...LINKS.map((l) =>
        h('button', {
          className: 'perfil-link',
          onclick: () => {
            if (l.url) window.open(l.url, '_blank', 'noopener');
            else if (l.route) router.navigate(l.route);
          }
        },
          h('span', { className: 'perfil-link__icon' }, l.icon),
          h('span', { className: 'perfil-link__label' }, l.label),
          h('span', { className: 'perfil-link__arrow' }, l.url ? '↗' : '→')
        )
      )
    )
  );

  /* Configurações */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Configurações'))
  );

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
    return h('label', { className: 'perfil-config-row' },
      h('div', null,
        h('div', { className: 'perfil-config-row__label' }, label),
        h('div', { className: 'perfil-config-row__desc u-text-muted' }, desc)
      ),
      cb
    );
  }

  const nomeInput = h('input', {
    className: 'input', type: 'text', value: config.nome,
    oninput: (e) => { config.nome = e.target.value; storage.set(STORAGE_KEY, config); }
  });
  const callsignInput = h('input', {
    className: 'input', type: 'text', value: config.callsign,
    oninput: (e) => { config.callsign = e.target.value; storage.set(STORAGE_KEY, config); }
  });

  fullPage.appendChild(
    h('div', { className: 'perfil-config card' },
      h('label', { className: 'perfil-config-field' },
        h('span', null, 'NOME'), nomeInput),
      h('label', { className: 'perfil-config-field' },
        h('span', null, 'CALLSIGN'), callsignInput),
      toggle('reduceMotion', 'Reduzir animações', 'Desativa transições e efeitos de movimento.'),
      toggle('confirmActions', 'Confirmar ações destrutivas', 'Pede confirmação antes de limpar dados.'),
      h('div', { className: 'perfil-danger' },
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
        }, '⚠ Limpar todos os dados locais')
      )
    )
  );

  return fullPage;
}
