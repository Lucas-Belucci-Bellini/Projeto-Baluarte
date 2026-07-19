/**
 * Página /arma3-tutorial — Tutorial detalhado dos 105 mods do preset
 * "projeto baluarte vercel app" (pedido do operador: explicar cada mod —
 * o que é, como funciona, comandos e atalhos — tudo numa página só).
 *
 * Dados em src/data/arma3-tutoriais.js (1 entrada por mod, chave = id do
 * Workshop). A página monta: busca + chips de categoria + seções com cards.
 */

import '../styles/arma3-tutorial.css';
import '../styles/simbolos.css';
import { h, debounce, normalize } from '../utils/helpers.js';
import { ARMA3_PRESETS } from '../data/arma3-presets.js';
import { A3TUT_CATEGORIAS, A3TUT_MODS, A3TUT_TOTAL } from '../data/arma3-tutoriais.js';

const PRESET_ID = 'projeto-baluarte-vercel-app';

export function arma3TutorialPage() {
  const page = h('div', { className: 'page-a3tut' });
  const preset = ARMA3_PRESETS.find((p) => p.id === PRESET_ID);
  const urlPorId = Object.fromEntries(preset.mods.map((m) => [m.url.match(/id=(\d+)/)[1], m.url]));

  let busca = '', catAtiva = 'all';

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'TUTORIAL ARMA 3')),
      h('h1', { className: 'page-header__title' }, '📖 Tutorial dos mods — Arma 3'),
      h('p', { className: 'page-header__description' },
        'Cada um dos ', h('span', { className: 'u-text-cyan' }, `${A3TUT_TOTAL} mods`),
        ' do preset ', h('b', null, 'projeto baluarte vercel app'),
        ' explicado: o que é, como funciona, comandos e atalhos — tudo nesta página.')));

  /* aviso de honestidade sobre teclas + link do preset */
  page.appendChild(h('div', { className: 'card a3tut-aviso' },
    h('p', null,
      h('b', null, '⌨️ Sobre os atalhos: '),
      'as teclas listadas são os padrões conhecidos (do jogo e do ACE). Quase todo mod baseado no CBA deixa VER e TROCAR as teclas em ',
      h('b', null, 'Options → Controls → Configure Addons'),
      ' — quando o card diz "configurável", é lá. A página do Workshop (link em cada card) é a fonte oficial.'),
    h('div', { className: 'a3tut-aviso__acoes' },
      h('a', { className: 'btn btn--primary', href: preset.arquivo, download: '' }, '⬇ Baixar o preset (arrastar no Launcher)'),
      h('a', { className: 'btn', href: '#/modpack?jogo=arma3' }, '◧ Central de Modpacks'))));

  /* busca + chips de categoria */
  const buscaInput = h('input', {
    className: 'input a3tut-busca', type: 'search',
    placeholder: 'Buscar mod por nome ou assunto… (ex.: rapel, ACE, sniper, capacete)',
    oninput: debounce((e) => { busca = e.target.value; render(); }, 120)
  });
  const chips = h('div', { className: 'symbols-cats' });
  const cats = [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3TUT_CATEGORIAS];
  cats.forEach((c) => {
    chips.appendChild(h('button', {
      className: 'symbols-cat' + (c.id === catAtiva ? ' is-active' : ''), dataset: { cat: c.id },
      onclick: () => {
        catAtiva = c.id;
        chips.querySelectorAll('.symbols-cat').forEach((b) => b.classList.toggle('is-active', b.dataset.cat === c.id));
        render();
      }
    },
      h('span', { className: 'symbols-cat__icon' }, c.icon),
      h('span', { className: 'symbols-cat__label' }, c.nome)));
  });
  const contador = h('div', { className: 'a3tut-contador u-text-muted' });
  page.append(h('div', { className: 'a3tut-toolbar' }, buscaInput), chips, contador);

  const corpo = h('div', null);
  page.appendChild(corpo);

  function cardMod(id, t) {
    const atalhos = (t.atalhos || []).map(([tecla, acao]) =>
      h('div', { className: 'a3tut-atalho' },
        h('kbd', { className: 'a3tut-kbd' }, tecla),
        h('span', { className: 'a3tut-atalho__acao' }, acao)));
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, t.nome),
        h('a', { className: 'a3tut-card__ws', href: urlPorId[id], target: '_blank', rel: 'noopener noreferrer' }, 'Workshop ↗')),
      h('p', { className: 'a3tut-card__oque' }, t.oQue),
      h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMO FUNCIONA'),
        h('p', null, t.como)),
      atalhos.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMANDOS & ATALHOS'),
        h('div', { className: 'a3tut-atalhos' }, ...atalhos)) : null,
      t.dicas && t.dicas.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'DICAS'),
        h('ul', { className: 'a3tut-dicas' }, ...t.dicas.map((d) => h('li', null, d)))) : null);
  }

  function render() {
    const termo = normalize(busca.trim());
    corpo.replaceChildren();
    let visiveis = 0;
    A3TUT_CATEGORIAS.forEach((cat) => {
      if (catAtiva !== 'all' && catAtiva !== cat.id) return;
      const doCat = Object.entries(A3TUT_MODS).filter(([, t]) => t.cat === cat.id);
      const filtrados = !termo ? doCat : doCat.filter(([, t]) =>
        normalize(`${t.nome} ${t.oQue} ${t.como}`).includes(termo));
      if (!filtrados.length) return;
      visiveis += filtrados.length;
      corpo.appendChild(h('div', { className: 'a3tut-secao' },
        h('div', { className: 'a3tut-secao__head' },
          h('span', { className: 'a3tut-secao__icon' }, cat.icon),
          h('h2', { className: 'a3tut-secao__titulo' }, cat.nome),
          h('span', { className: 'badge badge--cyan' }, String(filtrados.length))),
        h('p', { className: 'a3tut-secao__desc u-text-muted' }, cat.desc),
        h('div', { className: 'a3tut-grid' }, ...filtrados.map(([id, t]) => cardMod(id, t)))));
    });
    if (!visiveis) corpo.appendChild(h('div', { className: 'card a3tut-vazio u-text-muted' }, 'Nenhum mod bate com essa busca.'));
    contador.textContent = `${visiveis} de ${A3TUT_TOTAL} mods`;
  }

  render();
  return page;
}
