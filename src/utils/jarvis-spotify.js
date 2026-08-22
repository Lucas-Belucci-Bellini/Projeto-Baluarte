/**
 * Compatibilidade temporária para consumidores JavaScript.
 * A implementação canônica está em `jarvis-spotify.ts`.
 */
export {
  createSpotifyPkceChallenge,
  exchangeSpotifyAuthorizationCode,
  refreshSpotifyAccessToken,
  createSpotifyPlaybackMonitor,
  isSpotifyClientId,
  getConfiguredSpotifyClientId,
  spotifyPlaybackEndpoint,
  spotifyDefaultScope,
} from './jarvis-spotify.ts';
