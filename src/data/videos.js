/**
 * Catálogo de vídeos do Baluarte (Fase 16).
 *
 * Embeds YouTube + estrutura para arquivos locais.
 * Organizados em playlists temáticas.
 */

export const PLAYLISTS = [
  {
    id: 'tutoriais',
    title: 'Tutoriais de Operações',
    icon: '◆',
    color: '#00f0ff',
    description: 'Como executar manobras táticas básicas e avançadas.',
    videos: [
      { id: 'op-1', title: 'CQB · Empilhamento na porta', duration: '8:42', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['CQB', 'doutrina'] },
      { id: 'op-2', title: 'Overwatch · Par sniper-spotter', duration: '12:15', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['sniper', 'doutrina'] },
      { id: 'op-3', title: 'Fireteam · Bound-overwatch', duration: '9:30', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['fireteam'] },
      { id: 'op-4', title: 'EVAC · TCCC + M-A-R-C-H', duration: '15:00', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['médico'] }
    ]
  },
  {
    id: 'cronicas',
    title: 'Crônicas em Vídeo',
    icon: '◫',
    color: '#ff00aa',
    description: 'Adaptações narrativas dos arcos das Crônicas da Baluarte.',
    videos: [
      { id: 'cr-1', title: 'Despertar do Núcleo (ALFA)', duration: '24:18', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['ALFA', 'origem'] },
      { id: 'cr-2', title: 'Sinal de Phobos (BRAVO)', duration: '31:42', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['BRAVO', 'DOOM'] },
      { id: 'cr-3', title: 'Vermelho de Reach (CHARLIE)', duration: '28:55', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['CHARLIE', 'Halo'] },
      { id: 'cr-4', title: 'Onda Vermelha (DELTA)', duration: '35:10', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['DELTA', 'Pacific Rim'] },
      { id: 'cr-5', title: 'Sistema Aberto (ECHO)', duration: '42:00', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['ECHO', 'Solo Leveling'] }
    ]
  },
  {
    id: 'equipamento',
    title: 'Equipamento Mark XIII',
    icon: '⌖',
    color: '#00ff88',
    description: 'Demonstrações e specs das armas e veículos experimentais.',
    videos: [
      { id: 'eq-1', title: 'Plasma Lance Mk IV — disparo controlado', duration: '6:22', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['experimental'] },
      { id: 'eq-2', title: 'Coilgun Saga — alcance Mach 7', duration: '7:18', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['sniper'] },
      { id: 'eq-3', title: 'Jaeger Mark II — boot sequence', duration: '18:45', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['mecha'] },
      { id: 'eq-4', title: 'Capsule Pod ORBITER — inserção orbital', duration: '11:30', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['orbital'] }
    ]
  },
  {
    id: 'dev',
    title: 'Diário de Desenvolvimento',
    icon: '⌨',
    color: '#7c4dff',
    description: 'Behind-the-scenes do Mark XIII — código, decisões técnicas, falhas das 12 versões anteriores.',
    videos: [
      { id: 'dev-1', title: 'Por que o Mark XIII não usa TypeScript', duration: '14:20', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['stack'] },
      { id: 'dev-2', title: 'Marks I a XII — autópsia das 12 falhas', duration: '38:00', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['história'] },
      { id: 'dev-3', title: 'Vite + JS puro: arquitetura', duration: '22:15', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['stack', 'arquitetura'] }
    ]
  },
  {
    id: 'audio',
    title: 'Som & Trilha',
    icon: '♪',
    color: '#ffaa00',
    description: 'Sound design e trilha sonora narrativa.',
    videos: [
      { id: 'au-1', title: 'Tema do Núcleo Infinity', duration: '4:32', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['trilha'] },
      { id: 'au-2', title: 'Som de Drift (Pacific Rim BR)', duration: '6:00', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['drift'] },
      { id: 'au-3', title: 'Coro de Vanadis', duration: '5:45', source: 'youtube', ytId: 'dQw4w9WgXcQ', tags: ['Vanadis'] },
      { id: 'au-4', title: "Back To Earth — Assassin's Creed [GMV] · TeaTime", duration: '—', source: 'youtube', ytId: 'vyQwj7_l2N0', tags: ['trilha', 'GMV'] }
    ]
  },
  {
    id: 'musica-yt',
    title: 'Músicas (Playlists)',
    icon: '♫',
    color: '#ff00aa',
    description: 'Playlists de música do operador, direto do YouTube.',
    videos: [
      { id: 'myt-1', title: 'Mix de Música 1', duration: 'playlist', source: 'youtube-playlist', playlistId: 'PLb-ZStpDcG_v1pylb4a2Go-DMQ8mhD8j9', tags: ['música', 'playlist'] },
      { id: 'myt-2', title: 'Mix de Música 2', duration: 'playlist', source: 'youtube-playlist', playlistId: 'PLb-ZStpDcG_vOKD7tJAoGOBqmLdgcRCJV', tags: ['música', 'playlist'] }
    ]
  }
];

export const TOTAL_VIDEOS = PLAYLISTS.reduce((s, p) => s + p.videos.length, 0);
export const TOTAL_PLAYLISTS = PLAYLISTS.length;

export function findPlaylist(id) {
  return PLAYLISTS.find((p) => p.id === id) || null;
}

export function findVideo(videoId) {
  for (const p of PLAYLISTS) {
    const v = p.videos.find((v) => v.id === videoId);
    if (v) return { ...v, playlistId: p.id, playlistTitle: p.title };
  }
  return null;
}
