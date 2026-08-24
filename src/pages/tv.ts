/**
 * Página /tv — TV do Baluarte.
 *
 * Mantém a rotação horária, playlists do YouTube, canais customizados e a
 * grade diária com sintonização explícita pelo operador.
 */

import '../styles/tv.css';
import { h, cx, empty, pad2 } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive';
import { TV_CHANNELS, channelForHour, dailySchedule, TOTAL_CHANNELS } from '../data/tv.js';
import type { TvChannel } from '../data/tv.js';

let screenEl: HTMLDivElement | null = null;

function buildEmbedSrc(channel: TvChannel): string {
  if (channel.videoIds && channel.videoIds.length > 0) {
    const [first, ...rest] = channel.videoIds;
    const tail = rest.length ? `&playlist=${rest.join(',')}` : '';
    return `https://www.youtube.com/embed/${first}?autoplay=1&loop=1&modestbranding=1&rel=0${tail}`;
  }
  return `https://www.youtube.com/embed/videoseries?list=${channel.playlistId}&autoplay=1&loop=1&modestbranding=1&rel=0`;
}

function tune(channel: TvChannel): void {
  if (!screenEl) return;
  empty(screenEl);
  screenEl.appendChild(h('iframe', {
    className: 'tv-screen__iframe',
    src: buildEmbedSrc(channel),
    title: channel.name,
    frameborder: '0',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowfullscreen: true,
  }));
  document.querySelectorAll('.tv-ch').forEach((button) => {
    if (button instanceof HTMLElement) button.classList.toggle('is-active', button.dataset.num === String(channel.num));
  });
}

export function tvPage(): HTMLDivElement {
  const now = new Date();
  const onAir = channelForHour(now.getHours());
  const page = h('div', { className: 'page-tv' });
  page.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · MÍDIA · TV',
    title: 'TV do Baluarte',
    sub: 'ROTAÇÃO CONTÍNUA',
    desc: [
      `${TOTAL_CHANNELS} canais em rotação contínua. `,
      h('span', { className: 'u-text-cyan' }, `${onAir.name} no ar agora.`),
    ],
    hudLeft: '📺 CANAIS',
    hudRight: 'NO AR',
  }));

  screenEl = h('div', { className: 'tv-screen' });
  const channelList = h('div', { className: 'tv-channels' },
    ...TV_CHANNELS.map((channel) => h('button', {
      className: cx('tv-ch', channel.num === onAir.num && 'is-active'),
      'data-num': String(channel.num),
      title: channel.name,
      onclick: () => tune(channel),
    },
    h('span', { className: 'tv-ch__num' }, String(channel.num)),
    h('span', { className: 'tv-ch__name' }, channel.name),
    )),
  );

  const schedule = h('div', { className: 'tv-sched' });
  dailySchedule().forEach((slot) => {
    schedule.appendChild(h('button', {
      className: cx('tv-slot', slot.hour === now.getHours() && 'is-now'),
      onclick: () => tune(slot.channel),
    },
    h('span', { className: 'tv-slot__time u-mono' }, `${pad2(slot.hour)}h`),
    h('span', { className: 'tv-slot__ch' }, slot.channel.name),
    slot.hour === now.getHours() ? h('span', { className: 'badge badge--cyan' }, 'AGORA') : false,
    ));
  });

  page.appendChild(h('div', { className: 'tv-layout' },
    h('div', { className: 'tv-main' },
      screenEl,
      h('div', { className: 'tv-controls' },
        h('div', { className: 'tv-controls__label u-text-muted' }, 'CANAIS'), channelList,
      ),
    ),
    h('div', { className: 'tv-guide card' },
      h('div', { className: 'section-header' }, h('h2', { className: 'section-header__title' }, 'Programação de hoje')),
      schedule,
    ),
  ));

  setTimeout(() => tune(onAir), 0);
  return page;
}
