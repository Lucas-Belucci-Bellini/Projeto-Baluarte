/**
 * Escalonador de trabalho — concorrência local do Core V2.
 *
 * A fila limita concorrência global e por módulo, mantém prioridade
 * determinística, cancela trabalho que ainda espera e entrega AbortSignal para
 * que uma tarefa já iniciada decida como interromper sua própria operação.
 * A estrutura de heap e o descarte preguiçoso preservam comportamento linear
 * amortizado sob carga, sem criar conexão, worker ou armazenamento remoto.
 */

export const INTERATIVO = 10;
export const NORMAL = 100;
export const FUNDO = 500;

export class Cancelado extends Error {
  constructor(motivo = 'cancelado') {
    super(motivo);
    this.name = 'Cancelado';
  }
}

export class FilaCheia extends Error {
  constructor(teto: number) {
    super(`fila de trabalho cheia (teto ${teto})`);
    this.name = 'FilaCheia';
  }
}

export interface OpcoesEscalonador {
  readonly limite?: number;
  readonly limitePorModulo?: number;
  readonly tetoFila?: number;
}

export interface ContextoTrabalho {
  readonly sinal?: AbortSignal;
}

export type FuncaoTrabalho<T> = (contexto: ContextoTrabalho) => T | PromiseLike<T>;

export interface OpcoesTrabalho {
  readonly prioridade?: number;
  readonly sinal?: AbortSignal;
}

export interface DependenciasMetricas {
  readonly contar?: (nome: string, etiquetas?: Readonly<Record<string, string>>) => void;
  readonly medir?: (nome: string, valor: number, etiquetas?: Readonly<Record<string, string>>) => void;
}

export interface DependenciasLog {
  readonly erro?: (mensagem: string, erro: unknown, contexto: Readonly<{ modulo: string; nome: string }>) => void;
}

export interface DependenciasEscalonador {
  readonly log?: DependenciasLog;
  readonly metricas?: DependenciasMetricas;
}

export interface EstadoEscalonador {
  readonly rodando: number;
  readonly naFila: number;
  readonly limite: number;
  readonly limitePorModulo: number;
  readonly tetoFila: number;
  readonly porModulo: Readonly<Record<string, number>>;
}

export interface EscalonadorModulo {
  fazer<T>(nome: string, fn: FuncaoTrabalho<T>, opcoes?: OpcoesTrabalho): Promise<T>;
  readonly INTERATIVO: number;
  readonly NORMAL: number;
  readonly FUNDO: number;
}

export interface Escalonador {
  enfileirar<T>(modulo: string, nome: string, fn: FuncaoTrabalho<T>, opcoes?: OpcoesTrabalho): Promise<T>;
  paraModulo(modulo: string): EscalonadorModulo;
  estado(): EstadoEscalonador;
}

interface NoHeap {
  readonly prioridade: number;
  readonly seq: number;
}

interface TrabalhoItem extends NoHeap {
  readonly modulo: string;
  readonly nome: string;
  readonly fn: FuncaoTrabalho<unknown>;
  readonly sinal?: AbortSignal;
  cancelada: boolean;
  despachada: boolean;
  readonly resolver: (valor: unknown) => void;
  readonly rejeitar: (motivo?: unknown) => void;
}

interface Candidato extends NoHeap {
  readonly modulo: string;
}

interface Heap<T extends NoHeap> {
  readonly itens: T[];
}

function antes(a: NoHeap, b: NoHeap): boolean {
  return a.prioridade < b.prioridade || (a.prioridade === b.prioridade && a.seq < b.seq);
}

function empurrar<T extends NoHeap>(heap: Heap<T>, valor: T): void {
  const itens = heap.itens;
  itens.push(valor);
  let indice = itens.length - 1;
  while (indice > 0) {
    const pai = (indice - 1) >> 1;
    if (!antes(itens[indice], itens[pai])) break;
    [itens[indice], itens[pai]] = [itens[pai], itens[indice]];
    indice = pai;
  }
}

function retirar<T extends NoHeap>(heap: Heap<T>): T | undefined {
  const itens = heap.itens;
  if (itens.length === 0) return undefined;
  const topo = itens[0];
  const ultimo = itens.pop();
  if (itens.length > 0 && ultimo !== undefined) {
    itens[0] = ultimo;
    let indice = 0;
    for (;;) {
      const esquerda = 2 * indice + 1;
      const direita = esquerda + 1;
      let menor = indice;
      if (esquerda < itens.length && antes(itens[esquerda], itens[menor])) menor = esquerda;
      if (direita < itens.length && antes(itens[direita], itens[menor])) menor = direita;
      if (menor === indice) break;
      [itens[indice], itens[menor]] = [itens[menor], itens[indice]];
      indice = menor;
    }
  }
  return topo;
}

export function criarEscalonador(
  opcoes: OpcoesEscalonador = {},
  deps: DependenciasEscalonador = {},
): Escalonador {
  const limite = opcoes.limite ?? 6;
  const limitePorModulo = opcoes.limitePorModulo ?? Math.max(1, Math.ceil(limite / 2));
  const tetoFila = opcoes.tetoFila ?? 500;

  const filaPorModulo = new Map<string, Heap<TrabalhoItem>>();
  const candidatos: Heap<Candidato> = { itens: [] };
  const rodandoPor = new Map<string, number>();
  let rodando = 0;
  let sequencia = 0;
  let naFila = 0;

  const emUso = (modulo: string): number => rodandoPor.get(modulo) ?? 0;

  function talvezElegivel(modulo: string): void {
    const heap = filaPorModulo.get(modulo);
    if (!heap || heap.itens.length === 0) return;
    if (emUso(modulo) >= limitePorModulo) return;
    const cabeca = heap.itens[0];
    empurrar(candidatos, { prioridade: cabeca.prioridade, seq: cabeca.seq, modulo });
  }

  function proximo(): TrabalhoItem | undefined {
    for (;;) {
      const candidato = retirar(candidatos);
      if (!candidato) return undefined;

      const heap = filaPorModulo.get(candidato.modulo);
      if (!heap || heap.itens.length === 0) continue;
      if (emUso(candidato.modulo) >= limitePorModulo) continue;
      if (heap.itens[0].seq !== candidato.seq) continue;

      const trabalho = retirar(heap);
      if (!trabalho) continue;
      if (heap.itens.length === 0) filaPorModulo.delete(candidato.modulo);
      naFila -= 1;
      if (trabalho.cancelada) {
        talvezElegivel(candidato.modulo);
        continue;
      }

      trabalho.despachada = true;
      talvezElegivel(candidato.modulo);
      return trabalho;
    }
  }

  function bombear(): void {
    while (rodando < limite) {
      const trabalho = proximo();
      if (!trabalho) return;
      executar(trabalho);
    }
  }

  function executar(trabalho: TrabalhoItem): void {
    if (trabalho.sinal?.aborted) {
      deps.metricas?.contar?.('trabalho_cancelado', { modulo: trabalho.modulo });
      trabalho.rejeitar(new Cancelado('cancelado antes de começar'));
      return;
    }

    rodando += 1;
    rodandoPor.set(trabalho.modulo, emUso(trabalho.modulo) + 1);
    const inicio = Date.now();

    const encerrar = (ok: boolean): void => {
      rodando -= 1;
      const restante = emUso(trabalho.modulo) - 1;
      if (restante <= 0) rodandoPor.delete(trabalho.modulo);
      else rodandoPor.set(trabalho.modulo, restante);
      deps.metricas?.medir?.('trabalho_ms', Date.now() - inicio, {
        modulo: trabalho.modulo,
        ok: String(ok),
      });
      talvezElegivel(trabalho.modulo);
      queueMicrotask(bombear);
    };

    let concluida = false;
    try {
      Promise.resolve(trabalho.fn({ sinal: trabalho.sinal })).then(
        (valor) => {
          if (concluida) return;
          concluida = true;
          encerrar(true);
          trabalho.resolver(valor);
        },
        (erro: unknown) => {
          if (concluida) return;
          concluida = true;
          encerrar(false);
          deps.log?.erro?.('trabalho falhou', erro, {
            modulo: trabalho.modulo,
            nome: trabalho.nome,
          });
          trabalho.rejeitar(erro);
        },
      );
    } catch (erro: unknown) {
      concluida = true;
      encerrar(false);
      trabalho.rejeitar(erro);
    }
  }

  function enfileirar<T>(
    modulo: string,
    nome: string,
    fn: FuncaoTrabalho<T>,
    opcoes: OpcoesTrabalho = {},
  ): Promise<T> {
    if (naFila >= tetoFila) {
      deps.metricas?.contar?.('trabalho_recusado', { modulo });
      return Promise.reject(new FilaCheia(tetoFila));
    }

    return new Promise<T>((resolver, rejeitar) => {
      const trabalho: TrabalhoItem = {
        modulo,
        nome,
        fn: (contexto) => Promise.resolve(fn(contexto)),
        prioridade: opcoes.prioridade ?? NORMAL,
        sinal: opcoes.sinal,
        seq: sequencia++,
        cancelada: false,
        despachada: false,
        resolver: (valor) => resolver(valor as T),
        rejeitar: (motivo) => rejeitar(motivo),
      };

      opcoes.sinal?.addEventListener('abort', () => {
        if (trabalho.cancelada || trabalho.despachada) return;
        trabalho.cancelada = true;
        naFila -= 1;
        deps.metricas?.contar?.('trabalho_cancelado', { modulo });
        rejeitar(new Cancelado('cancelado na fila'));
      }, { once: true });

      let heap = filaPorModulo.get(modulo);
      if (!heap) {
        heap = { itens: [] };
        filaPorModulo.set(modulo, heap);
      }
      empurrar(heap, trabalho);
      naFila += 1;
      talvezElegivel(modulo);
      deps.metricas?.contar?.('trabalho_enfileirado', { modulo });
      bombear();
    });
  }

  function paraModulo(modulo: string): EscalonadorModulo {
    return {
      fazer<T>(nome: string, fn: FuncaoTrabalho<T>, opcoes?: OpcoesTrabalho): Promise<T> {
        return enfileirar(modulo, nome, fn, opcoes);
      },
      INTERATIVO,
      NORMAL,
      FUNDO,
    };
  }

  function estado(): EstadoEscalonador {
    return {
      rodando,
      naFila,
      limite,
      limitePorModulo,
      tetoFila,
      porModulo: Object.fromEntries(rodandoPor),
    };
  }

  return { enfileirar, paraModulo, estado };
}
