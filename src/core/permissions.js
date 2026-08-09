/**
 * Permission Manager — a fronteira entre quem PEDE e o que o Baluarte FAZ.
 *
 * Por que existe (issue #420, item 🔴 5): hoje o JARVIS chama uma tool e a tool
 * simplesmente executa. Enquanto o único chamador é o operador clicando na tela
 * isso passa; no momento em que um agente (JARVIS agente, MCP, Nexus) puder
 * escolher a tool sozinho, "executa e pronto" vira acesso irrestrito. A regra de
 * ouro do #420 é:
 *
 *     JARVIS → Permission → Tool → Result
 *
 * e nunca JARVIS → Tool.
 *
 * Três decisões que definem este módulo:
 *
 * 1. **Deny-by-default.** `check()` de algo não concedido é `false`. Não existe
 *    "se não configurou, libera".
 *
 * 2. **Permissão precisa ser DECLARADA antes de ser usada.** `require('arsenl.read')`
 *    (com o typo) não vira um deny silencioso que alguém "conserta" concedendo
 *    a string errada — lança `PermissionError` com `code: 'desconhecida'`. Num
 *    sistema em que a permissão é uma string solta, o typo é o modo de falha
 *    mais provável, e é o único que o deny-by-default sozinho não pega.
 *
 * 3. **Risco `restrito` não entra por curinga.** `conceder('terminal.*')` cobre
 *    `terminal.read` e `terminal.write`, mas nunca `terminal.execute`. Curinga é
 *    conveniência; conveniência não pode ser o caminho pelo qual um agente ganha
 *    execução de código. Restrito só com o nome inteiro escrito.
 *
 * O módulo é puro (não toca DOM nem storage) — dá pra testar em Node puro, e é
 * o mesmo motor que a web, o app e um futuro servidor MCP usam. Quem quiser
 * persistir as concessões chama `exportar()`/`importar()` e decide onde guardar.
 *
 * Uso:
 *   declarar({ id: 'arsenal.read', risco: 'leitura', descricao: '...' });
 *   conceder('arsenal.read', { origem: 'operador' });
 *   if (checar('arsenal.read')) { ... }
 *   exigir('arsenal.read');            // lança PermissionError se não tiver
 */

import { bus } from './events.js';

/* ==============================================================
 *  Níveis de risco
 * ============================================================== */

/**
 * O nível de risco não é decoração: ele decide o que curinga alcança e o que a
 * UI precisa perguntar. Três níveis bastam — mais que isso e ninguém classifica
 * direito.
 *
 *   leitura  — lê dado que o operador já podia ver na tela. Curinga alcança.
 *   escrita  — altera dado/estado persistente. Curinga alcança.
 *   restrito — executa código, alcança arquivo real, fala com a rede em nome do
 *              operador, gasta dinheiro, OU expõe dado classificado como
 *              `sensivel`/`secreto` (ver as classes em `storage.js`).
 *              Curinga NÃO alcança.
 *
 * A última cláusula liga os dois eixos e não é redundante: `jarvis.memoria.ler`
 * é leitura pela mecânica, mas o que ela devolve são as conversas do operador.
 * Sensibilidade do DADO promove o risco da AÇÃO — senão um `conceder('*')`
 * entregaria o histórico privado junto com a busca no Arsenal.
 */
export const RISCOS = Object.freeze(['leitura', 'escrita', 'restrito']);

const RISCO_PADRAO = 'restrito';   // classificar errado deve doer, não passar

/* ==============================================================
 *  Erro tipado
 * ============================================================== */

/**
 * Erro de permissão. Tipado porque quem chama precisa distinguir "o operador
 * não concedeu" (mostra um pedido) de "essa permissão nem existe" (é bug de
 * quem escreveu a tool, e a UI não deve pedir nada ao operador).
 */
export class PermissionError extends Error {
  /**
   * @param {string} permissao
   * @param {'negada'|'desconhecida'|'invalida'} code
   * @param {string} [detalhe]
   */
  constructor(permissao, code, detalhe) {
    super(detalhe || `Permissão negada: "${permissao}" (${code})`);
    this.name = 'PermissionError';
    this.permissao = permissao;
    this.code = code;
  }
}

/* ==============================================================
 *  Estado do gerente
 * ============================================================== */

/* Declaradas: id → { id, risco, descricao, dono }. */
const declaradas = new Map();
/* Concedidas: id exato → { origem, em }. Curinga NÃO mora aqui — ele é expandido
 * no momento da concessão, então `exportar()` sempre lista permissões reais e
 * nunca uma regra que muda de significado quando alguém declara uma permissão
 * nova depois. */
const concedidas = new Map();

/* Auditoria em memória: as últimas decisões, pra `/sistema/diagnostico` e pra
 * telemetria do JARVIS conseguirem responder "por que isso foi negado?" sem
 * precisar de log externo. Limitado — não é histórico, é o rabo do log. */
const LIMITE_AUDITORIA = 200;
const auditoria = [];

function registrarAuditoria(entrada) {
  auditoria.push({ ...entrada, em: Date.now() });
  if (auditoria.length > LIMITE_AUDITORIA) auditoria.shift();
}

/* ==============================================================
 *  Validação do formato
 * ============================================================== */

/* `dominio.acao` ou `dominio.sub.acao` — minúsculas, dígitos e hífen. O formato
 * é cobrado na declaração pra que o curinga `dominio.*` tenha um significado
 * único, e pra que a lista de permissões continue legível quando forem 200. */
const FORMATO = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

function validarId(id) {
  if (typeof id !== 'string' || !FORMATO.test(id)) {
    throw new PermissionError(
      String(id), 'invalida',
      `Permissão "${id}" fora do formato "dominio.acao" (minúsculas, dígitos, hífen).`
    );
  }
  return id;
}

/* ==============================================================
 *  Declaração
 * ============================================================== */

/**
 * Declara uma permissão que existe no sistema. Idempotente para declarações
 * idênticas — o mesmo módulo pode ser importado duas vezes sem explodir —, mas
 * redeclarar com risco DIFERENTE lança: seria uma forma silenciosa de rebaixar
 * `restrito` para `leitura` e escapar da regra do curinga.
 *
 * @param {{id:string, risco?:'leitura'|'escrita'|'restrito', descricao?:string, dono?:string}} spec
 * @returns {{id:string, risco:string, descricao:string, dono:string}}
 */
export function declarar(spec) {
  const id = validarId(spec && spec.id);
  const risco = spec.risco || RISCO_PADRAO;
  if (!RISCOS.includes(risco)) {
    throw new PermissionError(id, 'invalida', `Risco "${risco}" inválido. Use: ${RISCOS.join(', ')}.`);
  }

  const anterior = declaradas.get(id);
  if (anterior) {
    if (anterior.risco !== risco) {
      throw new PermissionError(
        id, 'invalida',
        `"${id}" já foi declarada como "${anterior.risco}" e agora como "${risco}". ` +
        `Mudar o risco de uma permissão viva muda o que o curinga alcança — declare uma permissão nova.`
      );
    }
    return anterior;
  }

  const entrada = Object.freeze({
    id,
    risco,
    descricao: spec.descricao || '',
    dono: spec.dono || ''
  });
  declaradas.set(id, entrada);
  bus.emit('permissions:declarada', entrada);
  return entrada;
}

/** Declara várias de uma vez. Devolve as entradas na ordem recebida. */
export function declararTodas(specs) {
  return (specs || []).map(declarar);
}

/** A permissão existe? */
export function existe(id) {
  return declaradas.has(id);
}

/** Metadados de uma permissão declarada (ou `null`). */
export function descrever(id) {
  return declaradas.get(id) || null;
}

/** Todas as permissões declaradas, ordenadas por id. */
export function listar() {
  return [...declaradas.values()].sort((a, b) => a.id.localeCompare(b.id));
}

/* ==============================================================
 *  Concessão
 * ============================================================== */

/**
 * Expande um pedido em ids concretos já declarados.
 *
 * `arsenal.*` vira todas as `arsenal.…` de risco leitura/escrita. `*` sozinho
 * vira tudo que não é restrito. Um id exato vira ele mesmo (inclusive restrito
 * — é justamente esse o único caminho até o restrito).
 */
function expandir(pedido) {
  if (typeof pedido !== 'string' || pedido === '') {
    throw new PermissionError(String(pedido), 'invalida', 'Pedido de permissão vazio.');
  }

  if (!pedido.includes('*')) {
    if (!declaradas.has(pedido)) {
      throw new PermissionError(pedido, 'desconhecida', `Permissão "${pedido}" não foi declarada.`);
    }
    return [pedido];
  }

  /* Curinga só na última posição: `arsenal.*`, `jarvis.tools.*` ou `*`. Nada de
   * `*.read` — casar por ação atravessa domínios e é exatamente o tipo de regra
   * cujo alcance ninguém consegue prever seis meses depois. */
  if (pedido !== '*' && !pedido.endsWith('.*')) {
    throw new PermissionError(
      pedido, 'invalida',
      'Curinga só no fim: use "dominio.*" ou "*".'
    );
  }
  const prefixo = pedido === '*' ? '' : pedido.slice(0, -1);   // 'arsenal.*' → 'arsenal.'

  return [...declaradas.values()]
    .filter((p) => p.risco !== 'restrito' && p.id.startsWith(prefixo))
    .map((p) => p.id);
}

/**
 * Concede permissão(ões). Aceita id exato, curinga (`arsenal.*`, `*`) ou array.
 * Curinga nunca alcança risco `restrito` — veja `expandir()`.
 *
 * @param {string|string[]} pedido
 * @param {{origem?:string}} [ctx] de onde veio a concessão ('operador', 'boot',
 *        'perfil', 'mcp'…). Vai pra auditoria: sem isso, seis meses depois
 *        ninguém sabe quem abriu a porta.
 * @returns {string[]} ids efetivamente concedidos agora
 */
export function conceder(pedido, ctx = {}) {
  const pedidos = Array.isArray(pedido) ? pedido : [pedido];
  const origem = ctx.origem || 'desconhecida';
  const novos = [];

  for (const p of pedidos) {
    for (const id of expandir(p)) {
      if (concedidas.has(id)) continue;
      concedidas.set(id, { origem, em: Date.now() });
      novos.push(id);
    }
  }

  if (novos.length) {
    registrarAuditoria({ acao: 'conceder', ids: novos, origem });
    bus.emit('permissions:concedida', { ids: novos, origem });
  }
  return novos;
}

/**
 * Revoga permissão(ões). Mesma gramática de `conceder`, com uma diferença
 * deliberada: revogar por curinga ALCANÇA restrito. Tirar acesso é sempre
 * seguro; dar não é. `revogar('*')` fecha tudo — é o botão de pânico.
 *
 * @returns {string[]} ids efetivamente revogados
 */
export function revogar(pedido, ctx = {}) {
  const pedidos = Array.isArray(pedido) ? pedido : [pedido];
  const origem = ctx.origem || 'desconhecida';
  const tirados = [];

  for (const p of pedidos) {
    if (p === '*') {
      tirados.push(...concedidas.keys());
      concedidas.clear();
      continue;
    }
    if (p.endsWith('.*')) {
      const prefixo = p.slice(0, -1);
      for (const id of [...concedidas.keys()]) {
        if (id.startsWith(prefixo)) { concedidas.delete(id); tirados.push(id); }
      }
      continue;
    }
    if (concedidas.delete(p)) tirados.push(p);
  }

  if (tirados.length) {
    registrarAuditoria({ acao: 'revogar', ids: tirados, origem });
    bus.emit('permissions:revogada', { ids: tirados, origem });
  }
  return tirados;
}

/* ==============================================================
 *  Consulta
 * ============================================================== */

/**
 * Tem a permissão? Nunca lança — é a forma de perguntar quando a resposta "não"
 * é um caminho normal (esconder um botão, por exemplo).
 *
 * Permissão não declarada devolve `false` E registra na auditoria: um `checar`
 * de string inexistente é quase sempre typo, e sem esse rastro ele vira um
 * botão que some sem explicação.
 */
export function checar(id) {
  if (!declaradas.has(id)) {
    registrarAuditoria({ acao: 'checar', id, resultado: 'desconhecida' });
    return false;
  }
  return concedidas.has(id);
}

/**
 * Exige a permissão ou lança `PermissionError`. É o que uma tool chama na
 * primeira linha: falhar alto é o ponto — uma tool que segue em frente sem a
 * permissão é pior que uma tool que quebra.
 *
 * @param {string} id
 * @param {{alvo?:string}} [ctx] o que estava sendo acessado, pra auditoria
 */
export function exigir(id, ctx = {}) {
  if (!declaradas.has(id)) {
    registrarAuditoria({ acao: 'exigir', id, resultado: 'desconhecida', alvo: ctx.alvo });
    bus.emit('permissions:negada', { id, code: 'desconhecida', alvo: ctx.alvo });
    throw new PermissionError(id, 'desconhecida', `Permissão "${id}" não foi declarada.`);
  }
  if (!concedidas.has(id)) {
    registrarAuditoria({ acao: 'exigir', id, resultado: 'negada', alvo: ctx.alvo });
    bus.emit('permissions:negada', { id, code: 'negada', alvo: ctx.alvo });
    throw new PermissionError(id, 'negada');
  }
  registrarAuditoria({ acao: 'exigir', id, resultado: 'ok', alvo: ctx.alvo });
  return true;
}

/**
 * Embrulha uma função para que ela só rode com as permissões exigidas.
 *
 * É assim que o Tool Registry do JARVIS (#420, item 6) registra as tools: a
 * checagem passa a ser propriedade do registro, não disciplina de quem escreve
 * a tool. Uma tool nova nasce protegida mesmo que o autor esqueça o `exigir`.
 *
 *   const buscar = protegido(['arsenal.read'], (q) => searchArsenal(q));
 */
export function protegido(exigidas, fn) {
  const lista = Array.isArray(exigidas) ? exigidas : [exigidas];
  return function protegida(...args) {
    for (const id of lista) exigir(id, { alvo: fn.name || 'anônima' });
    return fn.apply(this, args);
  };
}

/* ==============================================================
 *  Persistência (quem chama decide onde guardar)
 * ============================================================== */

/**
 * Estado concedido, serializável. Só ids exatos — nunca curinga —, então
 * reimportar amanhã concede exatamente o mesmo conjunto de hoje, mesmo que
 * permissões novas tenham sido declaradas nesse meio-tempo.
 */
export function exportar() {
  return {
    versao: 1,
    concedidas: [...concedidas.entries()].map(([id, meta]) => ({ id, ...meta }))
  };
}

/**
 * Recarrega concessões salvas. Ids que não existem mais (permissão removida
 * numa versão nova do Baluarte) são DESCARTADOS, não restaurados: o estado
 * gravado é uma lembrança, não uma autoridade.
 *
 * @returns {{aplicadas:string[], descartadas:string[]}}
 */
export function importar(estado) {
  const aplicadas = [];
  const descartadas = [];
  const lista = (estado && Array.isArray(estado.concedidas)) ? estado.concedidas : [];

  for (const item of lista) {
    const id = item && item.id;
    if (!declaradas.has(id)) { descartadas.push(id); continue; }
    concedidas.set(id, { origem: item.origem || 'importada', em: item.em || Date.now() });
    aplicadas.push(id);
  }

  registrarAuditoria({ acao: 'importar', ids: aplicadas, descartadas });
  if (aplicadas.length) bus.emit('permissions:concedida', { ids: aplicadas, origem: 'importada' });
  return { aplicadas, descartadas };
}

/* ==============================================================
 *  Introspecção
 * ============================================================== */

/** Fotografia do gerente — alimenta `/sistema/diagnostico` e o JARVIS. */
export function estado() {
  return {
    declaradas: listar().map((p) => ({ ...p, concedida: concedidas.has(p.id) })),
    concedidas: [...concedidas.keys()].sort(),
    porRisco: RISCOS.reduce((acc, r) => {
      acc[r] = listar().filter((p) => p.risco === r).length;
      return acc;
    }, {})
  };
}

/** Últimas decisões (mais recente por último). */
export function ultimasDecisoes(n = 50) {
  return auditoria.slice(-n);
}

/** Zera tudo. Existe para os testes e para o "sair da conta" do app. */
export function limpar() {
  declaradas.clear();
  concedidas.clear();
  auditoria.length = 0;
}

export const permissions = {
  RISCOS, PermissionError,
  declarar, declararTodas, existe, descrever, listar,
  conceder, revogar, checar, exigir, protegido,
  exportar, importar, estado, ultimasDecisoes, limpar
};
