/**
 * Event Bus (pub/sub) do Baluarte.
 *
 * Esta é a primeira implementação migrada para TypeScript. O wrapper
 * `events.js` mantém a compatibilidade com as páginas JavaScript enquanto a
 * migração acontece por ondas.
 */

export interface EventMeta {
  event: string;
}

export type EventHandler<Payload = unknown> = (
  payload: Payload,
  meta: EventMeta,
) => void;

export interface EventBus {
  on<Payload = unknown>(event: string, handler: EventHandler<Payload>): () => void;
  once<Payload = unknown>(event: string, handler: EventHandler<Payload>): () => void;
  off<Payload = unknown>(event: string, handler: EventHandler<Payload>): void;
  emit<Payload = unknown>(event: string, payload?: Payload): void;
  clear(): void;
  contarOuvintes(event: string): number;
}

type Handler = EventHandler<unknown>;
type HandlerMap = Map<string, Set<Handler>>;

type Bucket = {
  tipo: 'global' | 'prefixo' | 'exato';
  set: Set<Handler>;
  chave?: string;
  mapa?: HandlerMap;
};

/* Um evento não pode se chamar '*' nem terminar em ':*'. */
const RE_CURINGA_PREFIXO = /^(.+:)\*$/;

export function createBus(): EventBus {
  const listeners: HandlerMap = new Map();
  const prefixos: HandlerMap = new Map();
  const globais = new Set<Handler>();

  function balde(evento: string): Bucket {
    if (evento === '*') return { tipo: 'global', set: globais };

    const match = RE_CURINGA_PREFIXO.exec(evento);
    if (match) {
      const prefixo = match[1];
      let set = prefixos.get(prefixo);
      if (!set) {
        set = new Set<Handler>();
        prefixos.set(prefixo, set);
      }
      return { tipo: 'prefixo', set, chave: prefixo, mapa: prefixos };
    }

    let set = listeners.get(evento);
    if (!set) {
      set = new Set<Handler>();
      listeners.set(evento, set);
    }
    return { tipo: 'exato', set, chave: evento, mapa: listeners };
  }

  function on<Payload = unknown>(
    event: string,
    handler: EventHandler<Payload>,
  ): () => void {
    balde(event).set.add(handler as Handler);
    return () => off(event, handler);
  }

  function once<Payload = unknown>(
    event: string,
    handler: EventHandler<Payload>,
  ): () => void {
    const wrapped: Handler = (payload, meta) => {
      off(event, wrapped);
      handler(payload as Payload, meta);
    };
    return on(event, wrapped);
  }

  function off<Payload = unknown>(
    event: string,
    handler: EventHandler<Payload>,
  ): void {
    const bucket = balde(event);
    bucket.set.delete(handler as Handler);
    if (bucket.mapa && bucket.chave && bucket.set.size === 0) {
      bucket.mapa.delete(bucket.chave);
    }
  }

  function emit<Payload = unknown>(event: string, payload?: Payload): void {
    if (event === '*' || RE_CURINGA_PREFIXO.test(event)) {
      throw new Error(
        `[bus] "${event}" é um padrão de inscrição, não um evento. Não dá pra emitir.`,
      );
    }

    const meta: EventMeta = { event };
    const alvos: Handler[] = [];

    const exatos = listeners.get(event);
    if (exatos) alvos.push(...exatos);

    for (const [prefixo, set] of prefixos) {
      if (event.startsWith(prefixo)) alvos.push(...set);
    }

    if (globais.size) alvos.push(...globais);

    for (const handler of alvos) {
      try {
        handler(payload, meta);
      } catch (error) {
        console.error('[bus] erro no handler:', { evento: event }, error);
      }
    }
  }

  function clear(): void {
    listeners.clear();
    prefixos.clear();
    globais.clear();
  }

  function contarOuvintes(event: string): number {
    let total = listeners.get(event)?.size ?? 0;
    for (const [prefixo, set] of prefixos) {
      if (event.startsWith(prefixo)) total += set.size;
    }
    return total + globais.size;
  }

  return { on, once, off, emit, clear, contarOuvintes };
}

export const bus = createBus();
