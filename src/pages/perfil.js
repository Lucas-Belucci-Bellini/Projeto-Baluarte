/**
 * Página /perfil — Dossiê do Operador (redesign #195: 3D/imersivo).
 *
 * Identidade do operador + estatísticas do projeto + configurações, no estilo
 * cinematográfico do redesign (emblema com anel girando, brilho neon, cards com
 * glow/lift, parallax sutil do brilho com o mouse).
 */

import '../styles/fase18.css';
import '../styles/perfil.css';
import { h, empty } from '../utils/helpers.js';
import { createHeroWebGL, heroSkinColors } from '../utils/hero-webgl.js';
import { createHeroField } from '../utils/hero3d.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { router } from '../core/router.js';
import { VERSION } from '../data/version.js';
import { readPageViews } from '../utils/page-views.js';
import { THEMES, getThemeId, setTheme } from '../utils/theme.js';
import { UNIVERSE_SKINS, getUniverseId, setUniverse } from '../utils/universe-theme.js';
import { supabaseConfigured } from '../core/supabase.js';
import { isLoggedIn, currentUser, signInWithGoogle, signOut } from '../core/supabase-auth.js';
import { loadProfile, saveProfile } from '../core/user-prefs.js';
import { montarBackup, resumoBackup, validarBackup, restaurarBackup, nomeDoArquivo } from '../core/backup.js';
import { PERFIS } from '../data/perfis.js';

const STORAGE_KEY = 'perfil:config';

/**
 * Varre o cache da Wikipédia gravado FORA do namespace, por versões anteriores
 * à 1.0.0-rc.
 *
 * Até aqui `utils/wikipedia.js` gravava `wiki:sum:pt:Título` cru, sem o
 * `baluarte:`. Como este botão sempre filtrou pelo prefixo, ele nunca alcançou
 * essas chaves: o operador pedia para apagar tudo, lia "todos os dados locais
 * foram apagados", e o registro do que ele consultou continuava no disco.
 * Agora a gravação é namespaced; isto aqui limpa o que ficou para trás.
 *
 * **Descartável depois da 1.0.0** — quando ninguém mais tiver cache antigo, é
 * só apagar esta função.
 */
function limparCacheWikiLegado() {
  try {
    const antigas = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('wiki:sum:')) antigas.push(k);
    }
    antigas.forEach((k) => localStorage.removeItem(k));
  } catch { /* sem localStorage — nada a limpar */ }
}

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

/* "G" oficial do Google (4 cores) pro botão de login. */
const GOOGLE_G_SVG = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

/* Seção Conta: login com Google (deslogado) / usuário + Sair (logado).
 * Re-renderiza sozinha no logout; o login é redirect (recarrega já logado). */
function accountSection() {
  const box = h('div', { className: 'pf-account' });
  function render() {
    empty(box);
    if (!supabaseConfigured()) {
      box.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '13px' } },
        'Login indisponível (banco não configurado neste ambiente).'));
      return;
    }
    if (isLoggedIn()) {
      const u = currentUser() || { meta: {} };
      const meta = u.meta || {};
      const name = meta.name || meta.full_name || (u.email || '').split('@')[0] || 'Operador';
      const avatar = meta.avatar_url || meta.picture;
      box.appendChild(h('div', { className: 'pf-account__card' },
        avatar
          ? h('img', { className: 'pf-account__avatar', src: avatar, alt: '', referrerpolicy: 'no-referrer' })
          : h('span', { className: 'pf-account__avatar pf-account__avatar--ph' }, (name[0] || '?').toUpperCase()),
        h('div', { className: 'pf-account__info' },
          h('div', { className: 'pf-account__name' }, name),
          u.email && h('div', { className: 'pf-account__email u-text-muted' }, u.email),
          h('div', { className: 'pf-account__sync u-text-cyan' }, '☁ sua estética e favoritos sincronizam nesta conta')),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: async () => { await signOut(); toast('Você saiu da conta'); render(); }
        }, 'Sair')));
    } else {
      box.appendChild(h('div', { className: 'pf-account__card' },
        h('div', { className: 'pf-account__info' },
          h('div', { className: 'pf-account__name' }, 'Entrar / criar conta'),
          h('div', { className: 'u-text-muted', style: { fontSize: '13px' } },
            'Conecte sua conta Google e tenha sua estética (tema + skin de universo) e favoritos salvos na nuvem — em qualquer dispositivo.')),
        h('button', { className: 'btn-google', onclick: () => signInWithGoogle() },
          h('span', { className: 'btn-google__g', html: GOOGLE_G_SVG }),
          'Entrar com Google')));
    }
  }
  render();
  return box;
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
  let pfFx = createHeroWebGL(scopeCanvas, { variant: 'scope' });   // segue o universo ativo (#246)
  if (!pfFx) pfFx = createHeroField(scopeCanvas, heroSkinColors());
  pfFx.start();
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(hero)) { try { pfFx.destroy(); } catch {} mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  page.appendChild(hero);

  /* ---- conta (login Google + estética na nuvem) ---- */
  page.appendChild(sectionTitle('◉', 'Conta'));
  page.appendChild(accountSection());

  /* ---- estatísticas ---- */
  page.appendChild(sectionTitle('◎', 'Estatísticas do Projeto'));
  /* Tile dinâmico: views reais do banco (Supabase). Some se o banco não responder. */
  const viewsStat = h('div', { className: 'pf-stat' },
    h('div', { className: 'pf-stat__icon' }, '👁'),
    h('div', { className: 'pf-stat__value' }, '—'),
    h('div', { className: 'pf-stat__label' }, 'Páginas vistas'));
  page.appendChild(
    h('div', { className: 'pf-stats' },
      ...STATS.map((s) =>
        h('div', { className: 'pf-stat' },
          h('div', { className: 'pf-stat__icon' }, s.icon),
          h('div', { className: 'pf-stat__value' }, s.value),
          h('div', { className: 'pf-stat__label' }, s.label))),
      viewsStat)
  );
  readPageViews(1).then((res) => {
    if (!res || !res.total) { viewsStat.remove(); return; }
    const v = viewsStat.querySelector('.pf-stat__value');
    if (v) v.textContent = res.total.toLocaleString('pt-BR');
  });

  /* ---- minhas redes (perfis públicos do operador, sempre em expansão:
   * perfil novo = mais uma entrada em src/data/perfis.js) ---- */
  page.appendChild(sectionTitle('🌐', 'Minhas Redes'));
  page.appendChild(
    h('div', { className: 'pf-links' },
      ...PERFIS.map((p) =>
        h('button', {
          className: 'pf-link',
          title: p.desc,
          style: `--rede-cor: ${p.cor}`,
          onclick: () => window.open(p.url, '_blank', 'noopener')
        },
          h('span', { className: 'pf-link__icon', style: `color: ${p.cor}` }, p.icone),
          h('span', { className: 'pf-link__label' }, `${p.rede} · ${p.user}`),
          h('span', { className: 'pf-link__arrow' }, '↗'))))
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
              if (isLoggedIn()) saveProfile({ theme: t.id });   // sincroniza na nuvem
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
              if (isLoggedIn()) saveProfile({ universe: u.id });   // sincroniza na nuvem
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
      /* Exportar/importar vem ANTES do "limpar", e a ordem é o argumento: quem
       * chega aqui pensando em apagar tudo passa primeiro pela opção de salvar.
       * "Recuperável" é uma das quatro palavras da definição da 1.0.0, e até
       * agora esta tela só sabia destruir. */
      h('div', { className: 'pf-backup' },
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            try {
              const backup = montarBackup();
              const { total, sensiveis } = resumoBackup(backup);
              if (!total) { toast('Não há dado local para exportar', { type: 'warning' }); return; }

              const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = h('a', { href: url, download: nomeDoArquivo() });
              document.body.appendChild(a);
              a.click();
              a.remove();
              /* Sem revoke imediato: em alguns navegadores o download ainda não
               * leu o blob quando o clique retorna, e revogar cedo baixa 0 byte. */
              setTimeout(() => URL.revokeObjectURL(url), 30000);

              toast(sensiveis
                ? `${total} chaves exportadas — ${sensiveis} contêm dado sensível (chaves de API, conversas). Guarde o arquivo como guardaria uma senha.`
                : `${total} chaves exportadas`,
              { type: sensiveis ? 'warning' : 'success' });
            } catch (err) {
              console.warn('[perfil] falha ao exportar:', err);
              toast('Não foi possível gerar o backup', { type: 'error' });
            }
          }
        }, '⬇ Exportar meus dados'),

        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            const entrada = h('input', { type: 'file', accept: 'application/json,.json' });
            entrada.onchange = async () => {
              const arquivo = entrada.files && entrada.files[0];
              if (!arquivo) return;
              let obj;
              try {
                obj = JSON.parse(await arquivo.text());
              } catch {
                toast('O arquivo não é um JSON válido', { type: 'error' });
                return;
              }
              const v = validarBackup(obj);
              if (!v.ok) { toast(v.erro, { type: 'error' }); return; }

              const { total } = resumoBackup(obj);
              if (!confirm(`Importar ${total} chaves deste backup? O que estiver gravado agora nessas chaves será SUBSTITUÍDO.`)) return;

              const { restauradas, ignoradas } = restaurarBackup(obj);
              if (ignoradas.length) {
                console.warn('[perfil] chaves ignoradas na importação:', ignoradas);
              }
              toast(ignoradas.length
                ? `${restauradas.length} restauradas · ${ignoradas.length} ignoradas (ver console)`
                : `${restauradas.length} chaves restauradas`,
              { type: 'success' });
              setTimeout(() => location.reload(), 1200);
            };
            entrada.click();
          }
        }, '⬆ Importar backup')),

      h('div', { className: 'pf-danger' },
        h('button', {
          className: 'btn btn--ghost btn--sm u-text-danger',
          onclick: () => {
            if (confirm('Isto apaga TODOS os dados locais do Baluarte (editor, terminal, configs, progresso). Continuar?')) {
              /* Pelo wrapper: ele é dono do namespace `baluarte:` e sabe varrer
               * o que gravou. Antes esta função reimplementava a varredura à
               * mão — e por isso ficava fora de sincronia com quem gravava. */
              storage.clearAll();
              limparCacheWikiLegado();
              toast('Todos os dados locais foram apagados', { type: 'warning' });
              setTimeout(() => location.reload(), 1000);
            }
          }
        }, '⚠ Limpar todos os dados locais')))
  );

  /* Logado: aplica a estética salva na nuvem (e inicializa o perfil se vazio).
   * É o que faz "cada um ter sua estética" voltar em qualquer dispositivo. */
  if (supabaseConfigured() && isLoggedIn()) {
    loadProfile().then((prof) => {
      if (!prof) return;
      if (prof.theme && prof.theme !== getThemeId()) setTheme(prof.theme);
      if (prof.universe && prof.universe !== getUniverseId()) setUniverse(prof.universe);
      document.querySelectorAll('.pf-theme[data-theme]').forEach((b) =>
        b.classList.toggle('is-active', b.dataset.theme === getThemeId()));
      document.querySelectorAll('[data-universe-btn]').forEach((b) =>
        b.classList.toggle('is-active', b.dataset.universeBtn === getUniverseId()));
      if (!prof.theme && !prof.universe) saveProfile({ theme: getThemeId(), universe: getUniverseId() });
    });
  }

  return page;
}
