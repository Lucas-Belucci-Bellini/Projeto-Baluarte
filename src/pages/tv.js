/**
 * Página /tv — TV do Baluarte.
 * 16 canais (playlists do YouTube). Abre tocando o canal "no ar agora"
 * (definido pela hora), lista de canais para trocar, e a grade do dia.
 */

import { h, cx, empty, pad2 } from '../utils/helpers.js';
import { TV_CHANNELS, channelForHour, dailySchedule, TOTAL_CHANNELS } from '../data/tv.js';

let screenEl = null;

function tune(ch) {
  if (!screenEl) return;
  empty(screenEl);
  screenEl.appendChild(h('iframe', {
    className: 'tv-screen__iframe',
    src: `https://www.youtube-nocookie.com/embed/videoseries?list=${ch.playlistId}&autoplay=1&modestbranding=1&rel=0`,
    title: ch.name,
    frameborder: '0',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowfullscreen: true
  }));
  document.querySelectorAll('.tv-ch').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.num === String(ch.num)));
}

export function tvPage() {
  const now = new Date();
  const onAir = channelForHour(now.getHours());

  const page = h('div', { className: 'page-tv' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'MÍDIA'), h('span', null, '›'), h('span', null, 'TV')),
      h('h1', { className: 'page-header__title' }, '📺 TV do Baluarte'),
      h('p', { className: 'page-header__description' },
        `${TOTAL_CHANNELS} canais em rotação contínua. `,
        h('span', { className: 'u-text-cyan' }, `${onAir.name} no ar agora.`))
    )
  );

  screenEl = h('div', { className: 'tv-screen' });

  const chList = h('div', { className: 'tv-channels' },
    ...TV_CHANNELS.map((ch) => h('button', {
      className: cx('tv-ch', ch.num === onAir.num && 'is-active'),
      'data-num': String(ch.num),
      title: ch.name,
      onclick: () => tune(ch)
    },
      h('span', { className: 'tv-ch__num' }, String(ch.num)),
      h('span', { className: 'tv-ch__name' }, ch.name)
    ))
  );

  const sched = h('div', { className: 'tv-sched' });
  dailySchedule().forEach((slot) => {
    sched.appendChild(h('button', {
      className: cx('tv-slot', slot.hour === now.getHours() && 'is-now'),
      onclick: () => tune(slot.channel)
    },
      h('span', { className: 'tv-slot__time u-mono' }, pad2(slot.hour) + 'h'),
      h('span', { className: 'tv-slot__ch' }, slot.channel.name),
      slot.hour === now.getHours() && h('span', { className: 'badge badge--cyan' }, 'AGORA')
    ));
  });

  page.appendChild(
    h('div', { className: 'tv-layout' },
      h('div', { className: 'tv-main' },
        screenEl,
        h('div', { className: 'tv-controls' },
          h('div', { className: 'tv-controls__label u-text-muted' }, 'CANAIS'),
          chList)
      ),
      h('div', { className: 'tv-guide card' },
        h('div', { className: 'section-header' },
          h('h2', { className: 'section-header__title' }, 'Programação de hoje')),
        sched
      )
    )
  );

  /* Sintoniza o canal no ar ao abrir */
  setTimeout(() => tune(onAir), 0);

  return page;
}
