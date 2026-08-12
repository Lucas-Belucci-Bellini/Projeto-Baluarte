/**
 * Module Registry — quem vê o conjunto.
 *
 * Especificação do manifesto: `docs/v2/V2_MODULE_RULES.md`.
 * Validação individual: `manifest.js` (este arquivo não a repete).
 *
 * ── A razão de existir, em uma frase ────────────────────────────────────────
 * O `manifest.js` garante que **um** manifesto está bem formado. Nada nele
 * consegue ver que dois módulos reivindicam a mesma rota, que uma dependência
 * não existe ou que há um ciclo — isso é propriedade do CONJUNTO, e é aqui.
 *
 * ── O que faz este Registry valer alguma coisa ──────────────────────────────
 * A `V2_ARCHITECTURE.md` §3 avisa do modo de falha mais provável desta
 * arquitetura: o manifesto virar documentação. Se o Core continuar registrando
 * rota por conta própria enquanto o manifesto "descreve", a V2 terá **onze**
 * lugares declarando uma rota em vez dos dez da V1.
 *
 * Por isso as saídas deste arquivo — `rotas()`, `navegacao()`, `esquemas()`,
 * `permissoes()` — não são relatório: são **a entrada** do router, da sidebar,
 * do storage e do sistema de permissões. Quem quiser uma rota registra um
 * módulo; não existe outra porta.
 *
 * ── Isolamento: o §6 do plano aplicado ao carregamento ──────────────────────
 * "Um módulo quebrado não pode derrubar todo o Baluarte." Aqui isso significa
 * que manifesto inválido, dependência faltando ou ciclo **desativam aquele
 * módulo e os que dependem dele** — o resto sobe. `selar()` devolve o que
 * carregou e o que não, com motivo. Recusar o conjunto inteiro por causa de um
 * módulo seria transformar erro local em pane geral, que é exatamente o que a
 * arquitetura promete não fazer.
 */

import { validar, normalizar } from './manifest.js';

/**
 * @typedef {object} Recusa
 * @property {string} id
 * @property {string} motivo
 */

/**
 * @typedef {object} Selo
 * @property {boolean} ok       nenhum módulo recusado
 * @property {string[]} ativos  ids em ordem de carga (dependência antes)
 * @property {Recusa[]} recusados
 */

export function criarRegistry() {
  /** @typedef {ReturnType<typeof normalizar>} Normalizado */

  /**
   * Lê do mapa afirmando que a chave existe.
   *
   * Existe porque `ordem` é construída só com ids presentes em `bruto`, mas isso
   * é invariante MEU, não do tipo — e o verificador estava certo em cobrar. Em
   * vez de silenciar com cast, a violação vira erro alto: se um dia alguém
   * mexer na ordem e quebrar a premissa, o Baluarte diz onde, em vez de acessar
   * `undefined.routes` três frames adiante.
   *
   * @param {Map<string, Normalizado>} mapa
   * @param {string} id
   */
  function obrig(mapa, id) {
    const m = mapa.get(id);
    if (!m) throw new Error(`registry inconsistente: "${id}" está na ordem e não no mapa`);
    return m;
  }

  /** @type {Map<string, Normalizado>} manifestos normalizados, na ordem de registro */
  const bruto = new Map();
  /** @type {Map<string, Normalizado>} */
  let ativos = new Map();
  /** @type {Recusa[]} */
  let recusados = [];
  /** @type {string[]} */
  let ordem = [];
  let selado = false;

  /**
   * Registra um manifesto. Não valida o conjunto — isso é `selar()`.
   * @param {unknown} manifesto
   */
  function registrar(manifesto) {
    if (selado) throw new Error('registry já selado: registre antes de selar');

    const v = validar(manifesto);
    const m = /** @type {any} */ (manifesto);
    const id = m && typeof m === 'object' ? m.id : undefined;

    if (!v.ok) {
      /* Sem `id` legível não dá nem para nomear a recusa. Um contador evita que
       * dois manifestos anônimos se sobrescrevam no relatório. */
      const nome = typeof id === 'string' && id ? id : `<anônimo #${bruto.size + 1}>`;
      recusados.push({ id: nome, motivo: `manifesto inválido: ${v.erros.join('; ')}` });
      return false;
    }

    /* Colisão de id é do conjunto, mas é barata de pegar aqui e o erro fica
     * muito mais claro no momento do registro do que depois. */
    if (bruto.has(id)) {
      recusados.push({ id, motivo: `id duplicado: já existe um módulo "${id}"` });
      return false;
    }

    bruto.set(id, normalizar(m));
    return true;
  }

  /**
   * Valida o conjunto, resolve dependências e congela o registro.
   * @returns {Selo}
   */
  function selar() {
    if (selado) throw new Error('registry já selado');

    /* ── rota duplicada ENTRE módulos ────────────────────────────────────
     * O `manifest.js` só vê rota repetida dentro do mesmo módulo. Aqui,
     * dois módulos pedindo `/cripto` seria o segundo vencendo em silêncio —
     * ou pior, dependendo da ordem de registro. */
    const dono = new Map();
    /* Só as recusas DESTE passo. Varrer `recusados` inteiro seria um bug fino:
     * a recusa por id duplicado guarda o id do módulo que está corretamente
     * registrado, e apagá-lo mataria o primeiro — o válido — junto com o
     * segundo. Foi assim que apareceu, num teste. */
    const porRota = [];
    for (const [id, m] of bruto) {
      for (const r of m.routes) {
        if (dono.has(r.path)) {
          porRota.push({ id, motivo: `rota "${r.path}" já pertence ao módulo "${dono.get(r.path)}"` });
        } else {
          dono.set(r.path, id);
        }
      }
    }
    for (const r of porRota) { recusados.push(r); bruto.delete(r.id); }

    /* ── chave de storage duplicada ENTRE módulos ────────────────────────
     * O namespace já torna isso quase impossível, mas "quase" não é garantia:
     * dois módulos com ids diferentes ainda podem declarar a mesma chave se
     * alguém afrouxar o invariante um dia. Barato de checar, caro de descobrir
     * em produção. */
    const donoChave = new Map();
    const porChave = [];
    for (const [id, m] of bruto) {
      for (const s of m.storage) {
        if (donoChave.has(s.key)) {
          porChave.push({ id, motivo: `chave "${s.key}" já pertence a "${donoChave.get(s.key)}"` });
        } else {
          donoChave.set(s.key, id);
        }
      }
    }
    for (const r of porChave) { recusados.push(r); bruto.delete(r.id); }

    /* ── dependências: faltando, e em cascata ────────────────────────────
     * Se A depende de B e B não carregou, A também não pode: é o §6 do plano.
     * A desativação precisa ser TRANSITIVA — sem o laço de ponto fixo, um C que
     * dependa de A ficaria ativo apontando para um módulo morto. */
    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const [id, m] of bruto) {
        const faltando = m.dependencies.filter((d) => !bruto.has(d));
        if (faltando.length) {
          recusados.push({ id, motivo: `dependência ausente: ${faltando.join(', ')}` });
          bruto.delete(id);
          mudou = true;
        }
      }
    }

    /* ── ciclos, e a ordem de carga ──────────────────────────────────────
     * Ordenação topológica por DFS. O que sobrar sem visitar está em ciclo —
     * e ciclo não tem ordem de init possível, então todos os envolvidos caem. */
    const estado = new Map();   // id → 'visitando' | 'pronto'
    const emCiclo = new Set();
    ordem = [];

    /** @param {string} id @param {string[]} caminho */
    function visitar(id, caminho) {
      if (estado.get(id) === 'pronto') return;
      if (estado.get(id) === 'visitando') {
        /* Marca o ciclo inteiro, não só quem fechou: culpar o último a entrar
         * daria uma mensagem que manda consertar o módulo errado. */
        const inicio = caminho.indexOf(id);
        caminho.slice(inicio).forEach((x) => emCiclo.add(x));
        return;
      }
      estado.set(id, 'visitando');
      for (const d of obrig(bruto, id).dependencies) {
        if (bruto.has(d)) visitar(d, [...caminho, id]);
      }
      estado.set(id, 'pronto');
      if (!emCiclo.has(id)) ordem.push(id);
    }

    for (const id of bruto.keys()) visitar(id, []);

    for (const id of emCiclo) {
      recusados.push({ id, motivo: `ciclo de dependência envolvendo: ${[...emCiclo].join(' → ')}` });
      bruto.delete(id);
    }
    ordem = ordem.filter((id) => bruto.has(id));

    ativos = new Map(ordem.map((id) => [id, obrig(bruto, id)]));
    selado = true;
    return { ok: recusados.length === 0, ativos: [...ordem], recusados: [...recusados] };
  }

  /* ── as saídas: são ENTRADA do Core, não relatório ─────────────────────── */

  function exigirSelado() {
    if (!selado) throw new Error('chame selar() antes de ler o registro');
  }

  /** Para o router. Cada rota carrega o módulo dono — diagnóstico não adivinha. */
  function rotas() {
    exigirSelado();
    return ordem.flatMap((id) =>
      obrig(ativos, id).routes.map((r) => ({ path: r.path, view: r.view, modulo: id })));
  }

  /**
   * Para a sidebar E para o cabeçalho — a MESMA fonte. É o que elimina as 22
   * divergências de label que a V1 tem entre `sidebar.js` e `shell.js`.
   */
  function navegacao() {
    exigirSelado();
    return ordem
      .map((id) => {
        const m = obrig(ativos, id);
        return {
          modulo: id,
          nome: m.name,
          icone: m.icon,
          secao: m.nav.section,
          ordem: m.nav.order,
          /* A primeira rota é a porta de entrada do módulo. Módulo sem rota
           * (um serviço, por exemplo) simplesmente não aparece na navegação. */
          path: m.routes[0]?.path ?? null,
          estabilidade: m.stability
        };
      })
      .filter((e) => e.path !== null)
      .sort((a, b) => a.ordem - b.ordem || a.nome.localeCompare(b.nome));
  }

  /** Para a camada de storage: esquema com dono. */
  function esquemas() {
    exigirSelado();
    return ordem.flatMap((id) =>
      obrig(ativos, id).storage.map((s) => ({ ...s, modulo: id })));
  }

  /** Para o Permission System. Declarar não é receber — conceder é dele. */
  function permissoes() {
    exigirSelado();
    return new Map(ordem.map((id) => [id, [...obrig(ativos, id).permissions]]));
  }

  /** Quem emite e quem escuta cada evento — o catálogo do §7, derivado. */
  function eventos() {
    exigirSelado();
    /** @type {Map<string, {emitem: string[], escutam: string[]}>} */
    const mapa = new Map();
    /** @param {string} nome */
    const to = (nome) => {
      let e = mapa.get(nome);
      if (!e) { e = { emitem: [], escutam: [] }; mapa.set(nome, e); }
      return e;
    };
    for (const id of ordem) {
      const m = obrig(ativos, id);
      m.events.emits.forEach((/** @type {string} */ n) => to(n).emitem.push(id));
      m.events.consumes.forEach((/** @type {string} */ n) => to(n).escutam.push(id));
    }
    return mapa;
  }

  /**
   * Eventos que alguém escuta e ninguém emite — o "quais eventos estão órfãos"
   * que o §7 do plano pede. Órfão não é erro: um módulo pode escutar algo que só
   * existe quando outro está instalado. É informação de diagnóstico.
   */
  function eventosOrfaos() {
    return [...eventos()]
      .filter(([, v]) => v.emitem.length === 0)
      .map(([nome, v]) => ({ evento: nome, escutadoPor: v.escutam }));
  }

  /**
   * Referências FRACAS que não têm alvo — link para rota inexistente, api de
   * módulo ausente.
   *
   * Não é erro, e por isso não entra nas recusas do `selar()`: referência fraca
   * existe justamente para o módulo continuar funcionando sem o alvo. Mas é o
   * inverso do órfão de evento: ali alguém escuta o que ninguém emite; aqui
   * alguém **aponta** para o que não existe, e o sintoma é um botão que leva ao
   * `notFound` calado — o caso concreto das 14 rotas do hub militar.
   *
   * Diagnóstico, portanto, e não exceção: o boot registra, o `/diagnostico`
   * mostra, e quem removeu o módulo alvo descobre antes do operador clicar.
   */
  function referenciasOrfas() {
    exigirSelado();
    const caminhos = new Set(rotas().map((r) => r.path));
    const soltas = [];

    for (const id of ordem) {
      const m = obrig(ativos, id);
      for (const p of m.references.routes) {
        if (!caminhos.has(p)) soltas.push({ modulo: id, tipo: 'rota', alvo: p });
      }
      for (const outro of m.references.modules) {
        if (!ativos.has(outro)) soltas.push({ modulo: id, tipo: 'modulo', alvo: outro });
      }
    }
    return soltas;
  }

  /** @param {string} id */
  function modulo(id) { exigirSelado(); return ativos.get(id) ?? null; }
  function listar() { exigirSelado(); return [...ordem]; }

  return {
    registrar, selar,
    rotas, navegacao, esquemas, permissoes, eventos, eventosOrfaos, referenciasOrfas,
    modulo, listar,
    get selado() { return selado; }
  };
}
