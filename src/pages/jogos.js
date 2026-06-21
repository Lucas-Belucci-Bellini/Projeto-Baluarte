/**
 * Página /jogos — Arcade Baluarte.
 *
 * Hub de jogos (NÃO abre um jogo direto): cartões de seleção, contas locais
 * (nome + senha), XP/nível, ranking e "continuar de onde parou".
 *
 * Jogos:
 *   - Code Quest — Linguagens  (jogo grande, multi-linguagem; campanha + treino)
 *   - JavaScript — Qual a saída?
 *   - HTML — Qual a tag certa?
 *   - CSS — Acerte o Layout (Flexbox)
 *
 * Pontuação: cada acerto = 10 pts → XP → nível/patente. Ranking local por pontos.
 */

import '../styles/jogos.css';
import { h, empty, cx } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import * as players from '../utils/players-engine.js';
import { JS_DESAFIOS, HTML_DESAFIOS, CSS_NIVEIS, JUSTIFY_OPCOES, ALIGN_OPCOES } from '../data/jogos.js';
import { CODE_QUEST, CODE_QUEST_TOTAL } from '../data/code-quest.js';

const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

/* ===== Catálogo de jogos ===== */
const GAMES = [
  { id: 'code-quest', icon: '🧩', accent: 'cyan', tag: 'NOVO', title: 'Code Quest — Linguagens',
    desc: `Aprenda ${CODE_QUEST.length} linguagens jogando — ${CODE_QUEST_TOTAL} desafios de código.` },
  { id: 'js', icon: '⌨', accent: 'cyan', title: 'JavaScript — Qual a saída?',
    desc: 'Preveja exatamente o que o console imprime.' },
  { id: 'html', icon: '🔶', accent: 'magenta', title: 'HTML — Qual a tag certa?',
    desc: 'Escolha a marcação correta para cada objetivo.' },
  { id: 'css', icon: '🎨', accent: 'magenta', title: 'CSS — Acerte o Layout',
    desc: 'Domine justify-content e align-items no Flexbox.' }
];

/* ============================================================
 *  Página (orquestra as views: hub / auth / jogo)
 * ============================================================ */
export function jogosPage() {
  const page = h('div', { className: 'page-arcade' });
  const bar = h('div', { className: 'arc-bar card' });
  const view = h('div', { className: 'arc-view' });
  page.append(buildHeader(), bar, view);

  function refreshBar() {
    renderBar(bar, {
      onAuth: () => showAuth(view, { onDone: () => { refreshBar(); showHub(); }, onCancel: showHub }),
      onLogout: () => { players.logout(); toast('Você saiu da conta.'); refreshBar(); showHub(); }
    });
  }
  function showHub() {
    renderHub(view, { onPlay: openGame });
  }
  function openGame(gameId) {
    renderGame(view, gameId, { back: showHub, refreshBar });
  }

  refreshBar();
  showHub(); /* HUB por padrão — nunca abre um jogo automaticamente */
  return page;
}

function buildHeader() {
  return h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'CONHECIMENTO'), h('span', null, '›'), h('span', null, 'ARCADE')),
    h('h1', { className: 'page-header__title' }, '🎮 Arcade Baluarte'),
    h('p', { className: 'page-header__description' },
      'Vários jogos para aprender programação. ',
      h('span', { className: 'u-text-cyan' }, 'Crie sua conta'),
      ', pontue, suba de nível e dispute o ranking.'));
}

/* ============================================================
 *  Barra do jogador (login / nível / pontos)
 * ============================================================ */
function renderBar(bar, { onAuth, onLogout }) {
  empty(bar);
  const p = players.current();
  if (!p) {
    bar.append(
      h('div', { className: 'arc-bar__user' },
        h('span', { className: 'arc-bar__avatar is-guest' }, '?'),
        h('div', { className: 'arc-bar__info' },
          h('div', { className: 'arc-bar__name' }, 'Visitante'),
          h('div', { className: 'arc-bar__sub u-text-muted' }, 'Entre para salvar pontos, nível e ranking'))),
      h('button', { className: 'btn btn--primary btn--sm', onclick: onAuth }, 'Entrar / Criar conta'));
    return;
  }
  bar.append(
    h('div', { className: 'arc-bar__user' },
      h('span', { className: 'arc-bar__avatar' }, p.name.slice(0, 1).toUpperCase()),
      h('div', { className: 'arc-bar__info' },
        h('div', { className: 'arc-bar__name' }, p.name,
          h('span', { className: 'arc-bar__patente' }, p.patente)),
        h('div', { className: 'arc-bar__xp' },
          h('div', { className: 'arc-bar__xpbar' }, h('span', { style: { width: p.xpPct + '%' } })),
          h('span', { className: 'arc-bar__xptxt u-mono' }, `Nível ${p.level} · ${p.points} pts`)))),
    h('button', { className: 'btn btn--ghost btn--sm', onclick: onLogout }, 'Sair'));
}

/* ============================================================
 *  Tela de conta (entrar / criar)
 * ============================================================ */
function showAuth(view, { onDone, onCancel }) {
  empty(view);
  let tab = 'login';
  const card = h('div', { className: 'arc-auth card' });

  function tabBtn(id, label) {
    return h('button', { className: cx('arc-auth__tab', tab === id && 'is-active'), onclick: () => { tab = id; render(); } }, label);
  }

  function render() {
    empty(card);
    const nameI = h('input', { className: 'input', placeholder: 'Nome de jogador', maxlength: 24, autocomplete: 'username' });
    const passI = h('input', {
      className: 'input', type: 'password', placeholder: 'Senha (mín. 4 caracteres)',
      autocomplete: tab === 'login' ? 'current-password' : 'new-password',
      onkeydown: (e) => { if (e.key === 'Enter') submit(); }
    });
    const fb = h('div', { className: 'arc-auth__fb' });

    async function submit() {
      fb.className = 'arc-auth__fb';
      fb.textContent = '';
      try {
        const p = tab === 'login'
          ? await players.login(nameI.value, passI.value)
          : await players.register(nameI.value, passI.value);
        toast(`${tab === 'login' ? 'Bem-vindo de volta' : 'Conta criada'}, ${p.name}!`, { type: 'success' });
        onDone();
      } catch (err) {
        fb.className = 'arc-auth__fb is-no';
        fb.textContent = err.message || 'Não foi possível continuar.';
      }
    }

    card.append(
      h('div', { className: 'arc-auth__tabs' }, tabBtn('login', 'Entrar'), tabBtn('register', 'Criar conta')),
      h('p', { className: 'arc-auth__hint u-text-muted' },
        tab === 'login'
          ? 'Use o mesmo nome e senha de antes para continuar de onde parou.'
          : 'Escolha um nome e uma senha. Seu progresso fica salvo neste navegador.'),
      nameI, passI, fb,
      h('div', { className: 'arc-row' },
        h('button', { className: 'btn btn--primary', onclick: submit }, tab === 'login' ? 'Entrar' : 'Criar e jogar'),
        h('button', { className: 'btn btn--ghost', onclick: onCancel }, 'Voltar')));
    setTimeout(() => nameI.focus(), 30);
  }

  render();
  view.append(h('div', { className: 'arc-auth-wrap' }, card));
}

/* ============================================================
 *  HUB — cartões + ranking
 * ============================================================ */
function renderHub(view, { onPlay }) {
  empty(view);
  const p = players.current();
  const grid = h('div', { className: 'arc-grid' });

  GAMES.forEach((g) => {
    const best = p ? players.bestScore(g.id) : null;
    const save = (p && g.id === 'code-quest') ? players.loadProgress('code-quest') : null;
    grid.append(h('button', { className: cx('arc-card', `arc-card--${g.accent}`), onclick: () => onPlay(g.id) },
      g.tag ? h('span', { className: 'arc-card__tag' }, g.tag) : null,
      h('span', { className: 'arc-card__icon' }, g.icon),
      h('span', { className: 'arc-card__title' }, g.title),
      h('span', { className: 'arc-card__desc u-text-muted' }, g.desc),
      h('span', { className: 'arc-card__meta u-mono u-text-muted' },
        best ? `★ recorde ${best.score}/${best.max}` : 'sem recorde',
        save ? '  ·  ⏯ tem progresso' : '')));
  });

  view.append(
    h('div', { className: 'arc-hub' },
      h('div', { className: 'arc-hub__main' }, h('h2', { className: 'arc-h2' }, 'Escolha um jogo'), grid),
      h('div', { className: 'arc-hub__side' }, renderLeaderboard())));
}

function renderLeaderboard() {
  const list = players.leaderboard();
  const meKey = players.currentKey();
  const panel = h('div', { className: 'arc-board card' });
  panel.append(h('div', { className: 'arc-board__head' },
    h('span', null, '🏆 Ranking'),
    h('span', { className: 'u-text-muted u-mono' }, `${list.length} jogador(es)`)));
  if (!list.length) {
    panel.append(h('div', { className: 'arc-board__empty u-text-muted' }, 'Ninguém pontuou ainda. Seja o primeiro!'));
    return panel;
  }
  const medals = ['🥇', '🥈', '🥉'];
  list.slice(0, 10).forEach((pl, i) => {
    panel.append(h('div', { className: cx('arc-board__row', pl.key === meKey && 'is-me') },
      h('span', { className: 'arc-board__pos u-mono' }, medals[i] || String(i + 1)),
      h('span', { className: 'arc-board__name' }, pl.name),
      h('span', { className: 'arc-board__pat u-text-muted' }, pl.patente),
      h('span', { className: 'arc-board__pts u-mono u-text-cyan' }, String(pl.points))));
  });
  return panel;
}

/* ============================================================
 *  Shell de um jogo (voltar + título + host)
 * ============================================================ */
function renderGame(view, gameId, { back, refreshBar }) {
  empty(view);
  const g = GAMES.find((x) => x.id === gameId);
  const host = h('div', { className: 'arc-host card' });
  view.append(h('div', { className: 'arc-game' },
    h('div', { className: 'arc-game__bar' },
      h('button', { className: 'btn btn--ghost btn--sm', onclick: back }, '← Voltar'),
      h('span', { className: 'arc-game__title' }, `${g.icon} ${g.title}`)),
    host));

  const onFinish = (score, max) => finishGame(host, gameId, score, max, { back, replay: play, refreshBar });
  function play() { empty(host); launch(gameId, host, { onFinish }); }
  play();
}

function launch(gameId, host, ctx) {
  if (gameId === 'code-quest') startCodeQuest(host, ctx);
  else if (gameId === 'js') runJs(host, ctx);
  else if (gameId === 'html') runHtml(host, ctx);
  else if (gameId === 'css') runCss(host, ctx);
}

function finishGame(host, gameId, score, max, { back, replay, refreshBar }) {
  const res = players.awardScore(gameId, score, max);
  if (gameId === 'code-quest') players.clearProgress('code-quest');
  if (res) {
    if (res.leveledUp) toast(`⬆ Subiu para o Nível ${res.level} — ${res.patente}!`, { type: 'success' });
    refreshBar();
  }
  empty(host);
  host.append(h('div', { className: 'arc-finish' },
    h('div', { className: 'arc-finish__score u-text-cyan u-mono' }, `${score}/${max}`),
    h('p', null, res
      ? `+${res.gained} pontos creditados na sua conta.`
      : 'Entre numa conta para salvar pontos, nível e disputar o ranking.'),
    h('div', { className: 'arc-row' },
      h('button', { className: 'btn btn--primary', onclick: replay }, '↻ Jogar de novo'),
      h('button', { className: 'btn btn--ghost', onclick: back }, '⌂ Voltar ao hub'))));
}

/* ============================================================
 *  Componentes compartilhados pelos runners
 * ============================================================ */
function progresso(i, total, score) {
  return h('div', { className: 'arc-prog' },
    h('span', null, `Questão ${Math.min(i + 1, total)}/${total}`),
    h('span', { className: 'u-text-cyan' }, `Pontos: ${score}`));
}

/** Runner de múltipla escolha (Code Quest e HTML). */
function mcRunner(host, items, opts = {}) {
  const { onFinish, onAdvance } = opts;
  let i = Math.min(opts.startIndex || 0, items.length);
  let score = opts.startScore || 0;
  let answered = false;

  function render() {
    empty(host);
    if (i >= items.length) { onFinish(score, items.length); return; }
    const it = items[i];
    const optsWrap = h('div', { className: 'arc-opts' });
    const fb = h('div', { className: 'arc-fb' });
    const last = i + 1 >= items.length;
    const next = h('button', {
      className: 'btn btn--primary btn--sm', style: { display: 'none' },
      onclick: () => { i++; answered = false; onAdvance && onAdvance(i, score); render(); }
    }, last ? 'Ver resultado →' : 'Próxima →');

    it.options.forEach((o, idx) => {
      optsWrap.append(h('button', {
        className: 'arc-opt u-mono',
        onclick: () => {
          if (answered) return;
          answered = true;
          const ok = idx === it.answer;
          if (ok) score++;
          [...optsWrap.children].forEach((b, k) => {
            if (k === it.answer) b.classList.add('is-ok');
            else if (k === idx) b.classList.add('is-no');
            b.disabled = true;
          });
          fb.className = 'arc-fb ' + (ok ? 'is-ok' : 'is-no');
          fb.textContent = (ok ? '✓ Correto! ' : '✗ ') + (it.explain || '');
          next.style.display = '';
        }
      }, o));
    });

    const nodes = [progresso(i, items.length, score), h('p', { className: 'arc-q' }, it.q)];
    if (it.code) nodes.push(h('pre', { className: 'jogo-code' }, h('code', null, it.code)));
    nodes.push(optsWrap, fb, next);
    host.append(...nodes);
  }
  render();
}

/* ===== Code Quest ===== */
function startCodeQuest(host, { onFinish }) {
  renderChooser();

  function renderChooser() {
    empty(host);
    const wrap = h('div', { className: 'arc-cq' });
    const save = players.loadProgress('code-quest');

    if (save && players.isLoggedIn()) {
      wrap.append(h('div', { className: 'arc-cq__resume' },
        h('div', null,
          h('b', null, '⏯ Continuar a campanha'),
          h('div', { className: 'u-text-muted u-mono' }, `parou na questão ${(save.index || 0) + 1} · ${save.score || 0} pts`)),
        h('div', { className: 'arc-row' },
          h('button', { className: 'btn btn--primary btn--sm', onclick: () => playCampaign(save.index || 0, save.score || 0) }, 'Continuar'),
          h('button', { className: 'btn btn--ghost btn--sm', onclick: () => { players.clearProgress('code-quest'); renderChooser(); } }, 'Recomeçar'))));
    }

    wrap.append(h('button', { className: 'arc-cq__campaign', onclick: () => playCampaign(0, 0) },
      h('span', { className: 'arc-card__icon' }, '🌐'),
      h('span', { className: 'arc-card__title' }, 'Campanha completa'),
      h('span', { className: 'arc-card__desc u-text-muted' },
        `Todas as ${CODE_QUEST.length} linguagens em sequência — ${CODE_QUEST_TOTAL} desafios.`)));

    const chips = h('div', { className: 'arc-cq__langs' });
    CODE_QUEST.forEach((tr) => {
      chips.append(h('button', {
        className: 'arc-lang', style: { boxShadow: `inset 3px 0 0 ${tr.color}` },
        onclick: () => playLang(tr)
      },
        h('span', { className: 'arc-lang__icon' }, tr.icon),
        h('span', { className: 'arc-lang__name' }, tr.label),
        h('span', { className: 'arc-lang__n u-mono u-text-muted' }, String(tr.questions.length))));
    });
    wrap.append(h('div', { className: 'arc-cq__pick' },
      h('span', { className: 'u-text-muted' }, '…ou treine uma linguagem específica:'), chips));

    host.append(wrap);
  }

  function buildCampaignItems() {
    const items = [];
    CODE_QUEST.forEach((tr) => tr.questions.forEach((qq) => items.push({ ...qq, q: `[${tr.label}] ${qq.q}` })));
    return items;
  }
  function playCampaign(startIndex, startScore) {
    mcRunner(host, buildCampaignItems(), {
      startIndex, startScore, onFinish,
      onAdvance: (idx, score) => { if (players.isLoggedIn()) players.saveProgress('code-quest', { index: idx, score, mode: 'campaign' }); }
    });
  }
  function playLang(tr) {
    mcRunner(host, tr.questions.map((qq) => ({ ...qq })), { onFinish });
  }
}

/* ===== JavaScript — Qual a saída? ===== */
function runJs(host, { onFinish }) {
  let i = 0, score = 0, answered = false;
  function render() {
    empty(host);
    if (i >= JS_DESAFIOS.length) { onFinish(score, JS_DESAFIOS.length); return; }
    const d = JS_DESAFIOS[i];
    const input = h('input', {
      className: 'input arc-input u-mono', placeholder: 'Digite a saída exata…',
      onkeydown: (e) => { if (e.key === 'Enter') act(); }
    });
    const fb = h('div', { className: 'arc-fb' });
    const btn = h('button', { className: 'btn btn--primary btn--sm', onclick: () => act() }, 'Verificar');
    const last = i + 1 >= JS_DESAFIOS.length;
    function act() {
      if (!answered) {
        answered = true;
        const ok = norm(input.value) === norm(d.resp);
        if (ok) score++;
        fb.className = 'arc-fb ' + (ok ? 'is-ok' : 'is-no');
        fb.textContent = ok ? '✓ Correto!' : `✗ A saída é:  ${d.resp}`;
        btn.textContent = last ? 'Ver resultado →' : 'Próximo →';
      } else { i++; answered = false; render(); }
    }
    host.append(progresso(i, JS_DESAFIOS.length, score),
      h('p', { className: 'arc-q' }, 'O que este código imprime no console?'),
      h('pre', { className: 'jogo-code' }, h('code', null, d.code)),
      h('div', { className: 'arc-row' }, input, btn), fb);
    setTimeout(() => input.focus(), 30);
  }
  render();
}

/* ===== HTML — múltipla escolha (reusa mcRunner) ===== */
function runHtml(host, { onFinish }) {
  const items = HTML_DESAFIOS.map((d) => ({ q: `Qual o HTML certo para: ${d.pergunta}?`, options: d.opcoes, answer: d.certa }));
  mcRunner(host, items, { onFinish });
}

/* ===== CSS — Acerte o Layout (Flexbox) ===== */
function runCss(host, { onFinish }) {
  let lvl = 0, score = 0, justify = JUSTIFY_OPCOES[0], align = ALIGN_OPCOES[0];
  const boxes = () => [h('span', { className: 'jogo-box' }), h('span', { className: 'jogo-box' }), h('span', { className: 'jogo-box' })];
  function render() {
    empty(host);
    if (lvl >= CSS_NIVEIS.length) { onFinish(score, CSS_NIVEIS.length); return; }
    const n = CSS_NIVEIS[lvl];
    const alvo = h('div', { className: 'jogo-flex', style: { justifyContent: n.justify, alignItems: n.align } }, ...boxes());
    const player = h('div', { className: 'jogo-flex is-player', style: { justifyContent: justify, alignItems: align } }, ...boxes());
    const fb = h('div', { className: 'arc-fb' });
    const grupo = (label, options, cur, set) => h('div', { className: 'jogo-ctrl' },
      h('span', { className: 'jogo-ctrl__lbl u-mono u-text-muted' }, label),
      h('div', { className: 'jogo-btns' }, ...options.map((o) => h('button', {
        className: cx('chip', o === cur && 'chip--active'), onclick: () => { set(o); render(); }
      }, o))));
    host.append(
      progresso(lvl, CSS_NIVEIS.length, score),
      h('p', { className: 'arc-q' }, '🎯 ', n.dica),
      h('div', { className: 'jogo-flex-pair' },
        h('div', null, h('div', { className: 'jogo-flex-lbl u-text-muted' }, 'ALVO'), alvo),
        h('div', null, h('div', { className: 'jogo-flex-lbl u-text-cyan' }, 'VOCÊ'), player)),
      grupo('justify-content', JUSTIFY_OPCOES, justify, (v) => (justify = v)),
      grupo('align-items', ALIGN_OPCOES, align, (v) => (align = v)),
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: () => {
          if (justify === n.justify && align === n.align) {
            score++;
            fb.className = 'arc-fb is-ok'; fb.textContent = '✓ Acertou! Próximo nível…';
            setTimeout(() => { lvl++; justify = JUSTIFY_OPCOES[0]; align = ALIGN_OPCOES[0]; render(); }, 700);
          } else {
            fb.className = 'arc-fb is-no'; fb.textContent = '✗ Ainda não bateu com o alvo. Ajuste e tente de novo.';
          }
        }
      }, 'Verificar'),
      fb);
  }
  render();
}
