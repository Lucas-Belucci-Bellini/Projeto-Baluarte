/**
 * Página /jogos — Arcade Baluarte.
 *
 * Hub de jogos com conta local, XP, nível, ranking e progresso salvo. Os
 * contratos do players-engine e dos catálogos de desafios mantêm a fronteira
 * entre a UI TypeScript e as engines JavaScript existentes.
 */

import '../styles/biblioteca.css';
import '../styles/jogos.css';
import { h, empty, cx } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import * as players from '../utils/players-engine.js';
import { JS_DESAFIOS, HTML_DESAFIOS, CSS_NIVEIS, JUSTIFY_OPCOES, ALIGN_OPCOES } from '../data/jogos.js';
import { CODE_QUEST, CODE_QUEST_TOTAL } from '../data/code-quest.js';
import type { CodeQuestQuestion, CodeQuestTrack } from '../data/code-quest.js';
import type { SaveBlob, ScoreAward } from '../utils/players-engine.js';

const normalize = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, ' ');

type GameId = 'code-quest' | 'js' | 'html' | 'css';
type AuthTab = 'login' | 'register';

interface GameDefinition {
  id: GameId;
  icon: string;
  accent: 'cyan' | 'magenta';
  tag?: string;
  title: string;
  desc: string;
}

interface GameCallbacks {
  back: () => void;
  refreshBar: () => void;
}

interface FinishCallbacks extends GameCallbacks {
  replay: () => void;
}

interface MultipleChoiceItem {
  q: string;
  options: readonly string[];
  answer: number;
  code?: string;
  explain?: string;
}

interface MultipleChoiceOptions {
  onFinish: (score: number, max: number) => void;
  onAdvance?: (index: number, score: number) => void;
  startIndex?: number;
  startScore?: number;
}

interface GameResultContext {
  onFinish: (score: number, max: number) => void;
}

const GAMES: readonly GameDefinition[] = [
  {
    id: 'code-quest', icon: '🧩', accent: 'cyan', tag: 'NOVO', title: 'Code Quest — Linguagens',
    desc: `Aprenda ${CODE_QUEST.length} linguagens jogando — ${CODE_QUEST_TOTAL} desafios de código.`,
  },
  {
    id: 'js', icon: '⌨', accent: 'cyan', title: 'JavaScript — Qual a saída?',
    desc: 'Preveja exatamente o que o console imprime.',
  },
  {
    id: 'html', icon: '🔶', accent: 'magenta', title: 'HTML — Qual a tag certa?',
    desc: 'Escolha a marcação correta para cada objetivo.',
  },
  {
    id: 'css', icon: '🎨', accent: 'magenta', title: 'CSS — Acerte o Layout',
    desc: 'Domine justify-content e align-items no Flexbox.',
  },
];

export function jogosPage(): HTMLDivElement {
  const page = h('div', { className: 'page-arcade' });
  const bar = h('div', { className: 'arc-bar card' });
  const view = h('div', { className: 'arc-view' });
  page.append(buildHeader(), bar, view);

  function refreshBar(): void {
    renderBar(bar, {
      onAuth: () => showAuth(view, {
        onDone: () => { refreshBar(); showHub(); },
        onCancel: showHub,
      }),
      onLogout: () => {
        players.logout();
        toast('Você saiu da conta.');
        refreshBar();
        showHub();
      },
    });
  }

  function showHub(): void {
    renderHub(view, { onPlay: openGame });
  }

  function openGame(gameId: GameId): void {
    renderGame(view, gameId, { back: showHub, refreshBar });
  }

  refreshBar();
  showHub();
  return page;
}

function buildHeader(): HTMLDivElement {
  return h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'CONHECIMENTO'), h('span', null, '›'), h('span', null, 'ARCADE'),
    ),
    h('h1', { className: 'page-header__title' }, '🎮 Arcade Baluarte'),
    h('p', { className: 'page-header__description' },
      'Vários jogos para aprender programação. ',
      h('span', { className: 'u-text-cyan' }, 'Crie sua conta'),
      ', pontue, suba de nível e dispute o ranking.',
    ),
  );
}

function renderBar(
  bar: HTMLDivElement,
  callbacks: { onAuth: () => void; onLogout: () => void },
): void {
  empty(bar);
  const player = players.current();
  if (!player) {
    bar.append(
      h('div', { className: 'arc-bar__user' },
        h('span', { className: 'arc-bar__avatar is-guest' }, '?'),
        h('div', { className: 'arc-bar__info' },
          h('div', { className: 'arc-bar__name' }, 'Visitante'),
          h('div', { className: 'arc-bar__sub u-text-muted' }, 'Entre para salvar pontos, nível e ranking'),
        ),
      ),
      h('button', { className: 'btn btn--primary btn--sm', onclick: callbacks.onAuth }, 'Entrar / Criar conta'),
    );
    return;
  }
  bar.append(
    h('div', { className: 'arc-bar__user' },
      h('span', { className: 'arc-bar__avatar' }, player.name.slice(0, 1).toUpperCase()),
      h('div', { className: 'arc-bar__info' },
        h('div', { className: 'arc-bar__name' }, player.name,
          h('span', { className: 'arc-bar__patente' }, player.patente),
        ),
        h('div', { className: 'arc-bar__xp' },
          h('div', { className: 'arc-bar__xpbar' }, h('span', { style: { width: `${player.xpPct}%` } })),
          h('span', { className: 'arc-bar__xptxt u-mono' }, `Nível ${player.level} · ${player.points} pts`),
        ),
      ),
    ),
    h('button', { className: 'btn btn--ghost btn--sm', onclick: callbacks.onLogout }, 'Sair'),
  );
}

function showAuth(
  view: HTMLDivElement,
  callbacks: { onDone: () => void; onCancel: () => void },
): void {
  empty(view);
  let tab: AuthTab = 'login';
  const card = h('div', { className: 'arc-auth card' });

  function tabButton(id: AuthTab, label: string): HTMLButtonElement {
    return h('button', {
      className: cx('arc-auth__tab', tab === id && 'is-active'),
      onclick: () => { tab = id; render(); },
    }, label);
  }

  function render(): void {
    empty(card);
    const nameInput = h('input', {
      className: 'input', placeholder: 'Nome de jogador', maxlength: 24, autocomplete: 'username',
    });
    const passwordInput = h('input', {
      className: 'input', type: 'password', placeholder: 'Senha (mín. 4 caracteres)',
      autocomplete: tab === 'login' ? 'current-password' : 'new-password',
      onkeydown: (event: Event) => {
        if (event instanceof KeyboardEvent && event.key === 'Enter') submit();
      },
    });
    const feedback = h('div', { className: 'arc-auth__fb' });

    async function submit(): Promise<void> {
      feedback.className = 'arc-auth__fb';
      feedback.textContent = '';
      try {
        const player = tab === 'login'
          ? await players.login(nameInput.value, passwordInput.value)
          : await players.register(nameInput.value, passwordInput.value);
        toast(`${tab === 'login' ? 'Bem-vindo de volta' : 'Conta criada'}, ${player.name}!`, { type: 'success' });
        callbacks.onDone();
      } catch (error) {
        feedback.className = 'arc-auth__fb is-no';
        feedback.textContent = error instanceof Error ? error.message : 'Não foi possível continuar.';
      }
    }

    card.append(
      h('div', { className: 'arc-auth__tabs' }, tabButton('login', 'Entrar'), tabButton('register', 'Criar conta')),
      h('p', { className: 'arc-auth__hint u-text-muted' },
        tab === 'login'
          ? 'Use o mesmo nome e senha de antes para continuar de onde parou.'
          : 'Escolha um nome e uma senha. Seu progresso fica salvo neste navegador.',
      ),
      nameInput, passwordInput, feedback,
      h('div', { className: 'arc-row' },
        h('button', { className: 'btn btn--primary', onclick: submit }, tab === 'login' ? 'Entrar' : 'Criar e jogar'),
        h('button', { className: 'btn btn--ghost', onclick: callbacks.onCancel }, 'Voltar'),
      ),
    );
    setTimeout(() => nameInput.focus(), 30);
  }

  render();
  view.append(h('div', { className: 'arc-auth-wrap' }, card));
}

function renderHub(view: HTMLDivElement, callbacks: { onPlay: (gameId: GameId) => void }): void {
  empty(view);
  const player = players.current();
  const grid = h('div', { className: 'arc-grid' });
  GAMES.forEach((game) => {
    const best = player ? players.bestScore(game.id) : null;
    const save = player && game.id === 'code-quest' ? players.loadProgress('code-quest') : null;
    grid.append(h('button', {
      className: cx('arc-card', `arc-card--${game.accent}`),
      onclick: () => callbacks.onPlay(game.id),
    },
    game.tag ? h('span', { className: 'arc-card__tag' }, game.tag) : null,
    h('span', { className: 'arc-card__icon' }, game.icon),
    h('span', { className: 'arc-card__title' }, game.title),
    h('span', { className: 'arc-card__desc u-text-muted' }, game.desc),
    h('span', { className: 'arc-card__meta u-mono u-text-muted' },
      best ? `★ recorde ${best.score}/${best.max}` : 'sem recorde',
      save ? '  ·  ⏯ tem progresso' : '',
    ),
    ));
  });
  view.append(
    h('div', { className: 'arc-hub' },
      h('div', { className: 'arc-hub__main' }, h('h2', { className: 'arc-h2' }, 'Escolha um jogo'), grid),
      h('div', { className: 'arc-hub__side' }, renderLeaderboard()),
    ),
  );
}

function renderLeaderboard(): HTMLDivElement {
  const list = players.leaderboard();
  const currentKey = players.currentKey();
  const panel = h('div', { className: 'arc-board card' });
  panel.append(h('div', { className: 'arc-board__head' },
    h('span', null, '🏆 Ranking'),
    h('span', { className: 'u-text-muted u-mono' }, `${list.length} jogador(es)`),
  ));
  if (!list.length) {
    panel.append(h('div', { className: 'arc-board__empty u-text-muted' }, 'Ninguém pontuou ainda. Seja o primeiro!'));
    return panel;
  }
  const medals = ['🥇', '🥈', '🥉'];
  list.slice(0, 10).forEach((player, index) => {
    panel.append(h('div', { className: cx('arc-board__row', player.key === currentKey && 'is-me') },
      h('span', { className: 'arc-board__pos u-mono' }, medals[index] || String(index + 1)),
      h('span', { className: 'arc-board__name' }, player.name),
      h('span', { className: 'arc-board__pat u-text-muted' }, player.patente),
      h('span', { className: 'arc-board__pts u-mono u-text-cyan' }, String(player.points)),
    ));
  });
  return panel;
}

function renderGame(view: HTMLDivElement, gameId: GameId, callbacks: GameCallbacks): void {
  empty(view);
  const game = GAMES.find((entry) => entry.id === gameId);
  if (!game) return;
  const host = h('div', { className: 'arc-host card' });
  view.append(h('div', { className: 'arc-game' },
    h('div', { className: 'arc-game__bar' },
      h('button', { className: 'btn btn--ghost btn--sm', onclick: callbacks.back }, '← Voltar'),
      h('span', { className: 'arc-game__title' }, `${game.icon} ${game.title}`),
    ),
    host,
  ));

  const onFinish = (score: number, max: number): void => {
    finishGame(host, gameId, score, max, { ...callbacks, replay: play });
  };
  function play(): void {
    empty(host);
    launch(gameId, host, { onFinish });
  }
  play();
}

function launch(gameId: GameId, host: HTMLDivElement, context: GameResultContext): void {
  if (gameId === 'code-quest') startCodeQuest(host, context);
  else if (gameId === 'js') runJs(host, context);
  else if (gameId === 'html') runHtml(host, context);
  else runCss(host, context);
}

function finishGame(host: HTMLDivElement, gameId: GameId, score: number, max: number, callbacks: FinishCallbacks): void {
  const result: ScoreAward | null = players.awardScore(gameId, score, max);
  if (gameId === 'code-quest') players.clearProgress('code-quest');
  if (result) {
    if (result.leveledUp) toast(`⬆ Subiu para o Nível ${result.level} — ${result.patente}!`, { type: 'success' });
    callbacks.refreshBar();
  }
  empty(host);
  host.append(h('div', { className: 'arc-finish' },
    h('div', { className: 'arc-finish__score u-text-cyan u-mono' }, `${score}/${max}`),
    h('p', null, result
      ? `+${result.gained} pontos creditados na sua conta.`
      : 'Entre numa conta para salvar pontos, nível e disputar o ranking.',
    ),
    h('div', { className: 'arc-row' },
      h('button', { className: 'btn btn--primary', onclick: callbacks.replay }, '↻ Jogar de novo'),
      h('button', { className: 'btn btn--ghost', onclick: callbacks.back }, '⌂ Voltar ao hub'),
    ),
  ));
}

function progress(index: number, total: number, score: number): HTMLDivElement {
  return h('div', { className: 'arc-prog' },
    h('span', null, `Questão ${Math.min(index + 1, total)}/${total}`),
    h('span', { className: 'u-text-cyan' }, `Pontos: ${score}`),
  );
}

function mcRunner(host: HTMLDivElement, items: readonly MultipleChoiceItem[], options: MultipleChoiceOptions): void {
  const startIndex = Math.min(options.startIndex ?? 0, items.length);
  let index = startIndex;
  let score = options.startScore ?? 0;
  let answered = false;

  function render(): void {
    empty(host);
    if (index >= items.length) {
      options.onFinish(score, items.length);
      return;
    }
    const item = items[index];
    const optionsWrap = h('div', { className: 'arc-opts' });
    const feedback = h('div', { className: 'arc-fb' });
    const last = index + 1 >= items.length;
    const next = h('button', {
      className: 'btn btn--primary btn--sm',
      style: { display: 'none' },
      onclick: () => {
        index += 1;
        answered = false;
        options.onAdvance?.(index, score);
        render();
      },
    }, last ? 'Ver resultado →' : 'Próxima →');

    item.options.forEach((option, optionIndex) => {
      optionsWrap.append(h('button', {
        className: 'arc-opt u-mono',
        onclick: () => {
          if (answered) return;
          answered = true;
          const correct = optionIndex === item.answer;
          if (correct) score += 1;
          Array.from(optionsWrap.children).forEach((button, childIndex) => {
            if (!(button instanceof HTMLButtonElement)) return;
            if (childIndex === item.answer) button.classList.add('is-ok');
            else if (childIndex === optionIndex) button.classList.add('is-no');
            button.disabled = true;
          });
          feedback.className = `arc-fb ${correct ? 'is-ok' : 'is-no'}`;
          feedback.textContent = `${correct ? '✓ Correto! ' : '✗ '}${item.explain || ''}`;
          next.style.display = '';
        },
      }, option));
    });

    const nodes: Node[] = [progress(index, items.length, score), h('p', { className: 'arc-q' }, item.q)];
    if (item.code) nodes.push(h('pre', { className: 'jogo-code' }, h('code', null, item.code)));
    nodes.push(optionsWrap, feedback, next);
    host.append(...nodes);
  }
  render();
}

function startCodeQuest(host: HTMLDivElement, context: GameResultContext): void {
  renderChooser();

  function renderChooser(): void {
    empty(host);
    const wrap = h('div', { className: 'arc-cq' });
    const save = players.loadProgress('code-quest');
    if (save && players.isLoggedIn()) {
      wrap.append(h('div', { className: 'arc-cq__resume' },
        h('div', null,
          h('b', null, '⏯ Continuar a campanha'),
          h('div', { className: 'u-text-muted u-mono' }, `parou na questão ${(save.index ?? 0) + 1} · ${save.score ?? 0} pts`),
        ),
        h('div', { className: 'arc-row' },
          h('button', { className: 'btn btn--primary btn--sm', onclick: () => playCampaign(save.index ?? 0, save.score ?? 0) }, 'Continuar'),
          h('button', {
            className: 'btn btn--ghost btn--sm',
            onclick: () => { players.clearProgress('code-quest'); renderChooser(); },
          }, 'Recomeçar'),
        ),
      ));
    }

    wrap.append(h('button', { className: 'arc-cq__campaign', onclick: () => playCampaign(0, 0) },
      h('span', { className: 'arc-card__icon' }, '🌐'),
      h('span', { className: 'arc-card__title' }, 'Campanha completa'),
      h('span', { className: 'arc-card__desc u-text-muted' },
        `Todas as ${CODE_QUEST.length} linguagens em sequência — ${CODE_QUEST_TOTAL} desafios.`),
    ));

    const chips = h('div', { className: 'arc-cq__langs' });
    CODE_QUEST.forEach((track) => {
      chips.append(h('button', {
        className: 'arc-lang',
        style: { boxShadow: `inset 3px 0 0 ${track.color}` },
        onclick: () => playLanguage(track),
      },
      h('span', { className: 'arc-lang__icon' }, track.icon),
      h('span', { className: 'arc-lang__name' }, track.label),
      h('span', { className: 'arc-lang__n u-mono u-text-muted' }, String(track.questions.length)),
      ));
    });
    wrap.append(h('div', { className: 'arc-cq__pick' },
      h('span', { className: 'u-text-muted' }, '…ou treine uma linguagem específica:'), chips,
    ));
    host.append(wrap);
  }

  function buildCampaignItems(): MultipleChoiceItem[] {
    const items: MultipleChoiceItem[] = [];
    CODE_QUEST.forEach((track) => track.questions.forEach((question) => {
      items.push({ ...question, q: `[${track.label}] ${question.q}` });
    }));
    return items;
  }

  function playCampaign(startIndex: number, startScore: number): void {
    mcRunner(host, buildCampaignItems(), {
      startIndex,
      startScore,
      onFinish: context.onFinish,
      onAdvance: (index, score) => {
        if (players.isLoggedIn()) {
          players.saveProgress('code-quest', { index, score, mode: 'campaign' });
        }
      },
    });
  }

  function playLanguage(track: CodeQuestTrack): void {
    const items: MultipleChoiceItem[] = track.questions.map((question: CodeQuestQuestion) => ({ ...question }));
    mcRunner(host, items, { onFinish: context.onFinish });
  }
}

function runJs(host: HTMLDivElement, context: GameResultContext): void {
  let index = 0;
  let score = 0;
  let answered = false;

  function render(): void {
    empty(host);
    if (index >= JS_DESAFIOS.length) {
      context.onFinish(score, JS_DESAFIOS.length);
      return;
    }
    const challenge = JS_DESAFIOS[index];
    const input = h('input', {
      className: 'input arc-input u-mono', placeholder: 'Digite a saída exata…',
      onkeydown: (event: Event) => {
        if (event instanceof KeyboardEvent && event.key === 'Enter') act();
      },
    });
    const feedback = h('div', { className: 'arc-fb' });
    const action = h('button', { className: 'btn btn--primary btn--sm', onclick: () => act() }, 'Verificar');
    const last = index + 1 >= JS_DESAFIOS.length;

    function act(): void {
      if (!answered) {
        answered = true;
        const correct = normalize(input.value) === normalize(challenge.resp);
        if (correct) score += 1;
        feedback.className = `arc-fb ${correct ? 'is-ok' : 'is-no'}`;
        feedback.textContent = correct ? '✓ Correto!' : `✗ A saída é:  ${challenge.resp}`;
        action.textContent = last ? 'Ver resultado →' : 'Próximo →';
      } else {
        index += 1;
        answered = false;
        render();
      }
    }

    host.append(
      progress(index, JS_DESAFIOS.length, score),
      h('p', { className: 'arc-q' }, 'O que este código imprime no console?'),
      h('pre', { className: 'jogo-code' }, h('code', null, challenge.code)),
      h('div', { className: 'arc-row' }, input, action),
      feedback,
    );
    setTimeout(() => input.focus(), 30);
  }
  render();
}

function runHtml(host: HTMLDivElement, context: GameResultContext): void {
  const items: MultipleChoiceItem[] = HTML_DESAFIOS.map((challenge) => ({
    q: `Qual o HTML certo para: ${challenge.pergunta}?`,
    options: challenge.opcoes,
    answer: challenge.certa,
  }));
  mcRunner(host, items, { onFinish: context.onFinish });
}

function runCss(host: HTMLDivElement, context: GameResultContext): void {
  let level = 0;
  let score = 0;
  let justify = JUSTIFY_OPCOES[0];
  let align = ALIGN_OPCOES[0];
  const boxes = (): HTMLSpanElement[] => [
    h('span', { className: 'jogo-box' }),
    h('span', { className: 'jogo-box' }),
    h('span', { className: 'jogo-box' }),
  ];

  function render(): void {
    empty(host);
    if (level >= CSS_NIVEIS.length) {
      context.onFinish(score, CSS_NIVEIS.length);
      return;
    }
    const target = CSS_NIVEIS[level];
    const targetBoxes = h('div', {
      className: 'jogo-flex', style: { justifyContent: target.justify, alignItems: target.align },
    }, ...boxes());
    const player = h('div', {
      className: 'jogo-flex is-player', style: { justifyContent: justify, alignItems: align },
    }, ...boxes());
    const feedback = h('div', { className: 'arc-fb' });

    const choiceGroup = (
      label: string,
      options: readonly string[],
      current: string,
      set: (value: string) => void,
    ): HTMLDivElement => h('div', { className: 'jogo-ctrl' },
      h('span', { className: 'jogo-ctrl__lbl u-mono u-text-muted' }, label),
      h('div', { className: 'jogo-btns' }, ...options.map((option) => h('button', {
        className: cx('chip', option === current && 'chip--active'),
        onclick: () => { set(option); render(); },
      }, option))),
    );

    host.append(
      progress(level, CSS_NIVEIS.length, score),
      h('p', { className: 'arc-q' }, '🎯 ', target.dica),
      h('div', { className: 'jogo-flex-pair' },
        h('div', null, h('div', { className: 'jogo-flex-lbl u-text-muted' }, 'ALVO'), targetBoxes),
        h('div', null, h('div', { className: 'jogo-flex-lbl u-text-cyan' }, 'VOCÊ'), player),
      ),
      choiceGroup('justify-content', JUSTIFY_OPCOES, justify, (value) => { justify = value; }),
      choiceGroup('align-items', ALIGN_OPCOES, align, (value) => { align = value; }),
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: () => {
          if (justify === target.justify && align === target.align) {
            score += 1;
            feedback.className = 'arc-fb is-ok';
            feedback.textContent = '✓ Acertou! Próximo nível…';
            setTimeout(() => {
              level += 1;
              justify = JUSTIFY_OPCOES[0];
              align = ALIGN_OPCOES[0];
              render();
            }, 700);
          } else {
            feedback.className = 'arc-fb is-no';
            feedback.textContent = '✗ Ainda não bateu com o alvo. Ajuste e tente de novo.';
          }
        },
      }, 'Verificar'),
      feedback,
    );
  }
  render();
}
