/**
 * /baixar — página de download do Baluarte Launcher (app desktop).
 *
 * Estilo Steam / Claude / Rockstar: detecta o sistema operacional e oferece o
 * instalador certo num clique, sem a pessoa ter que entender nada. Os
 * instaladores vêm das Releases do GitHub (publicadas pelo workflow
 * `desktop-release.yml` a cada tag `desktop-v*`). A página busca a release mais
 * recente em runtime (API do GitHub), então sempre aponta pra última versão —
 * sem nada hardcoded. Se ainda não houver instalador, mostra "em breve".
 */
import '../styles/baixar.css';
import { h } from '../utils/helpers.js';

const REPO = 'Lucas-Belucci-Bellini/Projeto-Baluarte';
const RELEASES_URL = `https://github.com/${REPO}/releases`;
const API_LATEST = `https://api.github.com/repos/${REPO}/releases/latest`;

const OS = [
  { id: 'win',   label: 'Windows', icon: '🪟', match: /\.exe$/i,            note: 'Windows 10/11 · 64-bit' },
  { id: 'mac',   label: 'macOS',   icon: '🍎', match: /\.dmg$/i,            note: 'macOS 11+' },
  { id: 'linux', label: 'Linux',   icon: '🐧', match: /\.(AppImage|deb)$/i, note: 'AppImage · 64-bit' }
];

function detectOS() {
  const ua = navigator.userAgent || '';
  const p = ((navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '').toLowerCase();
  if (p.includes('win') || /windows/i.test(ua)) return 'win';
  if (p.includes('mac') || /mac os|macintosh/i.test(ua)) return 'mac';
  if (p.includes('linux') || /linux|x11/i.test(ua)) return 'linux';
  return 'win';
}

function fmtSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function feat(icon, title, desc) {
  return h('div', { className: 'dl-feat' },
    h('div', { className: 'dl-feat__icon' }, icon),
    h('div', { className: 'dl-feat__title' }, title),
    h('div', { className: 'dl-feat__desc' }, desc));
}

function note(icon, os, txt) {
  return h('div', { className: 'dl-note' },
    h('span', { className: 'dl-note__os' }, `${icon} ${os}`),
    h('span', { className: 'dl-note__txt' }, txt));
}

export function baixarPage() {
  const osId = detectOS();
  const primaryOs = OS.find((o) => o.id === osId) || OS[0];

  const page = h('div', { className: 'page-baixar' });

  const ctaMain = h('span', { className: 'dl-cta__main' }, `Baixar para ${primaryOs.label}`);
  const ctaSub = h('span', { className: 'dl-cta__sub' }, 'detectando a versão…');
  const ctaBtn = h('a', {
    className: 'dl-cta is-loading', href: RELEASES_URL, target: '_blank', rel: 'noopener'
  }, h('span', { className: 'dl-cta__icon' }, '⬇'),
     h('span', { className: 'dl-cta__txt' }, ctaMain, ctaSub));

  const statusEl = h('div', { className: 'dl-status u-text-muted' },
    `Sistema detectado: ${primaryOs.icon} ${primaryOs.label}`);
  const otherEl = h('div', { className: 'dl-other' });

  page.appendChild(h('section', { className: 'dl-hero anim-fade-in' },
    h('div', { className: 'dl-core' },
      h('span', { className: 'dl-ring' }),
      h('span', { className: 'dl-ring dl-ring--b' }),
      h('span', { className: 'dl-dot' })),
    h('h1', { className: 'dl-title' }, 'Baluarte Launcher'),
    h('p', { className: 'dl-tag' },
      'O hub nativo do Baluarte. Versões pesadas, ',
      h('span', { className: 'u-text-cyan' }, 'motor real do GitNexus'),
      ' e atualização automática — num clique.'),
    ctaBtn,
    statusEl,
    otherEl
  ));

  page.appendChild(h('section', { className: 'dl-feats' },
    feat('🧠', 'Motor real do GitNexus',
      'O grafo de código de verdade (tree-sitter + LadybugDB) rodando local — não o mapa de build.'),
    feat('🔄', 'Atualiza sozinho',
      'Instalou uma vez; as próximas versões chegam automaticamente, sem reinstalar nada.'),
    feat('⚡', 'Roda pesado',
      'Sem as travas do navegador: 3D, ML local e processamento que a web não aguenta.')
  ));

  page.appendChild(h('section', { className: 'dl-notes' },
    h('h2', { className: 'dl-notes__title' }, 'Como instalar'),
    note('🪟', 'Windows', 'Baixe o .exe e abra. Se o Windows avisar (SmartScreen), clique em "Mais informações → Executar assim mesmo" — é só porque o app ainda não tem assinatura paga.'),
    note('🍎', 'macOS', 'Baixe o .dmg e arraste pra Aplicativos. Na 1ª vez, clique com o botão direito → Abrir (o app ainda não é notarizado).'),
    note('🐧', 'Linux', 'Baixe o .AppImage, dê permissão de execução (chmod +x) e rode. Funciona em qualquer distro.')
  ));

  loadRelease({ ctaBtn, ctaMain, ctaSub, otherEl, statusEl, osId });
  return page;
}

async function loadRelease({ ctaBtn, ctaMain, ctaSub, otherEl, statusEl, osId }) {
  let rel = null;
  try {
    const r = await fetch(API_LATEST, { headers: { Accept: 'application/vnd.github+json' } });
    if (r.ok) rel = await r.json();
  } catch {
    /* offline / rate-limited — cai no estado "ver no GitHub" */
  }

  ctaBtn.classList.remove('is-loading');

  const assets = rel && Array.isArray(rel.assets) ? rel.assets : [];
  const version = rel && rel.tag_name
    ? rel.tag_name.replace(/^desktop-/, '').replace(/^v/, '')
    : null;

  const byOs = {};
  for (const o of OS) {
    const a = assets.find((x) => o.match.test(x.name));
    if (a) byOs[o.id] = a;
  }

  const primary = OS.find((o) => o.id === osId) || OS[0];
  const primaryAsset = byOs[primary.id];

  if (primaryAsset) {
    ctaBtn.href = primaryAsset.browser_download_url;
    ctaBtn.removeAttribute('target');
    ctaMain.textContent = `Baixar para ${primary.label}`;
    ctaSub.textContent = `${version ? 'v' + version + ' · ' : ''}${fmtSize(primaryAsset.size)}`;
    statusEl.textContent =
      `Sistema detectado: ${primary.icon} ${primary.label}${version ? ' · última versão v' + version : ''}`;
  } else {
    ctaBtn.classList.add('is-soon');
    ctaBtn.href = RELEASES_URL;
    ctaMain.textContent = assets.length ? 'Ver downloads' : 'Build em breve';
    ctaSub.textContent = assets.length ? 'sem instalador pro seu SO ainda' : 'o instalador está sendo preparado';
    statusEl.textContent = rel
      ? 'Ainda não há instalador pro seu sistema — veja as outras opções no GitHub.'
      : 'Não deu pra buscar a versão agora. Veja as opções no GitHub.';
  }

  otherEl.appendChild(h('span', { className: 'dl-other__label' }, 'Outras plataformas:'));
  for (const o of OS) {
    if (o.id === primary.id) continue;
    const a = byOs[o.id];
    const attrs = {
      className: 'dl-other__link' + (a ? '' : ' is-disabled'),
      href: a ? a.browser_download_url : RELEASES_URL,
      title: a ? `Baixar ${o.label} (${fmtSize(a.size)})` : `${o.label} — em breve`
    };
    if (!a) { attrs.target = '_blank'; attrs.rel = 'noopener'; }
    otherEl.appendChild(h('a', attrs, `${o.icon} ${o.label}`));
  }
  otherEl.appendChild(h('a', {
    className: 'dl-other__gh', href: RELEASES_URL, target: '_blank', rel: 'noopener'
  }, '↗ Todas as versões no GitHub'));
}
