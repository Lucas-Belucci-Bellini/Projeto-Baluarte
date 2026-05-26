/**
 * Página /jogos — Jogos de Aprendizado.
 * 3 jogos: JavaScript ("Qual a saída?"), HTML (múltipla escolha) e
 * CSS ("Acerte o Layout" com Flexbox). Pontuação e progressão. JS puro.
 */

import { h, empty, cx } from '../utils/helpers.js';
import { highlight } from '../utils/syntax-highlight.js';
import { getLang } from '../data/editor-langs.js';
import {
  JS_DESAFIOS, HTML_DESAFIOS, CSS_NIVEIS, JUSTIFY_OPCOES, ALIGN_OPCOES
} from '../data/jogos.js';

const JS_LANG = getLang('javascript');
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

function progresso(i, total, score) {
  return h('div', { className: 'jogo-prog' },
    h('span', null, `Questão ${Math.min(i + 1, total)}/${total}`),
    h('span', { className: 'u-text-cyan' }, `Pontos: ${score}`));
}
function fim(nome, score, total, restart) {
  return h('div', { className: 'jogo-fim' },
    h('div', { className: 'jogo-fim__big u-text-cyan' }, `${score}/${total}`),
    h('p', null, `Você concluiu o jogo de ${nome}!`),
    h('button', { className: 'btn btn--primary btn--sm', onclick: restart }, '↻ Jogar de novo'));
}

/* ===== JavaScript — Qual a saída? ===== */
function jogoJS(host) {
  let i = 0, score = 0, answered = false;
  function render() {
    empty(host);
    if (i >= JS_DESAFIOS.length) { host.appendChild(fim('JavaScript', score, JS_DESAFIOS.length, () => { i = 0; score = 0; answered = false; render(); })); return; }
    const d = JS_DESAFIOS[i];
    const codeEl = h('code'); codeEl.innerHTML = highlight(d.code, JS_LANG);
    const input = h('input', {
      className: 'input jogo-input u-mono', placeholder: 'Digite a saída exata…',
      onkeydown: (e) => { if (e.key === 'Enter') act(); }
    });
    const fb = h('div', { className: 'jogo-fb' });
    const btn = h('button', { className: 'btn btn--primary btn--sm', onclick: () => act() }, 'Verificar');
    function act() {
      if (!answered) {
        answered = true;
        const ok = norm(input.value) === norm(d.resp);
        if (ok) score++;
        fb.className = 'jogo-fb ' + (ok ? 'is-ok' : 'is-no');
        fb.textContent = ok ? '✓ Correto!' : `✗ A saída é:  ${d.resp}`;
        btn.textContent = 'Próximo →';
      } else { i++; answered = false; render(); }
    }
    host.append(
      progresso(i, JS_DESAFIOS.length, score),
      h('p', { className: 'jogo-q' }, 'O que este código imprime no console?'),
      h('pre', { className: 'jogo-code' }, codeEl),
      h('div', { className: 'jogo-row' }, input, btn),
      fb);
    setTimeout(() => input.focus(), 30);
  }
  render();
}

/* ===== HTML — Qual o HTML certo? ===== */
function jogoHTML(host) {
  let i = 0, score = 0, answered = false;
  function render() {
    empty(host);
    if (i >= HTML_DESAFIOS.length) { host.appendChild(fim('HTML', score, HTML_DESAFIOS.length, () => { i = 0; score = 0; answered = false; render(); })); return; }
    const d = HTML_DESAFIOS[i];
    const fb = h('div', { className: 'jogo-fb' });
    const next = h('button', { className: 'btn btn--primary btn--sm', style: { display: 'none' }, onclick: () => { i++; answered = false; render(); } }, 'Próximo →');
    const opts = h('div', { className: 'jogo-opcoes' });
    d.opcoes.forEach((o, idx) => {
      opts.appendChild(h('button', {
        className: 'jogo-opcao u-mono',
        onclick: () => {
          if (answered) return;
          answered = true;
          const ok = idx === d.certa;
          if (ok) score++;
          [...opts.children].forEach((b, k) => { if (k === d.certa) b.classList.add('is-ok'); else if (k === idx) b.classList.add('is-no'); });
          fb.className = 'jogo-fb ' + (ok ? 'is-ok' : 'is-no');
          fb.textContent = ok ? '✓ Correto!' : '✗ A resposta certa está destacada em verde.';
          next.style.display = '';
        }
      }, o));
    });
    host.append(
      progresso(i, HTML_DESAFIOS.length, score),
      h('p', { className: 'jogo-q' }, 'Qual o HTML certo para: ', h('b', null, d.pergunta), '?'),
      opts, fb, next);
  }
  render();
}

/* ===== CSS — Acerte o Layout (Flexbox) ===== */
function jogoCSS(host) {
  let lvl = 0, score = 0, justify = JUSTIFY_OPCOES[0], align = ALIGN_OPCOES[0];
  const boxes = () => [h('span', { className: 'jogo-box' }), h('span', { className: 'jogo-box' }), h('span', { className: 'jogo-box' })];
  function render() {
    empty(host);
    if (lvl >= CSS_NIVEIS.length) {
      host.appendChild(fim('CSS', score, CSS_NIVEIS.length, () => { lvl = 0; score = 0; justify = JUSTIFY_OPCOES[0]; align = ALIGN_OPCOES[0]; render(); }));
      return;
    }
    const n = CSS_NIVEIS[lvl];
    const alvo = h('div', { className: 'jogo-flex', style: { justifyContent: n.justify, alignItems: n.align } }, ...boxes());
    const player = h('div', { className: 'jogo-flex is-player', style: { justifyContent: justify, alignItems: align } }, ...boxes());
    const fb = h('div', { className: 'jogo-fb' });
    const grupo = (label, opts, cur, set) => h('div', { className: 'jogo-ctrl' },
      h('span', { className: 'jogo-ctrl__lbl u-mono u-text-muted' }, label),
      h('div', { className: 'jogo-btns' }, ...opts.map((o) => h('button', {
        className: cx('chip', o === cur && 'chip--active'),
        onclick: () => { set(o); render(); }
      }, o))));
    host.append(
      progresso(lvl, CSS_NIVEIS.length, score),
      h('p', { className: 'jogo-q' }, '🎯 ', n.dica),
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
            fb.className = 'jogo-fb is-ok'; fb.textContent = '✓ Acertou! Próximo nível…';
            setTimeout(() => { lvl++; justify = JUSTIFY_OPCOES[0]; align = ALIGN_OPCOES[0]; render(); }, 850);
          } else {
            fb.className = 'jogo-fb is-no'; fb.textContent = '✗ Ainda não bateu com o alvo. Ajuste e tente de novo.';
          }
        }
      }, 'Verificar'),
      fb);
  }
  render();
}

const GAMES = { js: jogoJS, html: jogoHTML, css: jogoCSS };
const TABS = [['js', '⌨ JavaScript'], ['html', '◫ HTML'], ['css', '◐ CSS']];

export function jogosPage() {
  const page = h('div', { className: 'page-jogos' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'CONHECIMENTO'), h('span', null, '›'), h('span', null, 'JOGOS')),
      h('h1', { className: 'page-header__title' }, '🎮 Jogos de Aprendizado'),
      h('p', { className: 'page-header__description' },
        'Aprenda programação jogando — ',
        h('span', { className: 'u-text-cyan' }, 'JavaScript, HTML e CSS'),
        '. Responda os desafios e some pontos.'))
  );

  const host = h('div', { className: 'jogo-host card' });
  const tabs = h('div', { className: 'jogo-tabs' });
  function selectTab(id) {
    [...tabs.children].forEach((b) => b.classList.toggle('is-active', b.dataset.g === id));
    empty(host);
    GAMES[id](host);
  }
  TABS.forEach(([id, label]) => tabs.appendChild(
    h('button', { className: 'jogo-tab', 'data-g': id, onclick: () => selectTab(id) }, label)));

  page.append(tabs, host);
  selectTab('js');
  return page;
}
