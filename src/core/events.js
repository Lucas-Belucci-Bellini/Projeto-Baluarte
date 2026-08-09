/**
 * Event Bus (pub/sub) — o sistema nervoso do Baluarte.
 *
 * Uso normal:
 *   bus.on('route:change', handler);
 *   bus.emit('route:change', { path: '/home' });
 *   bus.off('route:change', handler);
 *
 * Uso por curinga (issue #420, item 🟠 4) — para quem precisa VER TUDO sem
 * conhecer cada evento de antemão:
 *   bus.on('*', (payload, meta) => historico.registrar(meta.event, payload));
 *   bus.on('arsenal:*', (payload, meta) => jarvis.contexto.add(meta.event, payload));
 *
 * Por que curinga: histórico, telemetria, diagnóstico e o contexto do JARVIS são
 * ouvintes cujo trabalho é justamente não ter uma lista fixa. Sem curinga, cada
 * evento novo exige que alguém lembre de inscrever esses quatro — e a coisa que
 * ninguém lembra é exatamente a que faz o sistema parecer um só, em vez de
 * várias ferramentas que não conversam.
 *
 * O `meta` é o segundo argumento e traz `{ event }`, o nome real do evento. Sem
 * ele um ouvinte de `'*'` recebe payloads sem saber de onde vieram. Handlers
 * antigos, de um argumento só, ignoram o extra — a API não quebrou.
 */

/* Um evento não pode se chamar '*' nem terminar em ':*'; senão `emit('*')`
 * seria ambíguo (é um evento chamado "*" ou todo mundo?). Cobrado no emit. */
const RE_CURINGA_PREFIXO = /^(.+:)\*$/;

function createBus() {
  const listeners = new Map();          // evento exato → Set<handler>
  const prefixos = new Map();           // 'arsenal:'   → Set<handler>
  const globais = new Set();            // ouvintes de '*'

  /* Onde este padrão mora? Resolver aqui deixa on/off simétricos — o mesmo
   * padrão sempre cai no mesmo balde, então cancelar inscrição funciona pra
   * curinga do mesmo jeito que pra evento exato. */
  function balde(evento) {
    if (evento === '*') return { tipo: 'global', set: globais };
    const m = RE_CURINGA_PREFIXO.exec(evento);
    if (m) {
      const p = m[1];                                    // 'arsenal:'
      if (!prefixos.has(p)) prefixos.set(p, new Set());
      return { tipo: 'prefixo', set: prefixos.get(p), chave: p, mapa: prefixos };
    }
    if (!listeners.has(evento)) listeners.set(evento, new Set());
    return { tipo: 'exato', set: listeners.get(evento), chave: evento, mapa: listeners };
  }

  function on(event, handler) {
    balde(event).set.add(handler);
    return () => off(event, handler);   // devolve uma função para cancelar a inscrição
  }

  function once(event, handler) {
    const wrapped = (payload, meta) => {
      off(event, wrapped);
      handler(payload, meta);
    };
    return on(event, wrapped);
  }

  function off(event, handler) {
    const b = balde(event);
    b.set.delete(handler);
    /* Balde vazio sai do mapa pra que `listeners`/`prefixos` não virem um
     * cemitério de chaves — o `*` percorre esses mapas a cada emit. O global
     * é um Set fixo, não tem chave pra remover. */
    if (b.mapa && b.set.size === 0) b.mapa.delete(b.chave);
  }

  function emit(event, payload) {
    if (event === '*' || RE_CURINGA_PREFIXO.test(event)) {
      /* Emitir um curinga faria os ouvintes de '*' receberem um evento que
       * nunca aconteceu, com o nome de um padrão. Barrado alto: é bug de quem
       * chamou, e o silêncio aqui viraria dado sujo no histórico. */
      throw new Error(`[bus] "${event}" é um padrão de inscrição, não um evento. Não dá pra emitir.`);
    }

    const meta = { event };

    /* Iterar sobre CÓPIAS: um handler pode se desinscrever (ou inscrever outro)
     * durante o emit sem corromper o loop. Cada handler roda isolado — um erro
     * num deles não impede os demais, e um ouvinte global quebrado (telemetria,
     * digamos) não pode derrubar a navegação. */
    const alvos = [];

    const exatos = listeners.get(event);
    if (exatos) alvos.push(...exatos);

    if (prefixos.size) {
      for (const [prefixo, set] of prefixos) {
        if (event.startsWith(prefixo)) alvos.push(...set);
      }
    }

    if (globais.size) alvos.push(...globais);

    for (const handler of alvos) {
      try {
        handler(payload, meta);
      } catch (err) {
        console.error(`[bus] Erro no handler de "${event}":`, err);
      }
    }
  }

  function clear() {
    listeners.clear();
    prefixos.clear();
    globais.clear();
  }

  /** Quantos ouvintes um evento REAL acionaria hoje (exatos + curingas). */
  function contarOuvintes(event) {
    let n = listeners.has(event) ? listeners.get(event).size : 0;
    for (const [prefixo, set] of prefixos) {
      if (event.startsWith(prefixo)) n += set.size;
    }
    return n + globais.size;
  }

  return { on, once, off, emit, clear, contarOuvintes };
}

export const bus = createBus();
export { createBus };
