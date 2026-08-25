/**
 * Escalonador de trabalho — concorrência local do Core V2.
 *
 * A fila limita concorrência global e por módulo, mantém prioridade
 * determinística, cancela trabalho que ainda espera e entrega AbortSignal para
 * que uma tarefa já iniciada decida como interromper sua própria operação.
 * A estrutura de heap e o descarte preguiçoso preservam comportamento linear
 * amortizado sob carga, sem criar conexão, worker ou armazenamento remoto.
 *
 * ── Health: `estado()` é instantâneo, e por isso esquece ────────────────────
 *
 * `estado()` diz o que está a correr AGORA. Depois de a fila drenar, um
 * escalonador que recusou 400 trabalhos por `FilaCheia` fica idêntico a um que
 * nunca recebeu nenhum — a recusa ia para `deps.metricas?.contar?.()`, que é
 * opcional, e sem métricas injetadas desaparecia inteira.
 *
 * `saude()` acrescenta o acumulado (concluídos, falhados, recusados,
 * cancelados), a duração das tarefas que iniciaram e um veredito. A duração
 * guarda apenas n/soma/mínimo/máximo; não é budget, alerta ou política. O
 * veredito usa a única condição bloqueante que este código já decide sozinho —
 * fila no teto, ou seja, a recusar trabalho neste instante. Saturação
 * (`rodando >= limite` com fila) é contrapressão normal e aparece como motivo,
 * não como veredito: um escalonador cheio a trabalhar está a fazer exatamente o
 * que lhe foi pedido.
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
  readonly relogio?: () => number;
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

export interface ContagemEscalonador {
  readonly enfileirados: number;
  readonly concluidos: number;
  readonly falhados: number;
  readonly recusados: number;
  readonly cancelados: number;
}

export interface LatenciaEscalonador {
  readonly n: number;
  readonly mediaMs: number;
  readonly minMs: number | null;
  readonly maxMs: number | null;
}

export interface SaudeEscalonador {
  readonly readiness: 'healthy' | 'unhealthy';
  readonly motivos: readonly string[];
  readonly estado: EstadoEscalonador;
  readonly contagem: ContagemEscalonador;
  readonly latencia: LatenciaEscalonador;
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
  saude(): SaudeEscalonador;
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
  const relogio = opcoes.relogio ?? (() => {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  });

  const filaPorModulo = new Map<string, Heap<TrabalhoItem>>();
  const candidatos: Heap<Candidato> = { itens: [] };
  const rodandoPor = new Map<string, number>();
  let rodando = 0;
  let sequencia = 0;
  let naFila = 0;

  /* Acumulados, independentes de `deps.metricas`: as métricas são opcionais e
   * sem elas o histórico do escalonador não existia. Isto é o que sobra. */
  let enfileirados = 0;
  let concluidos = 0;
  let falhados = 0;
  let recusados = 0;
  let cancelados = 0;
  let latencia: { n: number; soma: number; minMs: number; maxMs: number } | null = null;

  function agoraSeguro(): number | null {
    try {
      const valor = relogio();
      return Number.isFinite(valor) ? valor : null;
    } catch {
      return null;
    }
  }

  function registrarLatencia(inicio: number | null): void {
    if (inicio === null) return;
    const fim = agoraSeguro();
    if (fim === null) return;
    const duracao = Math.max(0, fim - inicio);
    if (!Number.isFinite(duracao)) return;
    if (!latencia) {
      latencia = { n: 1, soma: duracao, minMs: duracao, maxMs: duracao };
      return;
    }
    latencia.n += 1;
    latencia.soma += duracao;
    if (duracao < latencia.minMs) latencia.minMs = duracao;
    if (duracao > latencia.maxMs) latencia.maxMs = duracao;
  }

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
      cancelados += 1;
      deps.metricas?.contar?.('trabalho_cancelado', { modulo: trabalho.modulo });
      trabalho.rejeitar(new Cancelado('cancelado antes de começar'));
      return;
    }

    rodando += 1;
    rodandoPor.set(trabalho.modulo, emUso(trabalho.modulo) + 1);
    const inicio = agoraSeguro();
    const inicioParede = Date.now();

    const encerrar = (ok: boolean): void => {
      if (ok) concluidos += 1;
      else falhados += 1;
      rodando -= 1;
      const restante = emUso(trabalho.modulo) - 1;
      if (restante <= 0) rodandoPor.delete(trabalho.modulo);
      else rodandoPor.set(trabalho.modulo, restante);
      registrarLatencia(inicio);
      deps.metricas?.medir?.('trabalho_ms', Date.now() - inicioParede, {
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
      recusados += 1;
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
        cancelados += 1;
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
      enfileirados += 1;
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

  /**
   * O veredito, e o que ele deliberadamente não decide.
   *
   * `unhealthy` só na fila no teto — a única condição em que este escalonador
   * **recusa trabalho neste instante**, e a única que ele já decide sozinho
   * (é o `FilaCheia` que `enfileirar` levanta). Saturação e falhas são motivos.
   *
   * Falha de trabalho não vira veredito pela mesma razão que falha de handler
   * não vira no bus: a tarefa é de outro, e um escalonador que entrega a
   * rejeição a quem pediu está a funcionar. Escolher um limiar — "mais de N
   * falhas é unhealthy" — seria inventar política, que é exatamente o que
   * mantém o `retry` desta fase por fazer.
   *
   * Isto é observação. Não inicia, não para, não cancela e não concede nada.
   */
  function saude(): SaudeEscalonador {
    const motivos: string[] = [];
    const filaNoTeto = naFila >= tetoFila;

    if (filaNoTeto) motivos.push(`fila no teto (${naFila}/${tetoFila}): trabalho novo está a ser recusado`);
    else if (rodando >= limite && naFila > 0) motivos.push(`saturado: ${rodando}/${limite} a correr com ${naFila} à espera`);
    if (recusados) motivos.push(`${recusados} trabalho(s) recusado(s) por fila cheia`);
    if (falhados) motivos.push(`${falhados} trabalho(s) falhado(s)`);
    if (cancelados) motivos.push(`${cancelados} trabalho(s) cancelado(s)`);

    return {
      readiness: filaNoTeto ? 'unhealthy' : 'healthy',
      motivos,
      estado: estado(),
      contagem: { enfileirados, concluidos, falhados, recusados, cancelados },
      latencia: latencia
        ? {
            n: latencia.n,
            mediaMs: +(latencia.soma / latencia.n).toFixed(2),
            minMs: latencia.minMs,
            maxMs: latencia.maxMs,
          }
        : { n: 0, mediaMs: 0, minMs: null, maxMs: null },
    };
  }

  return { enfileirar, paraModulo, estado, saude };
}
