/**
 * Painel de EXTRAÇÃO do Arma 3 — aba `📡 Extrair` de `/arma3-tutorial` (0.9.1).
 *
 * Só existe dentro do Baluarte Launcher: precisa do log do jogo e do clone do
 * repositório, duas coisas que só a máquina tem. Na web pura a aba nem aparece
 * (regra do #238 — o nativo mora no app).
 *
 * O painel segue os TRÊS PASSOS do módulo nativo, separados de propósito:
 *
 *   1. ver     — o que o jogo já dumpou, e o que falta colar no console
 *   2. extrair — roda os parsers (Python, no repo) e mostra o log com os avisos
 *   3. entregar— commita num ramo próprio; empurrar é um segundo clique
 *
 * Um botão só que fizesse tudo esconderia justamente o momento de conferir — e
 * o que sai daqui vira commit no repositório, não uma tela que dá pra fechar.
 */

import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { statusExtracao, extrairArma3, entregarArma3 } from '../utils/arma3-extracao.js';

const ROTULOS = {
  armas: 'Armas', mapas: 'Mapas', itens: 'Itens', veiculos: 'Veículos',
  acessorios: 'Acessórios', animacoes: 'Animações', grupos: 'Ordem de batalha',
  funcoes: 'Funções SQF', manual: 'Manual de campo', simbologia: 'Simbologia',
  'terreno-fisico': 'Terreno físico', proveniencia: 'Proveniência'
};

const linha = (rotulo, valor, classe) =>
  h('div', { className: 'a3ext-linha' },
    h('span', { className: 'a3ext-linha__k u-text-muted' }, rotulo),
    h('span', { className: 'a3ext-linha__v ' + (classe || '') }, valor));

/**
 * Monta o painel dentro de `alvo`.
 * @param {HTMLElement} alvo  container já vazio
 */
export async function montarPainelExtracao(alvo) {
  const escolhidas = new Set();
  let ultimaEntrega = null;

  const painel = h('div', { className: 'a3ext' });
  const cabecalho = h('div', { className: 'a3ext-bloco card' });
  const listaEl = h('div', { className: 'a3ext-lista' });
  const acoesEl = h('div', { className: 'a3ext-acoes' });
  const logEl = h('pre', { className: 'a3ext-log u-mono' });
  painel.append(cabecalho, listaEl, acoesEl, logEl);
  alvo.appendChild(painel);

  const escrever = (texto) => { logEl.textContent = String(texto || '').trim(); };

  /* ── passo 1: ver ─────────────────────────────────────────────────────── */
  async function recarregar() {
    empty(cabecalho); empty(listaEl); empty(acoesEl);
    cabecalho.appendChild(h('p', { className: 'u-text-muted' }, 'Consultando o jogo e o repositório…'));

    const st = await statusExtracao();

    empty(cabecalho);
    if (!st.disponivel) {
      cabecalho.appendChild(h('p', null,
        'A extração roda só no ', h('b', null, 'Baluarte Launcher'),
        ' — ela precisa do log do jogo e do clone do repositório na máquina.'));
      return;
    }
    if (st.erro) {
      cabecalho.appendChild(h('p', { className: 'u-text-danger' }, `Falha ao consultar: ${st.erro}`));
      return;
    }

    const repoOk = st.repo && st.repo.valido;
    cabecalho.append(
      h('h3', { className: 'a3ext-titulo' }, '📡 Extração do Arma 3'),
      linha('Repositório', repoOk ? `${st.repo.caminho} · ramo ${st.repo.ramo}` : (st.repo?.motivo || 'não encontrado'),
        repoOk ? 'u-text-success' : 'u-text-danger'),
      linha('Python', st.python?.versao || 'não encontrado',
        st.python?.cmd ? 'u-text-success' : 'u-text-danger'),
      linha('Log do jogo', st.rpt?.caminho || 'nenhum .rpt encontrado',
        st.rpt ? '' : 'u-text-warning'),
    );
    if (repoOk && st.repo.pendentesForaDaSaida > 0) {
      cabecalho.appendChild(h('p', { className: 'u-text-warning' },
        `⚠ ${st.repo.pendentesForaDaSaida} alteração(ões) pendentes fora da pasta de saída. `
        + 'A entrega fica bloqueada até você commitar ou guardar — para a extração não '
        + 'carregar edição alheia junto.'));
    }

    /* o que o jogo JÁ tem */
    const prontas = st.disponiveis || [];
    listaEl.appendChild(h('div', { className: 'a3ext-secao__titulo' },
      prontas.length ? `No log do jogo (${prontas.length})` : 'Nada dumpado ainda'));

    for (const etapa of prontas) {
      const d = st.dumps[etapa] || {};
      const cx = h('input', {
        type: 'checkbox', checked: true,
        'aria-label': `Extrair ${ROTULOS[etapa] || etapa}`,
        onchange: (e) => { e.target.checked ? escolhidas.add(etapa) : escolhidas.delete(etapa); }
      });
      escolhidas.add(etapa);
      listaEl.appendChild(h('label', { className: 'a3ext-item' }, cx,
        h('span', { className: 'a3ext-item__nome' }, ROTULOS[etapa] || etapa),
        h('span', { className: 'a3ext-item__det u-text-muted u-mono' },
          `${d.registros} registro(s)${d.completo ? '' : ' · INCOMPLETO'}`),
        d.completo ? null
          : h('span', { className: 'u-text-warning', title: 'o dump não tem marca de FIM — o jogo pode ter sido fechado no meio' }, '⚠')));
    }

    /* o que FALTA colar no jogo */
    if (st.faltamNoJogo?.length) {
      listaEl.appendChild(h('div', { className: 'a3ext-secao__titulo' },
        `Falta rodar no jogo (${st.faltamNoJogo.length})`));
      listaEl.appendChild(h('p', { className: 'u-text-muted a3ext-ajuda' },
        'No jogo: Esc → Debug Console → cole o arquivo → Execute. Depois volte aqui e atualize.'));
      for (const f of st.faltamNoJogo) {
        listaEl.appendChild(h('div', { className: 'a3ext-item a3ext-item--falta' },
          h('span', { className: 'a3ext-item__nome u-text-muted' }, ROTULOS[f.etapa] || f.etapa),
          h('code', { className: 'a3ext-item__det' }, f.sqf)));
      }
    }

    /* ── passos 2 e 3 ─────────────────────────────────────────────────── */
    const btnAtualizar = h('button', { className: 'btn btn--ghost btn--sm', onclick: recarregar }, '↻ Atualizar');
    const btnExtrair = h('button', {
      className: 'btn btn--primary', disabled: !st.pronto,
      title: st.pronto ? '' : 'precisa de repositório, Python e ao menos um dump no log',
      onclick: async () => {
        btnExtrair.disabled = true;
        btnExtrair.textContent = '⏳ Extraindo… (pode levar minutos)';
        escrever('rodando os parsers…');
        try {
          const r = await extrairArma3([...escolhidas]);
          escrever(r.log);
          if (r.avisos?.length) {
            toast(`Extração terminou com ${r.avisos.length} aviso(s) — veja o log.`, { type: 'warning' });
          } else if (r.ok) {
            toast(`Extração pronta: ${r.arquivosMudados.length} base(s) atualizada(s).`, { type: 'success' });
          } else {
            toast(r.expirou ? 'A extração estourou o tempo.' : 'A extração falhou — veja o log.', { type: 'danger' });
          }
          await recarregar();
        } catch (e) {
          escrever(String(e.message || e));
          toast('Falha ao extrair.', { type: 'danger' });
        } finally {
          btnExtrair.disabled = false;
          btnExtrair.textContent = '▶ Extrair selecionadas';
        }
      }
    }, '▶ Extrair selecionadas');

    const btnCommit = h('button', {
      className: 'btn btn--ghost', disabled: !repoOk,
      onclick: () => entregar(false)
    }, '⎘ Commitar num ramo');

    const btnEmpurrar = h('button', {
      className: 'btn btn--ghost', disabled: !repoOk,
      title: 'usa o git da máquina — o app não guarda token do GitHub',
      onclick: () => entregar(true)
    }, '⇧ Commitar e empurrar');

    async function entregar(empurrar) {
      btnCommit.disabled = btnEmpurrar.disabled = true;
      try {
        const r = await entregarArma3({ etapas: [...escolhidas], empurrar });
        ultimaEntrega = r;
        if (r.ok === false) { toast(r.motivo, { type: 'warning' }); escrever(r.motivo); return; }
        escrever([
          `ramo:    ${r.ramo}`,
          `commit:  ${r.commit}`,
          `arquivos:\n  ${r.arquivos.join('\n  ')}`,
          r.empurrado ? `\nempurrado. Abra o PR:\n  ${r.prUrl}` : '\ncommit LOCAL — confira e depois use "empurrar".'
        ].join('\n'));
        toast(r.empurrado ? 'Empurrado — abra o PR pelo link no log.' : 'Commitado localmente.',
              { type: 'success' });
        if (r.empurrado && r.prUrl) {
          acoesEl.appendChild(h('a', {
            className: 'btn btn--primary btn--sm', href: r.prUrl,
            target: '_blank', rel: 'noopener noreferrer'
          }, '↗ Abrir PR no GitHub'));
        }
        await recarregar();
      } catch (e) {
        escrever(String(e.message || e));
        toast('Falha na entrega.', { type: 'danger' });
      } finally {
        btnCommit.disabled = btnEmpurrar.disabled = !repoOk;
      }
    }

    acoesEl.append(btnAtualizar, btnExtrair, btnCommit, btnEmpurrar);
    if (ultimaEntrega?.prUrl) {
      acoesEl.appendChild(h('a', {
        className: 'btn btn--primary btn--sm', href: ultimaEntrega.prUrl,
        target: '_blank', rel: 'noopener noreferrer'
      }, '↗ Abrir PR no GitHub'));
    }
  }

  await recarregar();
  return painel;
}
