/**
 * Página /arma3-tutorial — o centro de aprendizado do Arma 3 do operador:
 *   aba 1: 🎮 JOGO BASE (vanilla, sem mods) — tutorial completo do jogo
 *   aba 2: 🧩 MODS DO PRESET — os 105 mods explicados um a um
 *
 * Dados: src/data/arma3-vanilla.js (seções/tópicos do jogo base) e
 * src/data/arma3-tutoriais.js (1 entrada por mod, chave = id do Workshop)
 * + src/data/arma3-deps.js (dependências oficiais, geradas por script).
 */

import '../styles/arma3-tutorial.css';
import '../styles/simbolos.css';
import { h, debounce, normalize } from '../utils/helpers.js';
import { ARMA3_PRESETS } from '../data/arma3-presets.js';
import { A3TUT_CATEGORIAS, A3TUT_MODS, A3TUT_TOTAL, A3TUT_DUAL_ARMS } from '../data/arma3-tutoriais.js';
import { A3TUT_DEPS } from '../data/arma3-deps.js';
import { A3VAN_SECOES, A3VAN_TOTAL_TOPICOS } from '../data/arma3-vanilla.js';
import { A3CFG_SECOES, A3CFG_TOTAL_TOPICOS } from '../data/arma3-config.js';
import { A3CMD_SECOES, A3CMD_TOTAL } from '../data/arma3-comandos.js';

const PRESET_ID = 'projeto-baluarte-vercel-app';

export function arma3TutorialPage(args = {}) {
  const page = h('div', { className: 'page-a3tut' });
  const preset = ARMA3_PRESETS.find((p) => p.id === PRESET_ID);
  const urlPorId = Object.fromEntries(preset.mods.map((m) => [m.url.match(/id=(\d+)/)[1], m.url]));

  let busca = '', catAtiva = 'all';
  const abaInicial = (args.query || {}).aba;
  let aba = (abaInicial === 'mods' || abaInicial === 'config' || abaInicial === 'comandos') ? abaInicial : 'vanilla';

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'TUTORIAL ARMA 3')),
      h('h1', { className: 'page-header__title' }, '📖 Bíblia do Arma 3 — jogo, mods e configuração'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, 'Jogo base'),
        ` (${A3VAN_TOTAL_TOPICOS} tópicos) · `,
        h('span', { className: 'u-text-cyan' }, 'Instalar & configurar mods'),
        ` (${A3CFG_TOTAL_TOPICOS} tópicos) · `,
        h('span', { className: 'u-text-cyan' }, `${A3TUT_TOTAL} mods`),
        ' do preset explicados um a um. Tudo pra jogar — com ou sem mods.')));

  /* aviso de honestidade sobre teclas + link do preset */
  page.appendChild(h('div', { className: 'card a3tut-aviso' },
    h('p', null,
      h('b', null, '⌨️ Sobre os atalhos: '),
      'as teclas listadas são os padrões do jogo/ACE — TUDO é remapeável em ',
      h('b', null, 'Options → Controls'),
      ' (mods CBA: em Configure Addons). O Field Manual (Esc, dentro do jogo) é a referência oficial do vanilla; a página do Workshop (link em cada card) é a de cada mod.'),
    h('div', { className: 'a3tut-aviso__acoes' },
      h('a', { className: 'btn btn--primary', href: preset.arquivo, download: '' }, '⬇ Baixar o preset (arrastar no Launcher)'),
      h('a', { className: 'btn', href: '#/modpack?jogo=arma3' }, '◧ Central de Modpacks'))));

  /* ===== abas: jogo base | mods ===== */
  const abas = h('div', { className: 'symbols-cats a3tut-abas' });
  const abaBtn = (id, label) => h('button', {
    className: 'symbols-cat a3tut-aba' + (aba === id ? ' is-active' : ''), dataset: { aba: id },
    onclick: () => {
      aba = id; busca = ''; buscaInput.value = ''; catAtiva = 'all';
      abas.querySelectorAll('.a3tut-aba').forEach((b) => b.classList.toggle('is-active', b.dataset.aba === id));
      montarChips(); render();
    }
  }, h('span', { className: 'symbols-cat__label' }, label));
  abas.append(
    abaBtn('vanilla', `🎮 Jogo base (vanilla) · ${A3VAN_TOTAL_TOPICOS}`),
    abaBtn('config', `🔧 Instalar & configurar mods · ${A3CFG_TOTAL_TOPICOS}`),
    abaBtn('mods', `🧩 Mods do preset · ${A3TUT_TOTAL}`),
    abaBtn('comandos', `⌨️ Comandos & Spawn · ${A3CMD_TOTAL}`));
  page.appendChild(abas);

  /* busca + chips (as categorias mudam conforme a aba) */
  const buscaInput = h('input', {
    className: 'input a3tut-busca', type: 'search',
    placeholder: 'Buscar… (ex.: rapel, zeroing, comandar, sniper)',
    oninput: debounce((e) => { busca = e.target.value; render(); }, 120)
  });
  const chips = h('div', { className: 'symbols-cats' });
  function secoesDaAba() {
    if (aba === 'config') return A3CFG_SECOES;
    if (aba === 'comandos') return A3CMD_SECOES;
    if (aba === 'vanilla') return A3VAN_SECOES;
    return null; // mods usa A3TUT_CATEGORIAS
  }
  function montarChips() {
    chips.replaceChildren();
    const secs = secoesDaAba();
    const cats = aba === 'mods'
      ? [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...A3TUT_CATEGORIAS]
      : [{ id: 'all', nome: 'Tudo', icon: '⬡' }, ...secs.map((s) => ({ id: s.id, nome: s.nome, icon: s.icon }))];
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
  }
  const contador = h('div', { className: 'a3tut-contador u-text-muted' });
  page.append(h('div', { className: 'a3tut-toolbar' }, buscaInput), chips, contador);

  const corpo = h('div', null);
  page.appendChild(corpo);

  const linhaAtalho = ([tecla, acao]) =>
    h('div', { className: 'a3tut-atalho' },
      h('kbd', { className: 'a3tut-kbd' }, tecla),
      h('span', { className: 'a3tut-atalho__acao' }, acao));

  function cardMod(id, t) {
    const deps = A3TUT_DEPS[id];
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, t.nome),
        h('a', { className: 'a3tut-card__ws', href: urlPorId[id], target: '_blank', rel: 'noopener noreferrer' }, 'Workshop ↗')),
      deps && deps.length ? h('div', { className: 'a3tut-card__deps' },
        h('span', { className: 'a3tut-card__label' }, 'REQUER'),
        ...deps.map((dep) => h('span', { className: 'a3tut-dep' }, dep))) : null,
      h('p', { className: 'a3tut-card__oque' }, t.oQue),
      h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMO FUNCIONA'),
        h('p', null, t.como)),
      t.atalhos && t.atalhos.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMANDOS & ATALHOS'),
        h('div', { className: 'a3tut-atalhos' }, ...t.atalhos.map(linhaAtalho))) : null,
      t.dicas && t.dicas.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'DICAS'),
        h('ul', { className: 'a3tut-dicas' }, ...t.dicas.map((d) => h('li', null, d)))) : null);
  }

  function cardTopico(t) {
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, t.titulo)),
      h('p', { className: 'a3tut-card__oque' }, t.texto),
      t.atalhos && t.atalhos.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMANDOS & ATALHOS'),
        h('div', { className: 'a3tut-atalhos' }, ...t.atalhos.map(linhaAtalho))) : null,
      t.dicas && t.dicas.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'DICAS'),
        h('ul', { className: 'a3tut-dicas' }, ...t.dicas.map((d) => h('li', null, d)))) : null);
  }

  /* card da aba Comandos & Spawn: bloco SQF com botão de copiar */
  function cardComando(t) {
    let sqfEl = null;
    if (t.sqf) {
      const copiarBtn = h('button', {
        className: 'a3tut-sqf__copiar',
        onclick: () => {
          const done = () => { copiarBtn.textContent = 'copiado ✓'; setTimeout(() => { copiarBtn.textContent = '⧉ copiar'; }, 1600); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.sqf).then(done).catch(() => {});
          else done();
        }
      }, '⧉ copiar');
      sqfEl = h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'COMANDO (COLE NO CONSOLE)'),
        h('div', { className: 'a3tut-sqf' },
          h('pre', { className: 'a3tut-sqf__code' }, t.sqf),
          copiarBtn));
    }
    return h('div', { className: 'card a3tut-card' },
      h('div', { className: 'a3tut-card__head' },
        h('b', { className: 'a3tut-card__nome' }, t.titulo)),
      h('p', { className: 'a3tut-card__oque' }, t.texto),
      sqfEl,
      t.dicas && t.dicas.length ? h('div', { className: 'a3tut-card__sec' },
        h('span', { className: 'a3tut-card__label' }, 'DICAS'),
        h('ul', { className: 'a3tut-dicas' }, ...t.dicas.map((d) => h('li', null, d)))) : null);
  }

  function secaoEl(cat, cards, qtd, desc) {
    return h('div', { className: 'a3tut-secao' },
      h('div', { className: 'a3tut-secao__head' },
        h('span', { className: 'a3tut-secao__icon' }, cat.icon),
        h('h2', { className: 'a3tut-secao__titulo' }, cat.nome),
        h('span', { className: 'badge badge--cyan' }, String(qtd))),
      h('p', { className: 'a3tut-secao__desc u-text-muted' }, desc),
      h('div', { className: 'a3tut-grid' }, ...cards));
  }

  function render() {
    const termo = normalize(busca.trim());
    corpo.replaceChildren();
    let visiveis = 0, total = 0;

    if (aba === 'mods') {
      total = A3TUT_TOTAL;
      /* destaque pedido pelo operador: o mod das 2 armas principais (fora do
       * preset — Dual Arms). Aparece no topo da aba, some se a busca não bater. */
      const da = A3TUT_DUAL_ARMS;
      if (!termo || normalize(`${da.nome} ${da.oQue} duas armas principais primarias`).includes(termo)) {
        corpo.appendChild(h('div', { className: 'card a3tut-card a3tut-card--destaque' },
          h('div', { className: 'a3tut-card__head' },
            h('b', { className: 'a3tut-card__nome' }, '🎯 ' + da.nome),
            h('a', { className: 'a3tut-card__ws', href: da.url, target: '_blank', rel: 'noopener noreferrer' }, 'Workshop ↗')),
          h('div', { className: 'a3tut-card__deps' },
            h('span', { className: 'a3tut-dep a3tut-dep--aviso' }, da.nota)),
          h('p', { className: 'a3tut-card__oque' }, da.oQue),
          h('div', { className: 'a3tut-card__sec' },
            h('span', { className: 'a3tut-card__label' }, 'COMO FUNCIONA'),
            h('p', null, da.como)),
          h('div', { className: 'a3tut-card__sec' },
            h('span', { className: 'a3tut-card__label' }, 'COMANDOS & ATALHOS'),
            h('div', { className: 'a3tut-atalhos' }, ...da.atalhos.map(linhaAtalho))),
          h('div', { className: 'a3tut-card__sec' },
            h('span', { className: 'a3tut-card__label' }, 'DICAS'),
            h('ul', { className: 'a3tut-dicas' }, ...da.dicas.map((d) => h('li', null, d))))));
      }
      A3TUT_CATEGORIAS.forEach((cat) => {
        if (catAtiva !== 'all' && catAtiva !== cat.id) return;
        const doCat = Object.entries(A3TUT_MODS).filter(([, t]) => t.cat === cat.id);
        const filtrados = !termo ? doCat : doCat.filter(([, t]) =>
          normalize(`${t.nome} ${t.oQue} ${t.como}`).includes(termo));
        if (!filtrados.length) return;
        visiveis += filtrados.length;
        corpo.appendChild(secaoEl(cat, filtrados.map(([id, t]) => cardMod(id, t)), filtrados.length, cat.desc));
      });
      contador.textContent = `${visiveis} de ${total} mods`;
    } else {
      const secs = secoesDaAba();
      total = aba === 'config' ? A3CFG_TOTAL_TOPICOS : (aba === 'comandos' ? A3CMD_TOTAL : A3VAN_TOTAL_TOPICOS);
      const renderCard = aba === 'comandos' ? cardComando : cardTopico;
      secs.forEach((sec) => {
        if (catAtiva !== 'all' && catAtiva !== sec.id) return;
        const lista = sec.topicos || sec.itens || [];
        const filtrados = !termo ? lista : lista.filter((t) =>
          normalize(`${t.titulo} ${t.texto} ${t.sqf || ''}`).includes(termo));
        if (!filtrados.length) return;
        visiveis += filtrados.length;
        corpo.appendChild(secaoEl(sec, filtrados.map(renderCard), filtrados.length, sec.desc));
      });
      const rotulo = aba === 'config' ? 'tópicos de instalação/config'
        : (aba === 'comandos' ? 'comandos de console' : 'tópicos do jogo base');
      contador.textContent = `${visiveis} de ${total} ${rotulo}`;
    }
    if (!visiveis) corpo.appendChild(h('div', { className: 'card a3tut-vazio u-text-muted' }, 'Nada bate com essa busca.'));
  }

  montarChips();
  render();
  return page;
}
