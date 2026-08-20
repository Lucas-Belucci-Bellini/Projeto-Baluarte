/**
 * Página /perfil — Dossiê do Operador.
 *
 * Identidade do operador, estatísticas, estética local/nuvem, autenticação,
 * backup recuperável e links públicos do projeto.
 */

import '../styles/fase18.css';
import '../styles/perfil.css';
import { h, empty } from '../utils/helpers.js';
import { createHeroWebGL, heroSkinColors } from '../utils/hero-webgl.js';
import type { HeroEffect } from '../utils/hero-webgl.js';
import { createHeroField } from '../utils/hero3d.js';
import type { HeroFieldEffect } from '../utils/hero3d.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import { router } from '../core/router.js';
import { VERSION } from '../data/version.js';
import { readPageViews } from '../utils/page-views.js';
import { THEMES, getThemeId, setTheme } from '../utils/theme.js';
import { UNIVERSE_SKINS, getUniverseId, setUniverse } from '../utils/universe-theme.js';
import { supabaseConfigured } from '../core/supabase.js';
import { isLoggedIn, currentUser, signInWithGoogle, signOut } from '../core/supabase-auth.js';
import { loadProfile, saveProfile } from '../core/user-prefs.js';
import type { UserProfilePatch } from '../core/user-prefs.js';
import {
  montarBackup,
  resumoBackup,
  validarBackup,
  restaurarBackup,
  nomeDoArquivo,
} from '../core/backup.js';
import type { BaluarteBackup } from '../core/backup.js';
import { PERFIS } from '../data/perfis.js';

const STORAGE_KEY = 'perfil:config';

interface PerfilConfig {
  nome: string;
  callsign: string;
  reduceMotion: boolean;
  confirmActions: boolean;
}

type ToggleKey = 'reduceMotion' | 'confirmActions';

interface StatDefinition {
  readonly label: string;
  readonly value: string;
  readonly icon: string;
}

interface QuickLink {
  readonly label: string;
  readonly icon: string;
  readonly url?: string;
  readonly route?: string;
}

const DEFAULT_CONFIG: PerfilConfig = {
  nome: 'Lucas Belucci Bellini',
  callsign: 'OMEGA-01',
  reduceMotion: false,
  confirmActions: true,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPerfilConfig(value: unknown): value is PerfilConfig {
  return isRecord(value)
    && typeof value.nome === 'string'
    && typeof value.callsign === 'string'
    && typeof value.reduceMotion === 'boolean'
    && typeof value.confirmActions === 'boolean';
}

function loadConfig(): PerfilConfig {
  const stored: unknown = storage.get<unknown>(STORAGE_KEY, null);
  return isPerfilConfig(stored) ? { ...stored } : { ...DEFAULT_CONFIG };
}

function limparCacheWikiLegado(): void {
  try {
    const antigas: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith('wiki:sum:')) antigas.push(key);
    }
    antigas.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* sem localStorage — nada a limpar */
  }
}

const STATS: readonly StatDefinition[] = [
  { label: 'Versão', value: `v${VERSION}`, icon: '◆' },
  { label: 'Rotas ativas', value: '60+', icon: '◫' },
  { label: 'Ferramentas', value: '40', icon: '⚙' },
  { label: 'Equipes catalogadas', value: '26', icon: '◆' },
  { label: 'Arcos das Crônicas', value: '24', icon: '◫' },
  { label: 'Capítulos da saga', value: '1127', icon: '⌨' },
];

const LINKS: readonly QuickLink[] = [
  { label: 'Repositório GitHub', url: 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte', icon: '⎇' },
  { label: 'Crônicas da Baluarte', route: '/biblioteca', icon: '◫' },
  { label: 'Hub de Ferramentas', route: '/ferramentas', icon: '⚙' },
  { label: 'Ponte de Comando', route: '/home', icon: '⬡' },
];

function sectionTitle(icon: string, title: string): HTMLDivElement {
  return h('div', { className: 'pf-section' },
    h('span', { className: 'pf-section__icon' }, icon),
    h('h2', { className: 'pf-section__title' }, title),
  );
}

const GOOGLE_G_SVG = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function accountSection(): HTMLDivElement {
  const box = h('div', { className: 'pf-account' });

  function render(): void {
    empty(box);
    if (!supabaseConfigured()) {
      box.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '13px' } },
        'Login indisponível (banco não configurado neste ambiente).'));
      return;
    }
    if (isLoggedIn()) {
      const user = currentUser();
      const meta = user && isRecord(user.meta) ? user.meta : {};
      const email = user?.email ?? '';
      const candidateName = typeof meta.name === 'string'
        ? meta.name
        : typeof meta.full_name === 'string'
          ? meta.full_name
          : email.split('@')[0];
      const name = candidateName || 'Operador';
      const avatar = typeof meta.avatar_url === 'string'
        ? meta.avatar_url
        : typeof meta.picture === 'string' ? meta.picture : '';
      box.appendChild(h('div', { className: 'pf-account__card' },
        avatar
          ? h('img', {
            className: 'pf-account__avatar',
            src: avatar,
            alt: '',
            referrerpolicy: 'no-referrer',
          })
          : h('span', {
            className: 'pf-account__avatar pf-account__avatar--ph',
          }, (name[0] || '?').toUpperCase()),
        h('div', { className: 'pf-account__info' },
          h('div', { className: 'pf-account__name' }, name),
          email && h('div', { className: 'pf-account__email u-text-muted' }, email),
          h('div', { className: 'pf-account__sync u-text-cyan' },
            '☁ sua estética e favoritos sincronizam nesta conta'),
        ),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: async () => {
            await signOut();
            toast('Você saiu da conta');
            render();
          },
        }, 'Sair'),
      ));
    } else {
      box.appendChild(h('div', { className: 'pf-account__card' },
        h('div', { className: 'pf-account__info' },
          h('div', { className: 'pf-account__name' }, 'Entrar / criar conta'),
          h('div', { className: 'u-text-muted', style: { fontSize: '13px' } },
            'Conecte sua conta Google e tenha sua estética (tema + skin de universo) e favoritos salvos na nuvem — em qualquer dispositivo.'),
        ),
        h('button', {
          className: 'btn-google',
          onclick: () => { void signInWithGoogle(); },
        },
          h('span', { className: 'btn-google__g', html: GOOGLE_G_SVG }),
          'Entrar com Google',
        ),
      ));
    }
  }

  render();
  return box;
}

export function perfilPage(): HTMLDivElement {
  const config = loadConfig();
  const page = h('div', { className: 'page-perfil' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'PERFIL'),
      ),
      h('h1', { className: 'page-header__title' }, '◔ Perfil do Operador'),
      h('p', { className: 'page-header__description' },
        'Identidade, estatísticas do projeto e configurações da plataforma.'),
    ),
  );

  const scopeCanvas = h('canvas', { className: 'pf-hero__canvas', 'aria-hidden': 'true' });
  const hero = h('div', { className: 'pf-hero anim-fade-in' },
    scopeCanvas,
    h('span', { className: 'pf-hud__br pf-hud__br--tl', 'aria-hidden': 'true' }),
    h('span', { className: 'pf-hud__br pf-hud__br--br', 'aria-hidden': 'true' }),
    h('div', { className: 'pf-hero__scan', 'aria-hidden': 'true' }),
    h('div', { className: 'pf-emblem' },
      h('span', { className: 'pf-emblem__ring' }),
      h('span', { className: 'pf-emblem__core' },
        h('span', { className: 'pf-emblem__glyph' }, 'Ω')),
    ),
    h('div', { className: 'pf-id' },
      h('div', { className: 'pf-kicker' }, 'Dossiê do Operador · Clearance OMEGA'),
      h('h2', { className: 'pf-name' }, config.nome),
      h('div', { className: 'pf-callsign' },
        h('span', { className: 'dot' }),
        'CALLSIGN ',
        h('strong', null, config.callsign),
        ' · ONLINE',
      ),
      h('div', { className: 'pf-badges' },
        h('span', { className: 'pf-badge pf-badge--omega' }, 'CLEARANCE OMEGA'),
        h('span', { className: 'pf-badge pf-badge--alfa' }, 'EQUIPE ALFA'),
        h('span', { className: 'pf-badge pf-badge--tango' }, 'EQUIPE TANGO'),
      ),
      h('p', { className: 'pf-bio' },
        'Operador-líder e arquiteto do Núcleo Infinity Dreadnought. ',
        'Responsável pelo Mark XIII — 13ª iteração do Projeto Baluarte. ',
        'Brasileiro. Construiu esta plataforma após 12 versões anteriores que falharam.'),
    ),
  );
  hero.addEventListener('mousemove', (event: MouseEvent) => {
    const rect = hero.getBoundingClientRect();
    const gx = 78 + ((event.clientX - rect.left) / rect.width - 0.5) * 16;
    hero.style.setProperty('--gx', `${gx}%`);
  });
  hero.addEventListener('mouseleave', () => hero.style.setProperty('--gx', '78%'));

  let heroEffect: HeroEffect | HeroFieldEffect = createHeroWebGL(scopeCanvas, { variant: 'scope' })
    ?? createHeroField(scopeCanvas, heroSkinColors());
  heroEffect.start();
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!document.contains(hero)) {
        try {
          heroEffect.destroy();
        } catch {
          /* efeito já destruído */
        }
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  page.appendChild(hero);

  page.appendChild(sectionTitle('◉', 'Conta'));
  page.appendChild(accountSection());
  page.appendChild(sectionTitle('◎', 'Estatísticas do Projeto'));
  const viewsStat = h('div', { className: 'pf-stat' },
    h('div', { className: 'pf-stat__icon' }, '👁'),
    h('div', { className: 'pf-stat__value' }, '—'),
    h('div', { className: 'pf-stat__label' }, 'Páginas vistas'),
  );
  page.appendChild(
    h('div', { className: 'pf-stats' },
      ...STATS.map((stat) => h('div', { className: 'pf-stat' },
        h('div', { className: 'pf-stat__icon' }, stat.icon),
        h('div', { className: 'pf-stat__value' }, stat.value),
        h('div', { className: 'pf-stat__label' }, stat.label),
      )),
      viewsStat,
    ),
  );
  void readPageViews(1).then((result) => {
    if (!result || !result.total) {
      viewsStat.remove();
      return;
    }
    const value = viewsStat.querySelector('.pf-stat__value');
    if (value) value.textContent = result.total.toLocaleString('pt-BR');
  });

  page.appendChild(sectionTitle('🌐', 'Minhas Redes'));
  page.appendChild(
    h('div', { className: 'pf-links' },
      ...PERFIS.map((profile) => h('button', {
        className: 'pf-link',
        title: profile.desc,
        style: `--rede-cor: ${profile.cor}`,
        onclick: () => window.open(profile.url, '_blank', 'noopener'),
      },
        h('span', { className: 'pf-link__icon', style: `color: ${profile.cor}` }, profile.icone),
        h('span', { className: 'pf-link__label' }, `${profile.rede} · ${profile.user}`),
        h('span', { className: 'pf-link__arrow' }, '↗'),
      )),
    ),
  );

  page.appendChild(sectionTitle('⊳', 'Acesso Rápido'));
  page.appendChild(
    h('div', { className: 'pf-links' },
      ...LINKS.map((link) => h('button', {
        className: 'pf-link',
        onclick: () => {
          if (link.url) window.open(link.url, '_blank', 'noopener');
          else if (link.route) router.navigate(link.route);
        },
      },
        h('span', { className: 'pf-link__icon' }, link.icon),
        h('span', { className: 'pf-link__label' }, link.label),
        h('span', { className: 'pf-link__arrow' }, link.url ? '↗' : '→'),
      )),
    ),
  );

  page.appendChild(sectionTitle('⚙', 'Configurações'));

  function toggle(key: ToggleKey, label: string, description: string): HTMLLabelElement {
    const checkbox = h('input', {
      type: 'checkbox',
      checked: config[key],
      onchange: (event: Event) => {
        const input = event.currentTarget;
        if (!(input instanceof HTMLInputElement)) return;
        config[key] = input.checked;
        storage.set(STORAGE_KEY, config);
        if (key === 'reduceMotion') {
          document.documentElement.classList.toggle('reduce-motion', config[key]);
        }
        toast(`${label}: ${config[key] ? 'ativado' : 'desativado'}`, { type: 'info' });
      },
    });
    return h('label', { className: 'pf-toggle' },
      h('div', null,
        h('div', { className: 'pf-toggle__label' }, label),
        h('div', { className: 'pf-toggle__desc u-text-muted' }, description),
      ),
      checkbox,
    );
  }

  const nameInput = h('input', {
    className: 'input pf-input',
    type: 'text',
    value: config.nome,
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      config.nome = input.value;
      storage.set(STORAGE_KEY, config);
    },
  });
  const callsignInput = h('input', {
    className: 'input pf-input',
    type: 'text',
    value: config.callsign,
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      config.callsign = input.value;
      storage.set(STORAGE_KEY, config);
    },
  });

  const themeButtons = h('div', { className: 'pf-themes' },
    ...THEMES.map((theme) => h('button', {
      className: `pf-theme${theme.id === getThemeId() ? ' is-active' : ''}`,
      'data-theme': theme.id,
      title: theme.label,
      onclick: () => {
        setTheme(theme.id);
        document.querySelectorAll<HTMLButtonElement>('.pf-theme[data-theme]').forEach((button) => {
          button.classList.toggle('is-active', button.dataset.theme === theme.id);
        });
        toast(`Tema: ${theme.label}`, { type: 'info' });
        if (isLoggedIn()) {
          const patch: UserProfilePatch = { theme: theme.id };
          void saveProfile(patch);
        }
      },
    },
      h('span', {
        className: 'pf-theme__sw',
        style: { background: `linear-gradient(135deg, ${theme.primary} 0 50%, ${theme.secondary} 50% 100%)` },
      }),
      theme.label,
    )),
  );
  const universeButtons = h('div', { className: 'pf-themes' },
    ...UNIVERSE_SKINS.map((universe) => h('button', {
      className: `pf-theme${universe.id === getUniverseId() ? ' is-active' : ''}`,
      'data-universe-btn': universe.id,
      title: universe.label,
      onclick: () => {
        setUniverse(universe.id);
        document.querySelectorAll<HTMLButtonElement>('[data-universe-btn]').forEach((button) => {
          button.classList.toggle('is-active', button.dataset.universeBtn === universe.id);
        });
        toast(`Universo: ${universe.label}`, { type: 'info' });
        if (isLoggedIn()) {
          const patch: UserProfilePatch = { universe: universe.id };
          void saveProfile(patch);
        }
      },
    },
      h('span', {
        className: 'pf-theme__sw',
        style: { background: `linear-gradient(135deg, ${universe.primary} 0 50%, ${universe.secondary} 50% 100%)` },
      }),
      universe.label,
    )),
  );

  page.appendChild(
    h('div', { className: 'pf-config' },
      h('label', { className: 'pf-field' }, h('span', null, 'NOME'), nameInput),
      h('label', { className: 'pf-field' }, h('span', null, 'CALLSIGN'), callsignInput),
      h('div', { className: 'pf-field' },
        h('span', null, 'TEMA'),
        themeButtons,
      ),
      h('div', { className: 'pf-field' },
        h('span', null, 'UNIVERSO (skin do site)'),
        universeButtons,
      ),
      h('p', { className: 'u-text-muted', style: { fontSize: '11px', margin: '-4px 0 4px' } },
        '🌌 15 universos com skin completo — cor, tipografia, formas e atmosfera próprias.'),
      toggle('reduceMotion', 'Reduzir animações', 'Desativa transições e efeitos de movimento.'),
      toggle('confirmActions', 'Confirmar ações destrutivas', 'Pede confirmação antes de limpar dados.'),
      h('div', { className: 'pf-backup' },
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            try {
              const backup = montarBackup();
              const summary = resumoBackup(backup);
              if (!summary.total) {
                toast('Não há dado local para exportar', { type: 'warning' });
                return;
              }
              const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const anchor = h('a', { href: url, download: nomeDoArquivo() });
              document.body.appendChild(anchor);
              anchor.click();
              anchor.remove();
              window.setTimeout(() => URL.revokeObjectURL(url), 30000);
              toast(
                summary.sensiveis
                  ? `${summary.total} chaves exportadas — ${summary.sensiveis} contêm dado sensível (chaves de API, conversas). Guarde o arquivo como guardaria uma senha.`
                  : `${summary.total} chaves exportadas`,
                { type: summary.sensiveis ? 'warning' : 'success' },
              );
            } catch (error: unknown) {
              console.warn('[perfil] falha ao exportar:', error);
              toast('Não foi possível gerar o backup', { type: 'danger' });
            }
          },
        }, '⬇ Exportar meus dados'),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            const input = h('input', { type: 'file', accept: 'application/json,.json' });
            input.onchange = async () => {
              const file = input.files?.[0];
              if (!file) return;
              let parsed: unknown;
              try {
                parsed = JSON.parse(await file.text()) as unknown;
              } catch {
                toast('O arquivo não é um JSON válido', { type: 'danger' });
                return;
              }
              const validation = validarBackup(parsed);
              if (!validation.ok) {
                toast(validation.erro, { type: 'danger' });
                return;
              }
              const backup = parsed as BaluarteBackup;
              const { total } = resumoBackup(backup);
              if (!confirm(`Importar ${total} chaves deste backup? O que estiver gravado agora nessas chaves será SUBSTITUÍDO.`)) return;
              const restored = restaurarBackup(backup);
              if (restored.ignoradas.length) {
                console.warn('[perfil] chaves ignoradas na importação:', restored.ignoradas);
              }
              toast(
                restored.ignoradas.length
                  ? `${restored.restauradas.length} restauradas · ${restored.ignoradas.length} ignoradas (ver console)`
                  : `${restored.restauradas.length} chaves restauradas`,
                { type: 'success' },
              );
              window.setTimeout(() => location.reload(), 1200);
            };
            input.click();
          },
        }, '⬆ Importar backup'),
      ),
      h('div', { className: 'pf-danger' },
        h('button', {
          className: 'btn btn--ghost btn--sm u-text-danger',
          onclick: () => {
            if (confirm('Isto apaga TODOS os dados locais do Baluarte (editor, terminal, configs, progresso). Continuar?')) {
              storage.clearAll();
              limparCacheWikiLegado();
              toast('Todos os dados locais foram apagados', { type: 'warning' });
              window.setTimeout(() => location.reload(), 1000);
            }
          },
        }, '⚠ Limpar todos os dados locais'),
      ),
    ),
  );

  if (supabaseConfigured() && isLoggedIn()) {
    void loadProfile().then((profile) => {
      if (!profile) return;
      if (typeof profile.theme === 'string' && profile.theme !== getThemeId()) setTheme(profile.theme);
      if (typeof profile.universe === 'string' && profile.universe !== getUniverseId()) setUniverse(profile.universe);
      document.querySelectorAll<HTMLButtonElement>('.pf-theme[data-theme]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.theme === getThemeId());
      });
      document.querySelectorAll<HTMLButtonElement>('[data-universe-btn]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.universeBtn === getUniverseId());
      });
      if (!profile.theme && !profile.universe) {
        void saveProfile({ theme: getThemeId(), universe: getUniverseId() });
      }
    });
  }

  return page;
}
