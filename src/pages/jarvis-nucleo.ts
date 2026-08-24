/**
 * Rota `/jarvis` na WEB — o Núcleo, e só ele.
 *
 * Por que existe: o mega-plano #238 divide o Baluarte em "web = leve, app =
 * completo", e a rota /jarvis era a maior violação dessa regra. No navegador
 * ela entregava a superfície inteira do JARVIS — seis modos de IA, sessões em
 * IndexedDB, memória, skills, agente com ferramentas — empilhada embaixo do
 * núcleo 3D. Nada disso pertence à web: é peso de boot, é superfície de
 * ataque, e é justamente o que o app desktop existe para carregar.
 *
 * O que sobra aqui é o que a web sempre deveria ter sido: o **Núcleo V7** em
 * 3D, com as funções dele no canto (música, ficheiro, microfone, pulso,
 * varrimento, dissecar, retrato, rotação, captura e os três temas), cada uma
 * podendo ser ligada ou não por quem está olhando — mais um único controle do
 * Baluarte, a presença musical externa do Spotify, num clique.
 *
 * O JARVIS completo continua existindo, intacto, em `jarvis.ts`: o router só o
 * carrega quando `window.baluarte.native` é verdadeiro (o Launcher), e o
 * cockpit do Núcleo (`git-nexus-cockpit`) segue abrindo-o na aba própria.
 * Trocar de rota não muda o contrato de nenhum dos dois.
 */

import { h } from '../utils/helpers.js';
import { bus } from '../core/events.js';
import { toast } from '../utils/toast';
import { createJarvisV7Visual, ocuparAlturaRestante } from '../utils/jarvis-v7-visual';
import type { JarvisV7Visual } from '../utils/jarvis-v7-visual';
import { getConfiguredSpotifyClientId } from '../utils/jarvis-spotify';
import {
  beginSpotifyAuthorization,
  disconnectSpotify,
  isSpotifyConnected,
} from '../utils/jarvis-spotify-session';
import type { SpotifySessionEventDetail } from '../utils/jarvis-spotify-session';

const SPOTIFY_SCOPE = 'user-read-playback-state';

/** Só metadados de faixa; sem áudio, sem comando de reprodução. */
function faixaVisivel(detail: SpotifySessionEventDetail): string {
  /* Uma volta que falhou deixava a faixa vazia: o dock ficava idêntico a quem
   * nunca tentou conectar. O motivo curto fica aqui, ao lado do distintivo; a
   * frase inteira, com o que fazer, sai no aviso do arranque. */
  if (detail.connected !== true && detail.reason) return `⚠ ${detail.reason.replace(/_/g, ' ').toLowerCase()}`;
  if (detail.connected !== true) return '';
  const titulo = typeof detail.title === 'string' ? detail.title.trim() : '';
  const artista = typeof detail.artist === 'string' ? detail.artist.trim() : '';
  if (detail.playback === 'playing' && titulo) return artista ? `♪ ${titulo} · ${artista}` : `♪ ${titulo}`;
  if (detail.playback === 'paused' && titulo) return `⏸ ${titulo}`;
  return '';
}

/**
 * O botão único da promessa "um clique e conectou".
 *
 * O Client ID público vem de `getConfiguredSpotifyClientId()` — hoje ele já vem
 * embutido no build, então ninguém precisa colar nada antes de clicar. O que
 * segue depois é o fluxo normal do Spotify: tela de consentimento na primeira
 * vez, volta direta nas seguintes. Nenhum segredo passa pelo navegador: PKCE
 * S256, escopo de leitura, sem Client Secret.
 */
function conectarSpotify(): void {
  if (isSpotifyConnected()) { disconnectSpotify(); return; }
  const clientId = getConfiguredSpotifyClientId();
  if (!clientId) {
    toast('Este build saiu sem Client ID público do Spotify. Publique com VITE_SPOTIFY_CLIENT_ID para reativar o botão.');
    return;
  }
  const redirectUri = `${location.origin}${location.pathname}`;
  const returnTo = `${location.pathname}${location.search}${location.hash}`;
  void beginSpotifyAuthorization({ clientId, redirectUri, returnTo, scope: SPOTIFY_SCOPE })
    .then((url) => { location.assign(url); })
    .catch((erro: unknown) => {
      toast(erro instanceof Error ? erro.message : 'Não foi possível iniciar o Spotify.');
    });
}

export function jarvisNucleoPage(): HTMLDivElement {
  const page = h('div', { className: 'page-nucleo' }) as HTMLDivElement;

  /* Fallback do V7: quando o WebGL (ou o three.js) não sobe, fica a referência
   * estática do núcleo em vez de um retângulo preto sem explicação. */
  const referencia = h('img', {
    className: 'jv-visual-switcher__reference',
    src: '/jarvis/jarvis-nucleo-browser.webp',
    alt: 'Núcleo dourado J.A.R.V.I.S. do Projeto Baluarte',
    loading: 'eager',
    decoding: 'async',
  });
  const fallback = h('div', {
    className: 'jv-visual-switcher__reference-fallback',
    'aria-label': 'Referência visual do núcleo J.A.R.V.I.S.',
  }, referencia);

  let visual: JarvisV7Visual | null = null;
  try {
    visual = createJarvisV7Visual({ fallback });
    page.appendChild(visual.root);
  } catch {
    /* `normalizeJarvisV7Url` recusa fonte que não seja o artefato same-origin.
     * Recusa é o comportamento certo — a página ainda assim mostra o núcleo. */
    fallback.classList.add('jv-visual-switcher');
    page.appendChild(fallback);
  }

  /* Mesma medição do app: `calc(100vh - …)` erra pela faixa do topo, e o erro
   * vira barra de rolagem numa página que deveria caber inteira. */
  const soltarAltura = ocuparAlturaRestante(page);

  const conectado = isSpotifyConnected();
  const badge = h('span', {
    className: 'jv-nucleo-dock__badge',
    dataset: { conectado: String(conectado) },
  }, conectado ? 'SPOTIFY · ONLINE' : 'SPOTIFY · OFF');
  const faixa = h('span', { className: 'jv-nucleo-dock__faixa', 'aria-live': 'polite' }, '');
  const botao = h('button', {
    className: 'jv-nucleo-dock__botao',
    type: 'button',
    onclick: conectarSpotify,
  }, conectado ? '♫ desconectar' : '♫ conectar spotify');

  const aoMudarSessao = (event: Event): void => {
    const detail = (event as CustomEvent<SpotifySessionEventDetail>).detail;
    if (!detail || typeof detail.connected !== 'boolean') return;
    badge.textContent = detail.connected ? 'SPOTIFY · ONLINE' : 'SPOTIFY · OFF';
    badge.dataset.conectado = String(detail.connected);
    botao.textContent = detail.connected ? '♫ desconectar' : '♫ conectar spotify';
    faixa.textContent = faixaVisivel(detail);
    /* O Núcleo mora num iframe e não fala com o Spotify: sem isto, ele
     * responderia "partitura generativa" com a faixa tocando na cara do
     * operador. Só metadado atravessa — nunca token. */
    visual?.publicarPresencaMusical({
      tocando: detail.connected === true && detail.playback === 'playing',
      titulo: typeof detail.title === 'string' ? detail.title : null,
      artista: typeof detail.artist === 'string' ? detail.artist : null,
    });
  };
  globalThis.addEventListener('baluarte:spotify-session', aoMudarSessao);

  page.appendChild(
    h('div', { className: 'jv-nucleo-dock', role: 'group', 'aria-label': 'Presença musical externa' },
      badge,
      botao,
      faixa,
      h('a', { className: 'jv-nucleo-dock__app', href: '#/baixar' }, 'chat, agentes e memória: no app'),
    ),
  );

  /* Mesma disciplina da página completa: sair da rota desmonta o iframe em vez
   * de deixar um WebGL rodando atrás de outra tela. */
  const pararNaSaida = bus.on<{ path?: string }>('route:change', ({ path }) => {
    if (path === '/jarvis') return;
    globalThis.removeEventListener('baluarte:spotify-session', aoMudarSessao);
    soltarAltura();
    visual?.dispose();
    visual = null;
    pararNaSaida();
  });

  return page;
}
