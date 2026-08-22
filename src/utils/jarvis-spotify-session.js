/**
 * Compatibilidade temporária para consumidores JavaScript.
 * A implementação canônica está em `jarvis-spotify-session.ts`.
 */
export {
  beginSpotifyAuthorization,
  resumeSpotifyAuthorization,
  disconnectSpotify,
  getSpotifyClientId,
  isSpotifyConnected,
  rememberSpotifyClientId,
  spotifyDefaultScope,
} from './jarvis-spotify-session.ts';
