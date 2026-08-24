/**
 * /batalha-naval — Batalha Naval (issue #181).
 *
 * Jogo clássico contra o computador: posicione sua frota, atire no tabuleiro
 * inimigo e afunde todos os navios antes que ele afunde os seus.
 */

import '../styles/batalha-naval.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast';

const N = 10;
const COLS = 'ABCDEFGHIJ';

interface FleetDefinition {
  readonly name: string;
  readonly size: number;
}

interface Coordinate {
  readonly row: number;
  readonly col: number;
}

interface Ship {
  readonly name: string;
  readonly size: number;
  readonly cells: readonly Coordinate[];
  hits: number;
}

interface BoardCell {
  ship: Ship | null;
  hit: boolean;
}

type Board = BoardCell[][];
type Phase = 'setup' | 'play' | 'over';

interface FleetPlacement {
  readonly board: Board;
  readonly ships: Ship[];
}

interface AiState {
  readonly queue: Coordinate[];
  readonly tried: Set<string>;
}

const FLEET: readonly FleetDefinition[] = [
  { name: 'Porta-aviões', size: 5 },
  { name: 'Encouraçado', size: 4 },
  { name: 'Cruzador', size: 3 },
  { name: 'Submarino', size: 3 },
  { name: 'Destróier', size: 2 },
];

function emptyBoard(): Board {
  return Array.from({ length: N }, () => (
    Array.from({ length: N }, () => ({ ship: null, hit: false }))
  ));
}

/** Posiciona a frota aleatoriamente; navios podem se tocar. */
function placeFleet(): FleetPlacement {
  const board = emptyBoard();
  const ships: Ship[] = [];
  for (const definition of FLEET) {
    let placed = false;
    let tries = 0;
    while (!placed && tries < 800) {
      tries += 1;
      const horizontal = Math.random() < 0.5;
      const row = Math.floor(Math.random() * N);
      const col = Math.floor(Math.random() * N);
      const cells: Coordinate[] = [];
      let valid = true;
      for (let index = 0; index < definition.size; index += 1) {
        const nextRow = horizontal ? row : row + index;
        const nextCol = horizontal ? col + index : col;
        if (
          nextRow >= N
          || nextCol >= N
          || board[nextRow][nextCol].ship !== null
        ) {
          valid = false;
          break;
        }
        cells.push({ row: nextRow, col: nextCol });
      }
      if (!valid) continue;
      const ship: Ship = {
        name: definition.name,
        size: definition.size,
        cells,
        hits: 0,
      };
      for (const cell of cells) board[cell.row][cell.col].ship = ship;
      ships.push(ship);
      placed = true;
    }
  }
  return { board, ships };
}

export function batalhaNavalPage(): HTMLDivElement {
  const page = h('div', { className: 'page-bnaval' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'ARCADE'),
        h('span', null, '›'),
        h('span', null, 'BATALHA NAVAL'),
      ),
      h('h1', { className: 'page-header__title' }, '🚢 Batalha Naval'),
      h('p', { className: 'page-header__description' },
        'Afunde a frota inimiga antes que ela afunde a sua. Posicione (automático), ',
        'depois clique no tabuleiro do inimigo para atirar.',
      ),
    ),
  );

  let player: Board = [];
  let enemy: Board = [];
  let playerShips: Ship[] = [];
  let enemyShips: Ship[] = [];
  let ai: AiState = { queue: [], tried: new Set<string>() };
  let phase: Phase = 'setup';
  let turnLock = false;
  const playerCells: HTMLButtonElement[][] = [];
  const enemyCells: HTMLButtonElement[][] = [];

  const status = h('div', { className: 'bn-status' }, '');
  const playerFleetEl = h('div', { className: 'bn-fleet' });
  const enemyFleetEl = h('div', { className: 'bn-fleet' });
  const playerGrid = h('div', { className: 'bn-grid' });
  const enemyGrid = h('div', { className: 'bn-grid bn-grid--enemy' });

  const reshuffleBtn = h('button', {
    className: 'btn btn--ghost',
    onclick: () => {
      setup();
      toast('Frota reposicionada');
    },
  }, '🔀 Reposicionar');
  const startBtn = h('button', {
    className: 'btn btn--primary',
    onclick: () => startGame(),
  }, '▶ Começar batalha');
  const restartBtn = h('button', {
    className: 'btn btn--ghost',
    style: { display: 'none' },
    onclick: () => {
      setup();
      status.textContent = 'Frota pronta. Clique em "Começar batalha".';
      status.className = 'bn-status';
    },
  }, '↻ Nova partida');
  const controls = h('div', { className: 'bn-controls' }, reshuffleBtn, startBtn, restartBtn);

  page.append(
    status,
    controls,
    h('div', { className: 'bn-boards' },
      h('div', { className: 'bn-board' },
        h('div', { className: 'bn-board__title' }, '🛡️ Sua frota'),
        wrapGrid(playerGrid),
        playerFleetEl,
      ),
      h('div', { className: 'bn-board' },
        h('div', { className: 'bn-board__title' }, '🎯 Inimigo'),
        wrapGrid(enemyGrid),
        enemyFleetEl,
      ),
    ),
  );

  function wrapGrid(grid: HTMLDivElement): HTMLDivElement {
    const wrap = h('div', { className: 'bn-grid-wrap' });
    const top = h('div', { className: 'bn-axis bn-axis--top' },
      h('span', { className: 'bn-corner' }, ''),
    );
    for (let col = 0; col < N; col += 1) {
      top.appendChild(h('span', { className: 'bn-axis__lbl' }, COLS[col]));
    }
    wrap.append(top, grid);
    return wrap;
  }

  function buildGrid(
    gridElement: HTMLDivElement,
    cellStore: HTMLButtonElement[][],
    enemySide: boolean,
  ): void {
    empty(gridElement);
    cellStore.length = 0;
    for (let rowIndex = 0; rowIndex < N; rowIndex += 1) {
      const row: HTMLButtonElement[] = [];
      const rowElement = h('div', { className: 'bn-row' },
        h('span', { className: 'bn-axis__lbl bn-axis__lbl--row' }, String(rowIndex + 1)),
      );
      for (let colIndex = 0; colIndex < N; colIndex += 1) {
        const cellElement = h('button', {
          className: 'bn-cell',
          type: 'button',
          dataset: {
            pos: `${COLS[colIndex]}${rowIndex + 1}`,
            lado: enemySide ? 'Inimigo' : 'Sua frota',
          },
          'aria-label': `${enemySide ? 'Inimigo' : 'Sua frota'} ${COLS[colIndex]}${rowIndex + 1}`,
          onclick: enemySide ? () => fireAtEnemy(rowIndex, colIndex) : null,
        });
        rowElement.appendChild(cellElement);
        row.push(cellElement);
      }
      gridElement.appendChild(rowElement);
      cellStore.push(row);
    }
  }

  function renderCell(cellElement: HTMLButtonElement, cell: BoardCell, reveal: boolean): void {
    let className = 'bn-cell';
    let state = 'inexplorado';
    if (cell.ship && (reveal || cell.hit)) {
      if (cell.hit) {
        const sunk = cell.ship.hits >= cell.ship.size;
        className += sunk ? ' is-sunk' : ' is-hit';
        state = sunk ? 'navio afundado' : 'acerto';
      } else {
        className += ' is-ship';
        state = 'navio';
      }
    } else if (cell.hit) {
      className += ' is-miss';
      state = 'água';
    }
    cellElement.className = className;
    cellElement.setAttribute(
      'aria-label',
      `${cellElement.dataset.lado ?? ''} ${cellElement.dataset.pos ?? ''}: ${state}`,
    );
    if (cell.hit) cellElement.setAttribute('aria-disabled', 'true');
  }

  function renderBoard(board: Board, cellStore: HTMLButtonElement[][], reveal: boolean): void {
    for (let row = 0; row < N; row += 1) {
      for (let col = 0; col < N; col += 1) {
        renderCell(cellStore[row][col], board[row][col], reveal);
      }
    }
  }

  function renderFleet(element: HTMLDivElement, ships: readonly Ship[], hideName: boolean): void {
    empty(element);
    for (const ship of ships) {
      const sunk = ship.hits >= ship.size;
      element.appendChild(h('span', {
        className: `bn-ship${sunk ? ' is-sunk' : ''}`,
      }, hideName && !sunk ? '■'.repeat(ship.size) : `${ship.name} ${sunk ? '✖' : ''}`));
    }
  }

  function setup(): void {
    const playerPlacement = placeFleet();
    const enemyPlacement = placeFleet();
    player = playerPlacement.board;
    playerShips = playerPlacement.ships;
    enemy = enemyPlacement.board;
    enemyShips = enemyPlacement.ships;
    ai = { queue: [], tried: new Set<string>() };
    phase = 'setup';
    turnLock = false;
    buildGrid(playerGrid, playerCells, false);
    buildGrid(enemyGrid, enemyCells, true);
    renderBoard(player, playerCells, true);
    renderBoard(enemy, enemyCells, false);
    renderFleet(playerFleetEl, playerShips, false);
    renderFleet(enemyFleetEl, enemyShips, true);
    enemyGrid.classList.add('is-locked');
    reshuffleBtn.style.display = '';
    startBtn.style.display = '';
    restartBtn.style.display = 'none';
    status.textContent = 'Frota posicionada. Reposicione se quiser e clique em "Começar batalha".';
    status.className = 'bn-status';
  }

  function startGame(): void {
    phase = 'play';
    enemyGrid.classList.remove('is-locked');
    reshuffleBtn.style.display = 'none';
    startBtn.style.display = 'none';
    restartBtn.style.display = '';
    status.textContent = 'Sua vez — clique numa célula do inimigo para atirar.';
  }

  function alive(ships: readonly Ship[]): boolean {
    return ships.some((ship) => ship.hits < ship.size);
  }

  function fireAtEnemy(row: number, col: number): void {
    if (phase !== 'play' || turnLock) return;
    const cell = enemy[row][col];
    if (cell.hit) return;
    cell.hit = true;
    let message: string;
    if (cell.ship) {
      cell.ship.hits += 1;
      const sunk = cell.ship.hits >= cell.ship.size;
      message = sunk ? `💥 Você afundou o ${cell.ship.name} inimigo!` : '🔥 Acertou!';
    } else {
      message = '🌊 Água.';
    }
    renderBoard(enemy, enemyCells, false);
    renderFleet(enemyFleetEl, enemyShips, true);
    if (!alive(enemyShips)) {
      endGame(true);
      return;
    }
    status.textContent = `${message} Inimigo atacando…`;
    turnLock = true;
    setTimeout(enemyTurn, 650);
  }

  function enemyTurn(): void {
    let row: number | undefined;
    let col: number | undefined;
    while (ai.queue.length > 0) {
      const next = ai.queue.shift();
      if (!next) break;
      if (next.row < 0 || next.col < 0 || next.row >= N || next.col >= N) continue;
      const key = `${next.row},${next.col}`;
      if (ai.tried.has(key)) continue;
      row = next.row;
      col = next.col;
      break;
    }
    if (row === undefined || col === undefined) {
      do {
        row = Math.floor(Math.random() * N);
        col = Math.floor(Math.random() * N);
      } while (ai.tried.has(`${row},${col}`));
    }
    if (row === undefined || col === undefined) return;
    ai.tried.add(`${row},${col}`);
    const cell = player[row][col];
    cell.hit = true;
    let message: string;
    if (cell.ship) {
      cell.ship.hits += 1;
      const sunk = cell.ship.hits >= cell.ship.size;
      message = sunk ? `🛑 O inimigo afundou seu ${cell.ship.name}!` : '⚠ O inimigo acertou seu navio.';
      if (!sunk) {
        ai.queue.push(
          { row: row - 1, col },
          { row: row + 1, col },
          { row, col: col - 1 },
          { row, col: col + 1 },
        );
      }
    } else {
      message = '✅ O inimigo errou (água).';
    }
    renderBoard(player, playerCells, true);
    renderFleet(playerFleetEl, playerShips, false);
    if (!alive(playerShips)) {
      endGame(false);
      return;
    }
    status.textContent = `${message} Sua vez.`;
    turnLock = false;
  }

  function endGame(playerWon: boolean): void {
    phase = 'over';
    turnLock = true;
    renderBoard(enemy, enemyCells, true);
    renderFleet(enemyFleetEl, enemyShips, false);
    status.textContent = playerWon
      ? '🏆 VITÓRIA! Você afundou toda a frota inimiga.'
      : '☠ DERROTA. Sua frota foi ao fundo.';
    status.className = `bn-status ${playerWon ? 'is-win' : 'is-lose'}`;
    toast(playerWon ? 'Vitória!' : 'Derrota!', {
      type: playerWon ? 'success' : 'danger',
    });
  }

  setup();
  status.textContent = 'Frota posicionada. Clique em "Começar batalha".';
  return page;
}
