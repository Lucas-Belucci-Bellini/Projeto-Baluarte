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

  /* ===== Mobile (v0.5.0 #340): download DIRETO do APK — sem loja, sem login.
   * Busca em runtime a release `mobile-v*` mais recente (prerelease) e linka o
   * .apk anexado pelo workflow Mobile Release. iOS: em breve (M7 local). ===== */
  const apkBtn = h('a', {
    className: 'dl-other__link is-disabled', href: RELEASES_URL,
    target: '_blank', rel: 'noopener', title: 'Android — buscando o APK…'
  }, '🤖 Android (APK direto)');
  page.appendChild(h('section', { className: 'dl-notes' },
    h('h2', { className: 'dl-notes__title' }, '📱 Celular'),
    h('div', { className: 'dl-other', style: { justifyContent: 'flex-start' } },
      apkBtn,
      h('span', { className: 'dl-other__link is-disabled', title: 'iOS — em preparação (TestFlight)' }, ' iOS (em breve)')),
    note('🤖', 'Android', 'Baixe o APK e abra. O Android vai pedir pra permitir "fontes desconhecidas" — é normal fora da Play Store. O site também instala como PWA (menu do navegador → "Adicionar à tela inicial").'),
    note('', 'iOS', 'Enquanto o app não chega no TestFlight, use o PWA: Safari → Compartilhar → "Adicionar à Tela de Início" — abre em tela cheia.')
  ));

  page.appendChild(h('section', { className: 'dl-notes' },
    h('h2', { className: 'dl-notes__title' }, 'Como instalar'),
    note('🪟', 'Windows', 'Baixe o .exe e abra. Se o Windows avisar (SmartScreen), clique em "Mais informações → Executar assim mesmo" — é só porque o app ainda não tem assinatura paga.'),
    note('🍎', 'macOS', 'Baixe o .dmg e arraste pra Aplicativos. Na 1ª vez, clique com o botão direito → Abrir (o app ainda não é notarizado).'),
    note('🐧', 'Linux', 'Baixe o .AppImage, dê permissão de execução (chmod +x) e rode. Funciona em qualquer distro.')
  ));

  loadRelease({ ctaBtn, ctaMain, ctaSub, otherEl, statusEl, osId });
  loadMobileRelease(apkBtn);
  return page;
}

/* Acha a release mobile-v* mais recente (prerelease não aparece em /latest) e
 * aponta o botão pro .apk. Falhou/não existe → botão leva pra página de releases. */
async function loadMobileRelease(apkBtn) {
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=15`,
      { headers: { Accept: 'application/vnd.github+json' } });
    if (!r.ok) return;
    const releases = await r.json();
    const mob = releases.find((x) => /^mobile-v/.test(x.tag_name || ''));
    const apk = mob && (mob.assets || []).find((a) => /\.apk$/i.test(a.name));
    if (apk) {
      apkBtn.classList.remove('is-disabled');
      apkBtn.href = apk.browser_download_url;
      apkBtn.removeAttribute('target');
      apkBtn.title = `Baixar o APK (${fmtSize(apk.size)}) — ${mob.tag_name}`;
      apkBtn.textContent = `🤖 Android — APK direto (${fmtSize(apk.size)})`;
    } else {
      apkBtn.title = 'Android — APK em preparação; veja as releases';
    }
  } catch { /* offline/rate-limit: botão segue pro GitHub */ }
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
