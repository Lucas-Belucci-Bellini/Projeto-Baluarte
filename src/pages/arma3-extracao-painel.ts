/**
 * Painel de EXTRAÇÃO do Arma 3 — superfície app-only.
 *
 * A página continua apenas orquestrando o adaptador nativo: consultar estado,
 * extrair etapas selecionadas e entregar em commit/push somente por ação
 * explícita do operador.
 */

import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast';
import { statusExtracao, extrairArma3, entregarArma3 } from '../utils/arma3-extracao';
import type { Arma3DeliveryResult, Arma3Status } from '../utils/arma3-extracao';

const LABELS: Record<string, string> = {
  armas: 'Armas', mapas: 'Mapas', itens: 'Itens', veiculos: 'Veículos',
  acessorios: 'Acessórios', animacoes: 'Animações', grupos: 'Ordem de batalha',
  funcoes: 'Funções SQF', manual: 'Manual de campo', simbologia: 'Simbologia',
  'terreno-fisico': 'Terreno físico', proveniencia: 'Proveniência',
};

function line(label: string, value: string, className = ''): HTMLDivElement {
  return h('div', { className: 'a3ext-linha' },
    h('span', { className: 'a3ext-linha__k u-text-muted' }, label),
    h('span', { className: `a3ext-linha__v ${className}` }, value),
  );
}

export async function montarPainelExtracao(target: HTMLElement): Promise<HTMLDivElement> {
  const selectedStages = new Set<string>();
  let lastDelivery: Arma3DeliveryResult | null = null;
  const panel = h('div', { className: 'a3ext' });
  const header = h('div', { className: 'a3ext-bloco card' });
  const list = h('div', { className: 'a3ext-lista' });
  const actions = h('div', { className: 'a3ext-acoes' });
  const log = h('pre', { className: 'a3ext-log u-mono' });
  panel.append(header, list, actions, log);
  target.appendChild(panel);

  const writeLog = (text: unknown): void => { log.textContent = String(text ?? '').trim(); };

  async function reload(): Promise<void> {
    empty(header); empty(list); empty(actions);
    header.appendChild(h('p', { className: 'u-text-muted' }, 'Consultando o jogo e o repositório…'));
    const status: Arma3Status = await statusExtracao();
    empty(header);
    if (!status.disponivel) {
      header.appendChild(h('p', null,
        'A extração roda só no ', h('b', null, 'Baluarte Launcher'),
        ' — ela precisa do log do jogo e do clone do repositório na máquina.',
      ));
      return;
    }
    if (status.erro) {
      header.appendChild(h('p', { className: 'u-text-danger' }, `Falha ao consultar: ${status.erro}`));
      return;
    }

    const repository = status.repo;
    const repositoryOk = repository?.valido === true;
    header.append(
      h('h3', { className: 'a3ext-titulo' }, '📡 Extração do Arma 3'),
      line('Repositório', repositoryOk
        ? `${repository?.caminho ?? ''} · ramo ${repository?.ramo ?? ''}`
        : (repository?.motivo ?? 'não encontrado'), repositoryOk ? 'u-text-success' : 'u-text-danger'),
      line('Python', status.python?.versao ?? 'não encontrado', status.python?.cmd ? 'u-text-success' : 'u-text-danger'),
      line('Log do jogo', status.rpt?.caminho ?? 'nenhum .rpt encontrado', status.rpt ? '' : 'u-text-warning'),
    );
    if (repositoryOk && (repository?.pendentesForaDaSaida ?? 0) > 0) {
      header.appendChild(h('p', { className: 'u-text-warning' },
        `⚠ ${repository?.pendentesForaDaSaida} alteração(ões) pendentes fora da pasta de saída. A entrega fica bloqueada até você commitar ou guardar — para a extração não carregar edição alheia junto.`,
      ));
    }

    const available = status.disponiveis ?? [];
    list.appendChild(h('div', { className: 'a3ext-secao__titulo' },
      available.length ? `No log do jogo (${available.length})` : 'Nada dumpado ainda'));
    for (const stage of available) {
      const dump = status.dumps?.[stage] ?? {};
      const checkbox = h('input', {
        type: 'checkbox', checked: true,
        'aria-label': `Extrair ${LABELS[stage] ?? stage}`,
        onchange: (event: Event) => {
          if (!(event.target instanceof HTMLInputElement)) return;
          if (event.target.checked) selectedStages.add(stage);
          else selectedStages.delete(stage);
        },
      });
      selectedStages.add(stage);
      list.appendChild(h('label', { className: 'a3ext-item' }, checkbox,
        h('span', { className: 'a3ext-item__nome' }, LABELS[stage] ?? stage),
        h('span', { className: 'a3ext-item__det u-text-muted u-mono' },
          `${dump.registros ?? 0} registro(s)${dump.completo ? '' : ' · INCOMPLETO'}`),
        dump.completo ? false : h('span', {
          className: 'u-text-warning', title: 'o dump não tem marca de FIM — o jogo pode ter sido fechado no meio',
        }, '⚠'),
      ));
    }

    const missing = status.faltamNoJogo ?? [];
    if (missing.length) {
      list.appendChild(h('div', { className: 'a3ext-secao__titulo' }, `Falta rodar no jogo (${missing.length})`));
      list.appendChild(h('p', { className: 'u-text-muted a3ext-ajuda' },
        'No jogo: Esc → Debug Console → cole o arquivo → Execute. Depois volte aqui e atualize.',
      ));
      missing.forEach((item) => list.appendChild(h('div', { className: 'a3ext-item a3ext-item--falta' },
        h('span', { className: 'a3ext-item__nome u-text-muted' }, LABELS[item.etapa] ?? item.etapa),
        h('code', { className: 'a3ext-item__det' }, item.sqf),
      )));
    }

    const updateButton = h('button', { className: 'btn btn--ghost btn--sm', onclick: () => { void reload(); } }, '↻ Atualizar');
    const extractButton = h('button', {
      className: 'btn btn--primary',
      disabled: !status.pronto,
      title: status.pronto ? '' : 'precisa de repositório, Python e ao menos um dump no log',
      onclick: async () => {
        extractButton.disabled = true;
        extractButton.textContent = '⏳ Extraindo… (pode levar minutos)';
        writeLog('rodando os parsers…');
        try {
          const result = await extrairArma3([...selectedStages]);
          writeLog(result.log);
          if (result.avisos?.length) toast(`Extração terminou com ${result.avisos.length} aviso(s) — veja o log.`, { type: 'warning' });
          else if (result.ok) toast(`Extração pronta: ${result.arquivosMudados?.length ?? 0} base(s) atualizada(s).`, { type: 'success' });
          else toast(result.expirou ? 'A extração estourou o tempo.' : 'A extração falhou — veja o log.', { type: 'danger' });
          await reload();
        } catch (error: unknown) {
          writeLog(error instanceof Error ? error.message : String(error));
          toast('Falha ao extrair.', { type: 'danger' });
        } finally {
          extractButton.disabled = false;
          extractButton.textContent = '▶ Extrair selecionadas';
        }
      },
    }, '▶ Extrair selecionadas');

    const commitButton = h('button', {
      className: 'btn btn--ghost', disabled: !repositoryOk, onclick: () => { void deliver(false); },
    }, '⎘ Commitar num ramo');
    const pushButton = h('button', {
      className: 'btn btn--ghost', disabled: !repositoryOk,
      title: 'usa o git da máquina — o app não guarda token do GitHub',
      onclick: () => { void deliver(true); },
    }, '⇧ Commitar e empurrar');

    async function deliver(push: boolean): Promise<void> {
      commitButton.disabled = true;
      pushButton.disabled = true;
      try {
        const result = await entregarArma3({ etapas: [...selectedStages], empurrar: push });
        lastDelivery = result;
        if (result.ok === false) {
          const reason = result.motivo ?? 'A entrega foi recusada.';
          toast(reason, { type: 'warning' });
          writeLog(reason);
          return;
        }
        writeLog([
          `ramo:    ${result.ramo ?? ''}`,
          `commit:  ${result.commit ?? ''}`,
          `arquivos:\n  ${(result.arquivos ?? []).join('\n  ')}`,
          result.empurrado ? `\nempurrado. Abra o PR:\n  ${result.prUrl ?? ''}` : '\ncommit LOCAL — confira e depois use "empurrar".',
        ].join('\n'));
        toast(result.empurrado ? 'Empurrado — abra o PR pelo link no log.' : 'Commitado localmente.', { type: 'success' });
        if (result.empurrado && result.prUrl) actions.appendChild(h('a', {
          className: 'btn btn--primary btn--sm', href: result.prUrl, target: '_blank', rel: 'noopener noreferrer',
        }, '↗ Abrir PR no GitHub'));
        await reload();
      } catch (error: unknown) {
        writeLog(error instanceof Error ? error.message : String(error));
        toast('Falha na entrega.', { type: 'danger' });
      } finally {
        commitButton.disabled = pushButton.disabled = !repositoryOk;
      }
    }

    actions.append(updateButton, extractButton, commitButton, pushButton);
    if (lastDelivery?.prUrl) actions.appendChild(h('a', {
      className: 'btn btn--primary btn--sm', href: lastDelivery.prUrl, target: '_blank', rel: 'noopener noreferrer',
    }, '↗ Abrir PR no GitHub'));
  }

  await reload();
  return panel;
}
