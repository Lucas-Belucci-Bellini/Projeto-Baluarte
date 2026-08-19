/**
 * Compatibilidade temporária para consumidores JavaScript.
 * A implementação canônica está em `jarvis-spotify.ts`.
 */
export {
  createSpotifyPkceChallenge,
  exchangeSpotifyAuthorizationCode,
  refreshSpotifyAccessToken,
  createSpotifyPlaybackMonitor,
  spotifyPlaybackEndpoint,
  spotifyDefaultScope,
} from './jarvis-spotify.ts';
