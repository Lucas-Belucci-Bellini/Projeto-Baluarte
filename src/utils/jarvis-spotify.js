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
  SPOTIFY_PUBLIC_CLIENT_ID,
  spotifyPlaybackEndpoint,
  spotifyDefaultScope,
} from './jarvis-spotify.ts';
