/**
 * Compatibilidade temporária para consumidores JavaScript.
 * A implementação canônica está em `jarvis-spotify-session.ts`.
 */
export {
  beginSpotifyAuthorization,
  resumeSpotifyAuthorization,
  disconnectSpotify,
  isSpotifyConnected,
  spotifyDefaultScope,
} from './jarvis-spotify-session.ts';
