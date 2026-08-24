import { clearStatus, setStatus, type StatusValue } from './baluarte-status';

export type JarvisMusicSource = 'html-media' | 'spotify-embed' | 'spotify-api' | 'spotify-soloist' | 'sistema';
export type JarvisMusicPlayback = 'playing' | 'paused' | 'unknown' | 'idle';

export interface JarvisMusicSnapshot {
  readonly playback: JarvisMusicPlayback;
  readonly source: JarvisMusicSource | null;
  readonly title: string | null;
  readonly artist: string | null;
  readonly positionMs: number | null;
  readonly durationMs: number | null;
  readonly observedAt: string;
}

const STATUS_KEY = 'jarvisMusic';
let started = false;
let current: JarvisMusicSnapshot = idleSnapshot();

function now(): string {
  return new Date().toISOString();
}

function idleSnapshot(): JarvisMusicSnapshot {
  return Object.freeze({
    playback: 'idle',
    source: null,
    title: null,
    artist: null,
    positionMs: null,
    durationMs: null,
    observedAt: now(),
  });
}

function text(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function finite(value: number | undefined): number | null {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

function publish(snapshot: JarvisMusicSnapshot): void {
  current = Object.freeze(snapshot);
  if (snapshot.playback === 'idle') {
    clearStatus(STATUS_KEY);
    return;
  }
  const status: Record<string, StatusValue> = {
    playback: snapshot.playback,
    source: snapshot.source,
    title: snapshot.title,
    artist: snapshot.artist,
    positionMs: snapshot.positionMs,
    durationMs: snapshot.durationMs,
    observedAt: snapshot.observedAt,
    privacy: 'metadados de reprodução; sem captura de áudio',
  };
  setStatus(STATUS_KEY, status);
}

function metadataFor(media: HTMLMediaElement): { readonly title: string | null; readonly artist: string | null } {
  const title = text(media.dataset.jarvisTitle)
    ?? text(media.getAttribute('aria-label'))
    ?? text(media.closest('[data-track-title]')?.getAttribute('data-track-title'));
  const artist = text(media.dataset.jarvisArtist)
    ?? text(media.closest('[data-track-artist]')?.getAttribute('data-track-artist'));
  return { title, artist };
}

function observeMedia(media: HTMLMediaElement): void {
  const metadata = metadataFor(media);
  if (media.paused || media.ended) {
    if (current.source === 'html-media') publish(idleSnapshot());
    return;
  }
  publish({
    playback: 'playing',
    source: 'html-media',
    title: metadata.title,
    artist: metadata.artist,
    positionMs: finite(media.currentTime * 1000),
    durationMs: finite(media.duration * 1000),
    observedAt: now(),
  });
}

function onMediaEvent(event: Event): void {
  const target = event.target;
  if (target instanceof HTMLMediaElement) observeMedia(target);
}

export function observeJarvisSpotifyPlayback(
  title: string,
  artist: string | null,
  positionMs: number | undefined,
  durationMs: number | undefined,
  playing: boolean,
): void {
  if (!playing) {
    if (current.source === 'spotify-embed') publish(idleSnapshot());
    return;
  }
  publish({
    playback: 'playing',
    source: 'spotify-embed',
    title: text(title),
    artist: text(artist),
    positionMs: finite(positionMs),
    durationMs: finite(durationMs),
    observedAt: now(),
  });
}

export function observeJarvisSpotifyApiPlayback(
  playback: 'playing' | 'paused' | 'unknown',
  title: string | null,
  artist: string | null,
  positionMs: number | undefined,
  durationMs: number | undefined,
): void {
  publish({
    playback,
    source: 'spotify-api',
    title: text(title),
    artist: text(artist),
    positionMs: finite(positionMs),
    durationMs: finite(durationMs),
    observedAt: now(),
  });
}

export function observeJarvisSpotifySoloistPlayback(
  playback: 'playing' | 'paused' | 'unknown',
  title: string | null,
  artist: string | null,
  positionMs: number | undefined,
  durationMs: number | undefined,
): void {
  publish({
    playback,
    source: 'spotify-soloist',
    title: text(title),
    artist: text(artist),
    positionMs: finite(positionMs),
    durationMs: finite(durationMs),
    observedAt: now(),
  });
}

/**
 * O que o SISTEMA diz que está tocando (SMTC do Windows, pelo app).
 *
 * Fonte diferente das outras em espécie, não só em nome: as demais observam algo
 * que o próprio Baluarte embute, e esta observa o computador inteiro — vale para
 * o Spotify, o navegador, o VLC. Sem posição nem duração, porque o SMTC não as
 * garante em todas as aplicações e um número que às vezes mente é pior que
 * nenhum.
 */
export function observeJarvisSistemaPlayback(
  playback: 'playing' | 'paused' | 'unknown',
  title: string | null,
  artist: string | null,
): void {
  publish({
    playback,
    source: 'sistema',
    title: text(title),
    artist: text(artist),
    positionMs: null,
    durationMs: null,
    observedAt: now(),
  });
}

export function getJarvisMusicSnapshot(): JarvisMusicSnapshot {
  return Object.freeze({ ...current });
}

export function startJarvisMusicPresence(): void {
  if (started || typeof document === 'undefined') return;
  started = true;
  document.addEventListener('play', onMediaEvent, true);
  document.addEventListener('pause', onMediaEvent, true);
  document.addEventListener('ended', onMediaEvent, true);
  document.addEventListener('timeupdate', onMediaEvent, true);
}

export function stopJarvisMusicPresence(): void {
  if (!started || typeof document === 'undefined') return;
  document.removeEventListener('play', onMediaEvent, true);
  document.removeEventListener('pause', onMediaEvent, true);
  document.removeEventListener('ended', onMediaEvent, true);
  document.removeEventListener('timeupdate', onMediaEvent, true);
  started = false;
  publish(idleSnapshot());
}
