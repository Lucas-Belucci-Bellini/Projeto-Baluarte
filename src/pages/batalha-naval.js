/**
 * /batalha-naval — Batalha Naval (issue #181).
 *
 * Jogo clássico contra o computador: posicione (automático) sua frota, atire no
 * tabuleiro inimigo e afunde todos os navios antes que ele afunde os seus.
 * A IA usa modo "caça" (ao acertar, mira nas células vizinhas). JS puro.
 */

import '../styles/batalha-naval.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

const N = 10;
const FLEET = [
  { name: 'Porta-aviões', size: 5 },
  { name: 'Encouraçado', size: 4 },
  { name: 'Cruzador', size: 3 },
  { name: 'Submarino', size: 3 },
  { name: 'Destróier', size: 2 }
];
const COLS = 'ABCDEFGHIJ';

function emptyBoard() {
  return Array.from({ length: N }, () => Array.from({ length: N }, () => ({ ship: null, hit: false })));
}

/** Posiciona a frota aleatoriamente (navios podem se tocar). */
function placeFleet() {
  const board = emptyBoard();
  const ships = [];
  for (const def of FLEET) {
    let placed = false, tries = 0;
    while (!placed && tries < 800) {
      tries++;
      const horiz = Math.random() < 0.5;
      const r = Math.floor(Math.random() * N);
      const c = Math.floor(Math.random() * N);
      const cells = [];
      let ok = true;
      for (let i = 0; i < def.size; i++) {
        const rr = horiz ? r : r + i;
        const cc = horiz ? c + i : c;
        if (rr >= N || cc >= N || board[rr][cc].ship !== null) { ok = false; break; }
        cells.push([rr, cc]);
      }
      if (!ok) continue;
      const ship = { name: def.name, size: def.size, cells, hits: 0 };
      for (const [rr, cc] of cells) board[rr][cc].ship = ship;
      ships.push(ship);
      placed = true;
    }
  }
  return { board, ships };
}

export function batalhaNavalPage() {
  const page = h('div', { className: 'page-bnaval' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'ARCADE'), h('span', null, '›'), h('span', null, 'BATALHA NAVAL')),
      h('h1', { className: 'page-header__title' }, '🚢 Batalha Naval'),
      h('p', { className: 'page-header__description' },
        'Afunde a frota inimiga antes que ela afunde a sua. Posicione (automático), depois clique no tabuleiro do inimigo para atirar.'))
  );

  /* estado */
  let player, enemy, ai, phase, turnLock;
  const playerCells = [];
  const enemyCells = [];

  const status = h('div', { className: 'bn-status' }, '');
  const playerFleetEl = h('div', { className: 'bn-fleet' });
  const enemyFleetEl = h('div', { className: 'bn-fleet' });

  const playerGrid = h('div', { className: 'bn-grid' });
  const enemyGrid = h('div', { className: 'bn-grid bn-grid--enemy' });

  const reshuffleBtn = h('button', { className: 'btn btn--ghost', onclick: () => { setup(); toast('Frota reposicionada'); } }, '🔀 Reposicionar');
  const startBtn = h('button', { className: 'btn btn--primary', onclick: () => startGame() }, '▶ Começar batalha');
  const restartBtn = h('button', { className: 'btn btn--ghost', style: { display: 'none' }, onclick: () => { setup(); status.textContent = 'Frota pronta. Clique em "Começar batalha".'; status.className = 'bn-status'; } }, '↻ Nova partida');
  const controls = h('div', { className: 'bn-controls' }, reshuffleBtn, startBtn, restartBtn);

  page.append(
    status,
    controls,
    h('div', { className: 'bn-boards' },
      h('div', { className: 'bn-board' }, h('div', { className: 'bn-board__title' }, '🛡️ Sua frota'), wrapGrid(playerGrid), playerFleetEl),
      h('div', { className: 'bn-board' }, h('div', { className: 'bn-board__title' }, '🎯 Inimigo'), wrapGrid(enemyGrid), enemyFleetEl))
  );

  /* ===== construção dos tabuleiros ===== */
  function wrapGrid(grid) {
    const wrap = h('div', { className: 'bn-grid-wrap' });
    /* cabeçalho de colunas */
    const top = h('div', { className: 'bn-axis bn-axis--top' }, h('span', { className: 'bn-corner' }, ''));
    for (let c = 0; c < N; c++) top.appendChild(h('span', { className: 'bn-axis__lbl' }, COLS[c]));
    wrap.append(top, grid);
    return wrap;
  }

  function buildGrid(gridEl, cellStore, enemySide) {
    empty(gridEl);
    cellStore.length = 0;
    for (let r = 0; r < N; r++) {
      const row = [];
      const rowEl = h('div', { className: 'bn-row' }, h('span', { className: 'bn-axis__lbl bn-axis__lbl--row' }, String(r + 1)));
      for (let c = 0; c < N; c++) {
        const cellEl = h('button', {
          className: 'bn-cell', type: 'button',
          onclick: enemySide ? () => fireAtEnemy(r, c) : null
        });
        rowEl.appendChild(cellEl);
        row.push(cellEl);
      }
      gridEl.appendChild(rowEl);
      cellStore.push(row);
    }
  }

  function renderCell(cellEl, cell, reveal) {
    let cls = 'bn-cell';
    if (cell.ship && (reveal || cell.hit)) cls += cell.hit ? (cell.ship.hits >= cell.ship.size ? ' is-sunk' : ' is-hit') : ' is-ship';
    else if (cell.hit) cls += ' is-miss';
    cellEl.className = cls;
  }

  function renderBoard(board, cellStore, reveal) {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) renderCell(cellStore[r][c], board[r][c], reveal);
  }

  function renderFleet(el, ships, hideName) {
    empty(el);
    for (const s of ships) {
      const sunk = s.hits >= s.size;
      el.appendChild(h('span', { className: 'bn-ship' + (sunk ? ' is-sunk' : '') },
        hideName && !sunk ? '■'.repeat(s.size) : `${s.name} ${sunk ? '✖' : ''}`));
    }
  }

  /* ===== fluxo do jogo ===== */
  function setup() {
    const p = placeFleet(); player = p.board; const playerShips = p.ships;
    const e = placeFleet(); enemy = e.board; const enemyShips = e.ships;
    player.ships = playerShips; enemy.ships = enemyShips;
    ai = { queue: [], tried: new Set() };
    phase = 'setup'; turnLock = false;
    buildGrid(playerGrid, playerCells, false);
    buildGrid(enemyGrid, enemyCells, true);
    renderBoard(player, playerCells, true);
    renderBoard(enemy, enemyCells, false);
    renderFleet(playerFleetEl, playerShips, false);
    renderFleet(enemyFleetEl, enemyShips, true);
    enemyGrid.classList.add('is-locked');
    reshuffleBtn.style.display = ''; startBtn.style.display = ''; restartBtn.style.display = 'none';
    status.textContent = 'Frota posicionada. Reposicione se quiser e clique em "Começar batalha".';
    status.className = 'bn-status';
  }

  function startGame() {
    phase = 'play';
    enemyGrid.classList.remove('is-locked');
    reshuffleBtn.style.display = 'none'; startBtn.style.display = 'none'; restartBtn.style.display = '';
    status.textContent = 'Sua vez — clique numa célula do inimigo para atirar.';
  }

  function alive(board) { return board.ships.some((s) => s.hits < s.size); }

  function fireAtEnemy(r, c) {
    if (phase !== 'play' || turnLock) return;
    const cell = enemy[r][c];
    if (cell.hit) return; /* já atirou aqui */
    cell.hit = true;
    let msg;
    if (cell.ship) {
      cell.ship.hits++;
      const sunk = cell.ship.hits >= cell.ship.size;
      msg = sunk ? `💥 Você afundou o ${cell.ship.name} inimigo!` : '🔥 Acertou!';
    } else { msg = '🌊 Água.'; }
    renderBoard(enemy, enemyCells, false);
    renderFleet(enemyFleetEl, enemy.ships, true);
    if (!alive(enemy)) { return endGame(true); }
    status.textContent = msg + ' Inimigo atacando…';
    turnLock = true;
    setTimeout(enemyTurn, 650);
  }

  function enemyTurn() {
    let r, c;
    while (ai.queue.length) {
      const [qr, qc] = ai.queue.shift();
      if (qr < 0 || qc < 0 || qr >= N || qc >= N) continue;
      if (ai.tried.has(qr + ',' + qc)) continue;
      r = qr; c = qc; break;
    }
    if (r === undefined) {
      do { r = Math.floor(Math.random() * N); c = Math.floor(Math.random() * N); } while (ai.tried.has(r + ',' + c));
    }
    ai.tried.add(r + ',' + c);
    const cell = player[r][c];
    cell.hit = true;
    let msg;
    if (cell.ship) {
      cell.ship.hits++;
      const sunk = cell.ship.hits >= cell.ship.size;
      msg = sunk ? `🛑 O inimigo afundou seu ${cell.ship.name}!` : '⚠ O inimigo acertou seu navio.';
      if (!sunk) ai.queue.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
    } else { msg = '✅ O inimigo errou (água).'; }
    renderBoard(player, playerCells, true);
    renderFleet(playerFleetEl, player.ships, false);
    if (!alive(player)) { return endGame(false); }
    status.textContent = msg + ' Sua vez.';
    turnLock = false;
  }

  function endGame(playerWon) {
    phase = 'over'; turnLock = true;
    renderBoard(enemy, enemyCells, true); /* revela a frota inimiga */
    renderFleet(enemyFleetEl, enemy.ships, false);
    status.textContent = playerWon ? '🏆 VITÓRIA! Você afundou toda a frota inimiga.' : '☠ DERROTA. Sua frota foi ao fundo.';
    status.className = 'bn-status ' + (playerWon ? 'is-win' : 'is-lose');
    toast(playerWon ? 'Vitória!' : 'Derrota!', { type: playerWon ? 'success' : 'danger' });
  }

  setup();
  status.textContent = 'Frota posicionada. Clique em "Começar batalha".';
  return page;
}
