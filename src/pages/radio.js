/**
 * Página /radio — Rádio (v2.1.0).
 *
 * Dois modos selecionáveis:
 *  • Sintetizador — receptor de rádio sintetizado via Web Audio. O dial
 *    percorre a banda, gera estática entre as estações e trava o sinal
 *    ao sintonizar uma frequência conhecida. 100% offline.
 *  • Online — estações de rádio REAIS da internet, buscadas na Radio
 *    Browser API e tocadas num elemento <audio>. Requer conexão.
 *
 * Rádio RF de verdade (ondas no ar) é impossível num navegador — o modo
 * Online toca streams de internet.
 */

import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { searchStations, COUNTRY_OPTIONS, GENRE_OPTIONS } from '../utils/radio-api.js';

const STORAGE_KEY = 'radio:state';
const BAND_MIN = 87.5;
const BAND_MAX = 108.0;
const LOCK_RANGE = 0.35; /* MHz de tolerância para travar a estação */

/* Estações fixas do sintetizador — cada uma emite um sinal sintetizado distinto. */
const STATIONS = [
  { freq: 89.1,  nome: 'Núcleo FM',        tipo: 'tom',   tom: 220, wave: 'sine',     desc: 'Portadora grave do Núcleo Infinity.' },
  { freq: 92.4,  nome: 'Rádio Alfa',       tipo: 'acorde', tom: 330, wave: 'triangle', desc: 'Acorde de três tons da equipe ALFA.' },
  { freq: 95.7,  nome: 'Sinal Morse OMEGA', tipo: 'morse', tom: 620, wave: 'sine',     desc: 'Baliza repetindo "BALUARTE" em Morse.' },
  { freq: 98.9,  nome: 'Onda Drift',       tipo: 'sweep', tom: 440, wave: 'sawtooth',  desc: 'Varredura contínua estilo Eurobeat.' },
  { freq: 101.5, nome: 'Estação Vanadis',  tipo: 'tom',   tom: 523, wave: 'sine',      desc: 'Tom cristalino de referência.' },
  { freq: 104.3, nome: 'Frequência 11',    tipo: 'acorde', tom: 174, wave: 'square',   desc: 'Acorde sombrio do arco INDIA.' },
  { freq: 106.8, nome: 'Beacon Shadow',    tipo: 'morse', tom: 760, wave: 'square',    desc: 'Baliza cifrada de baixa potência.' }
];

const MORSE = { B: '-...', A: '.-', L: '.-..', U: '..-', R: '.-.', T: '-', E: '.' };
const MORSE_WORD = 'BALUARTE';

let routeWatcher = null;
let current = null; /* { el, stop } da view ativa */

/* Estado persistido, normalizado. */
function loadState() {
  const state = storage.get(STORAGE_KEY) || {};
  if (typeof state.freq !== 'number') state.freq = 95.7;
  if (typeof state.volume !== 'number') state.volume = 0.6;
  if (typeof state.onlineVolume !== 'number') state.onlineVolume = 0.7;
  if (state.mode !== 'online' && state.mode !== 'synth') state.mode = 'synth';
  if (!state.query || typeof state.query !== 'object') {
    state.query = { name: '', country: 'BR', tag: '' };
  }
  return state;
}

export function radioPage() {
  const state = loadState();

  const fullPage = h('div', { className: 'page-radio' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'MÍDIA'), h('span', null, '›'),
        h('span', null, 'RÁDIO')),
      h('h1', { className: 'page-header__title' }, '◉))) Rádio'),
      h('p', { className: 'page-header__description' },
        'Dois modos: ',
        h('span', { className: 'u-text-cyan' }, 'Sintetizador'),
        ' — um receptor sintetizado via Web Audio, totalmente offline — e ',
        h('span', { className: 'u-text-cyan' }, 'Online'),
        ' — estações de rádio reais da internet via Radio Browser API. ',
        'Rádio RF de verdade não funciona no navegador; o modo Online toca streams.')
    )
  );

  /* ===== Alternador de modo ===== */
  const modeBtns = {};
  const modeBar = h('div', { className: 'radio-mode' });
  [
    { id: 'synth', label: '◉ Sintetizador' },
    { id: 'online', label: '◈ Online' }
  ].forEach((m) => {
    const btn = h('button', {
      className: 'radio-mode__btn',
      onclick: () => setMode(m.id)
    }, m.label);
    modeBtns[m.id] = btn;
    modeBar.appendChild(btn);
  });
  fullPage.appendChild(modeBar);

  const contentEl = h('div', { className: 'radio-content' });
  fullPage.appendChild(contentEl);

  function setMode(mode) {
    if (current) current.stop();
    state.mode = mode;
    storage.set(STORAGE_KEY, state);
    Object.entries(modeBtns).forEach(([id, btn]) =>
      btn.classList.toggle('is-active', id === mode));
    current = mode === 'online' ? buildOnlineView(state) : buildSynthView(state);
    empty(contentEl);
    contentEl.appendChild(current.el);
  }

  /* Encerra o áudio ao sair da rota /radio */
  if (routeWatcher) window.removeEventListener('hashchange', routeWatcher);
  routeWatcher = () => {
    if (!location.hash.startsWith('#/radio')) {
      if (current) current.stop();
      current = null;
      window.removeEventListener('hashchange', routeWatcher);
      routeWatcher = null;
    }
  };
  window.addEventListener('hashchange', routeWatcher);

  setMode(state.mode);
  return fullPage;
}

/* ============================================================
 * Modo Sintetizador — receptor sintetizado via Web Audio
 * ============================================================ */

function buildSynthView(state) {
  let power = false;
  let morseTimer = null;
  let raf = 0;
  let audio = null; /* { ctx, noise, noiseGain, osc, sigGain, master } */

  const view = h('div', { className: 'radio-synth' });

  /* ===== Visor ===== */
  const freqDisplay = h('div', { className: 'radio-display__freq u-mono' }, state.freq.toFixed(1));
  const stationName = h('div', { className: 'radio-display__station' }, '— estática —');
  const signalBars = h('div', { className: 'radio-signal' });
  for (let i = 0; i < 8; i++) signalBars.appendChild(h('span', { className: 'radio-signal__bar' }));

  /* ===== Áudio ===== */
  function startAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();

    /* ruído branco (estática) */
    const bufSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;

    /* oscilador do sinal da estação */
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 440;
    const sigGain = ctx.createGain();
    sigGain.gain.value = 0;

    const master = ctx.createGain();
    master.gain.value = state.volume;

    noise.connect(noiseGain);
    noiseGain.connect(master);
    osc.connect(sigGain);
    sigGain.connect(master);
    master.connect(ctx.destination);

    noise.start();
    osc.start();
    audio = { ctx, noise, noiseGain, osc, sigGain, master };
  }

  /* Estação mais próxima + proximidade 0..1. */
  function nearest(freq) {
    let best = null;
    let bestDist = Infinity;
    for (const s of STATIONS) {
      const d = Math.abs(s.freq - freq);
      if (d < bestDist) { bestDist = d; best = s; }
    }
    const proximity = bestDist <= LOCK_RANGE ? 1 - bestDist / LOCK_RANGE : 0;
    return { station: best, proximity };
  }

  function clearMorse() {
    if (morseTimer) { clearTimeout(morseTimer); morseTimer = null; }
  }

  /* Reproduz a baliza Morse repetindo a palavra. */
  function runMorse(station) {
    clearMorse();
    if (!audio) return;
    const unit = 90;
    const seq = [];
    for (const ch of MORSE_WORD) {
      const code = MORSE[ch] || '';
      for (const sym of code) {
        seq.push({ on: true, ms: sym === '-' ? unit * 3 : unit });
        seq.push({ on: false, ms: unit });
      }
      seq.push({ on: false, ms: unit * 2 });
    }
    let i = 0;
    const step = () => {
      if (!audio || !power) return;
      const { proximity } = nearest(state.freq);
      const seg = seq[i % seq.length];
      const g = seg.on ? proximity * 0.5 : 0;
      audio.sigGain.gain.setTargetAtTime(g, audio.ctx.currentTime, 0.01);
      i++;
      morseTimer = setTimeout(step, seg.ms);
    };
    step();
  }

  /* Atualiza o áudio e o visor conforme a sintonia. */
  function tune() {
    freqDisplay.textContent = state.freq.toFixed(1);
    const { station, proximity } = nearest(state.freq);
    const locked = proximity > 0;

    /* barras de sinal */
    const lit = Math.round(proximity * 8);
    [...signalBars.children].forEach((bar, idx) =>
      bar.classList.toggle('is-lit', idx < lit));

    stationName.textContent = locked && power
      ? `▸ ${station.nome}`
      : (power ? '— estática —' : 'desligado');
    stationName.classList.toggle('is-locked', locked && power);

    if (!audio || !power) return;
    const t = audio.ctx.currentTime;

    /* estática inversamente proporcional à proximidade */
    audio.noiseGain.gain.setTargetAtTime((1 - proximity) * 0.16, t, 0.05);

    if (station) {
      audio.osc.type = station.wave;
      if (station.tipo === 'morse') {
        audio.osc.frequency.setTargetAtTime(station.tom, t, 0.02);
        if (!morseTimer) runMorse(station);
        return;
      }
      clearMorse();
      if (station.tipo === 'sweep') {
        audio.osc.frequency.setTargetAtTime(
          station.tom + Math.sin(t * 1.5) * 120, t, 0.05);
      } else {
        audio.osc.frequency.setTargetAtTime(station.tom, t, 0.03);
      }
      audio.sigGain.gain.setTargetAtTime(proximity * 0.32, t, 0.04);
    } else {
      clearMorse();
      audio.sigGain.gain.setTargetAtTime(0, t, 0.05);
    }
  }

  /* loop leve só para o efeito de sweep contínuo */
  function loop() {
    if (power && audio) {
      const { station } = nearest(state.freq);
      if (station && station.tipo === 'sweep') tune();
    }
    raf = requestAnimationFrame(loop);
  }

  /* ===== Controles ===== */
  const powerBtn = h('button', { className: 'btn btn--primary' }, '⏻ Ligar');
  powerBtn.onclick = () => {
    power = !power;
    if (power) {
      if (!audio) startAudio();
      if (audio.ctx.state === 'suspended') audio.ctx.resume();
      powerBtn.textContent = '⏻ Desligar';
      powerBtn.classList.add('is-on');
      if (!raf) loop();
      toast('Rádio ligado', { type: 'success' });
    } else {
      powerBtn.textContent = '⏻ Ligar';
      powerBtn.classList.remove('is-on');
      clearMorse();
      if (audio) {
        audio.noiseGain.gain.value = 0;
        audio.sigGain.gain.value = 0;
      }
    }
    tune();
  };

  const dial = h('input', {
    className: 'radio-dial',
    type: 'range',
    min: String(BAND_MIN),
    max: String(BAND_MAX),
    step: '0.1',
    value: String(state.freq),
    oninput: (e) => {
      state.freq = parseFloat(e.target.value);
      storage.set(STORAGE_KEY, state);
      clearMorse();
      tune();
    }
  });

  const volLabel = h('span', { className: 'u-mono u-text-cyan radio-vol__val' },
    `${Math.round(state.volume * 100)}%`);
  const volSlider = h('input', {
    type: 'range', min: '0', max: '1', step: '0.05', value: String(state.volume),
    oninput: (e) => {
      state.volume = parseFloat(e.target.value);
      volLabel.textContent = `${Math.round(state.volume * 100)}%`;
      storage.set(STORAGE_KEY, state);
      if (audio) audio.master.gain.setTargetAtTime(state.volume, audio.ctx.currentTime, 0.02);
    }
  });

  /* ===== Layout ===== */
  view.appendChild(
    h('div', { className: 'radio-set card' },
      h('div', { className: 'radio-display' },
        h('div', null,
          freqDisplay,
          h('span', { className: 'radio-display__unit' }, 'MHz')),
        stationName,
        signalBars
      ),
      h('div', { className: 'radio-dial-wrap' },
        h('span', { className: 'radio-dial__min' }, String(BAND_MIN)),
        dial,
        h('span', { className: 'radio-dial__max' }, String(BAND_MAX))
      ),
      h('div', { className: 'radio-controls' },
        powerBtn,
        h('label', { className: 'radio-vol' },
          h('span', null, 'Volume'), volSlider, volLabel)
      )
    )
  );

  /* Estações — clique sintoniza */
  view.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Estações Conhecidas'))
  );
  const list = h('div', { className: 'radio-stations' });
  STATIONS.forEach((s) => {
    list.appendChild(
      h('button', {
        className: 'radio-station',
        onclick: () => {
          state.freq = s.freq;
          dial.value = String(s.freq);
          storage.set(STORAGE_KEY, state);
          clearMorse();
          tune();
          if (!power) toast('Ligue o rádio para ouvir', { type: 'info' });
        }
      },
        h('span', { className: 'radio-station__freq u-mono' }, s.freq.toFixed(1)),
        h('span', { className: 'radio-station__body' },
          h('span', { className: 'radio-station__nome' }, s.nome),
          h('span', { className: 'radio-station__desc' }, s.desc))
      )
    );
  });
  view.appendChild(list);

  tune();

  return {
    el: view,
    stop() {
      clearMorse();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (audio) {
        try { audio.ctx.close(); } catch {}
        audio = null;
      }
    }
  };
}

/* ============================================================
 * Modo Online — estações reais via Radio Browser API
 * ============================================================ */

function buildOnlineView(state) {
  const view = h('div', { className: 'radio-online' });

  const audioEl = new Audio();
  audioEl.preload = 'none';
  audioEl.volume = state.onlineVolume;

  let currentStation = null;
  const resultCards = new Map(); /* uuid -> elemento do card */

  /* ===== Painel "tocando agora" ===== */
  const npIcon = h('span', { className: 'radio-np__icon' }, '◉');
  const npName = h('div', { className: 'radio-np__name' }, 'Nenhuma estação');
  const npMeta = h('div', { className: 'radio-np__meta u-mono' },
    'Busque e escolha uma estação abaixo');
  const stopBtn = h('button', { className: 'btn btn--sm', disabled: true }, '■ Parar');

  const volValue = h('span', { className: 'u-mono u-text-cyan radio-vol__val' },
    `${Math.round(state.onlineVolume * 100)}%`);
  const volSlider = h('input', {
    type: 'range', min: '0', max: '1', step: '0.05', value: String(state.onlineVolume),
    oninput: (e) => {
      state.onlineVolume = parseFloat(e.target.value);
      audioEl.volume = state.onlineVolume;
      volValue.textContent = `${Math.round(state.onlineVolume * 100)}%`;
      storage.set(STORAGE_KEY, state);
    }
  });

  const nowPlaying = h('div', { className: 'radio-np card', dataset: { state: 'idle' } },
    npIcon,
    h('div', { className: 'radio-np__body' }, npName, npMeta),
    h('div', { className: 'radio-np__controls' },
      stopBtn,
      h('label', { className: 'radio-vol' },
        h('span', null, 'Vol'), volSlider, volValue))
  );
  view.appendChild(nowPlaying);

  /* Atualiza o painel: idle | loading | playing | error. */
  function setNowPlaying(phase, station, message) {
    nowPlaying.dataset.state = phase;
    const icons = { idle: '◉', loading: '◌', playing: '▶', error: '⚠' };
    npIcon.textContent = icons[phase] || '◉';
    if (station) {
      npName.textContent = station.name;
      const bits = [
        station.country,
        station.codec,
        station.bitrate ? `${station.bitrate} kbps` : ''
      ].filter(Boolean);
      npMeta.textContent = message || bits.join(' · ') || '—';
    } else {
      npName.textContent = 'Nenhuma estação';
      npMeta.textContent = message || 'Busque e escolha uma estação abaixo';
    }
    stopBtn.disabled = phase === 'idle';
  }

  function highlight(uuid) {
    resultCards.forEach((card, id) => card.classList.toggle('is-playing', id === uuid));
  }

  function stopPlayback() {
    currentStation = null;
    audioEl.pause();
    audioEl.removeAttribute('src');
    audioEl.load();
    highlight(null);
    setNowPlaying('idle', null);
  }
  stopBtn.onclick = stopPlayback;

  function playStation(station) {
    /* Site servido por HTTPS não toca stream HTTP (mixed content). */
    if (location.protocol === 'https:' && station.url.startsWith('http:')) {
      currentStation = station;
      highlight(station.uuid);
      setNowPlaying('error', station, 'Stream HTTP bloqueado pelo navegador (site em HTTPS)');
      toast('Estação HTTP — bloqueada em site HTTPS', { type: 'warning' });
      return;
    }
    currentStation = station;
    highlight(station.uuid);
    setNowPlaying('loading', station, 'Conectando…');
    audioEl.src = station.url;
    const attempt = audioEl.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {
        if (currentStation === station) {
          setNowPlaying('error', station, 'Não foi possível tocar esta estação');
        }
      });
    }
  }

  audioEl.addEventListener('playing', () => {
    if (currentStation) setNowPlaying('playing', currentStation);
  });
  audioEl.addEventListener('waiting', () => {
    if (currentStation) setNowPlaying('loading', currentStation, 'Carregando…');
  });
  audioEl.addEventListener('stalled', () => {
    if (currentStation) setNowPlaying('loading', currentStation, 'Sinal travado…');
  });
  audioEl.addEventListener('error', () => {
    if (currentStation) setNowPlaying('error', currentStation, 'Stream fora do ar ou indisponível');
  });

  /* ===== Formulário de busca ===== */
  const nameInput = h('input', {
    className: 'input',
    type: 'search',
    placeholder: 'Nome da estação (opcional)…',
    value: state.query.name || '',
    onkeydown: (e) => { if (e.key === 'Enter') doSearch(); }
  });

  const countrySel = h('select', { className: 'input' },
    ...COUNTRY_OPTIONS.map((o) =>
      h('option', { value: o.value, selected: o.value === state.query.country }, o.label)));

  const genreSel = h('select', { className: 'input' },
    ...GENRE_OPTIONS.map((o) =>
      h('option', { value: o.value, selected: o.value === state.query.tag }, o.label)));

  const searchBtn = h('button', { className: 'btn btn--primary' }, 'Buscar');

  view.appendChild(
    h('div', { className: 'radio-search card' },
      h('label', { className: 'radio-search__field' },
        h('span', null, 'Nome'), nameInput),
      h('label', { className: 'radio-search__field' },
        h('span', null, 'País'), countrySel),
      h('label', { className: 'radio-search__field' },
        h('span', null, 'Gênero'), genreSel),
      searchBtn)
  );

  /* ===== Resultados ===== */
  view.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Estações'))
  );
  const resultsEl = h('div', { className: 'radio-results' });
  view.appendChild(resultsEl);

  function renderMessage(text, kind) {
    empty(resultsEl);
    resultCards.clear();
    resultsEl.appendChild(
      h('div', { className: kind === 'error' ? 'radio-results__msg u-text-danger' : 'radio-results__msg u-text-muted' },
        text));
  }

  function renderResults(list) {
    empty(resultsEl);
    resultCards.clear();
    if (!list.length) {
      renderMessage('Nenhuma estação encontrada. Tente outros filtros.');
      return;
    }
    list.forEach((s) => {
      const blocked = location.protocol === 'https:' && s.url.startsWith('http:');
      const meta = [s.country, ...s.tags.slice(0, 3)].filter(Boolean).join(' · ') || 'sem gênero';
      const card = h('button', {
        className: blocked ? 'radio-result is-http' : 'radio-result',
        title: blocked ? 'Stream HTTP — bloqueado em site HTTPS' : s.url,
        onclick: () => playStation(s)
      },
        h('span', { className: 'radio-result__play' }, '▸'),
        h('span', { className: 'radio-result__body' },
          h('span', { className: 'radio-result__name' }, s.name),
          h('span', { className: 'radio-result__meta u-mono' }, meta)),
        h('span', { className: 'radio-result__tag u-mono' },
          blocked ? 'HTTP' : (s.bitrate ? `${s.bitrate}k` : s.codec))
      );
      resultCards.set(s.uuid, card);
      resultsEl.appendChild(card);
    });
    if (currentStation) highlight(currentStation.uuid);
  }

  let searching = false;
  async function doSearch() {
    if (searching) return;
    searching = true;
    searchBtn.disabled = true;
    searchBtn.textContent = 'Buscando…';
    state.query = {
      name: nameInput.value.trim(),
      country: countrySel.value,
      tag: genreSel.value
    };
    storage.set(STORAGE_KEY, state);
    renderMessage('Buscando estações…');
    try {
      const list = await searchStations({
        name: state.query.name,
        countryCode: state.query.country,
        tag: state.query.tag,
        limit: 100
      });
      renderResults(list);
    } catch (err) {
      renderMessage('Falha ao buscar estações: ' + err.message, 'error');
      toast('Erro ao buscar estações', { type: 'danger' });
    } finally {
      searching = false;
      searchBtn.disabled = false;
      searchBtn.textContent = 'Buscar';
    }
  }
  searchBtn.onclick = doSearch;

  setNowPlaying('idle', null);
  doSearch(); /* carga inicial com os filtros salvos */

  return {
    el: view,
    stop() {
      currentStation = null;
      audioEl.pause();
      audioEl.removeAttribute('src');
      audioEl.load();
    }
  };
}
