/**
 * Feature flags + níveis de estabilidade.
 *
 * Resolve dois itens da issue #420 de uma vez, porque são o mesmo problema:
 *
 *   item 1 — "o que significa 1.0.0?". A resposta do #420 não é "tudo pronto",
 *            é "tudo que está marcado como estável é previsível, testado e
 *            seguro". Isso exige que cada funcionalidade DIGA em que nível está.
 *   item 7 — poder colocar coisa nova no sistema sem liberar para todo mundo.
 *
 * Um nível sem consequência é enfeite, então há uma regra cobrada aqui:
 *
 *     funcionalidade `experimental` NÃO PODE nascer ligada por padrão.
 *
 * É o que impede a 1.0.0 de sair prometendo estabilidade e entregando um
 * experimento — o caminho pelo qual as versões Mark anteriores quebraram.
 *
 * Uso:
 *   declarar({ id: 'jarvisAgente', nivel: 'experimental', descricao: '…' });
 *   if (ativo('jarvisAgente')) { … }
 *   definir('jarvisAgente', true);      // o operador liga na mão
 *
 * Módulo puro: o ambiente (web vs app) entra por `configurarAmbiente()`, e a
 * persistência das escolhas do operador é injetada por `conectarPersistencia()`.
 * Assim ele roda em Node puro nos testes e no mesmo formato na web, no app e
 * num futuro servidor MCP.
 */

import { bus } from './events.js';

/** Níveis, do mais maduro para o menos. */
export const NIVEIS = Object.freeze(['estavel', 'beta', 'experimental']);

/** Onde a funcionalidade faz sentido (mega-plano #238: web leve, app completo). */
export const AMBIENTES = Object.freeze(['ambos', 'web', 'app']);

/* id → { id, nivel, padrao, descricao, ambiente } */
const registro = new Map();
/* id → boolean: escolha explícita do operador, vence o padrão. */
const escolhas = new Map();

/* Ambiente corrente. `app` = rodando dentro do Baluarte Launcher. Começa em
 * 'web' porque é o pior caso: uma flag app-only não deve vazar ligada pra web
 * só porque ninguém chamou `configurarAmbiente()`. */
let ambienteAtual = 'web';

/* Persistência injetada (ver `conectarPersistencia`). */
let persistir = null;

/* ==============================================================
 *  Declaração
 * ============================================================== */

/**
 * @param {{id:string, nivel?:string, padrao?:boolean, descricao?:string, ambiente?:string}} spec
 */
export function declarar(spec) {
  const id = spec && spec.id;
  if (typeof id !== 'string' || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(id)) {
    throw new Error(`[flags] id "${id}" inválido — use camelCase sem separadores (ex.: "jarvisAgente").`);
  }

  const nivel = spec.nivel || 'experimental';   // nasce experimental: promover é decisão, não esquecimento
  if (!NIVEIS.includes(nivel)) {
    throw new Error(`[flags] "${id}": nível "${nivel}" inválido. Use: ${NIVEIS.join(', ')}.`);
  }

  const ambiente = spec.ambiente || 'ambos';
  if (!AMBIENTES.includes(ambiente)) {
    throw new Error(`[flags] "${id}": ambiente "${ambiente}" inválido. Use: ${AMBIENTES.join(', ')}.`);
  }

  const padrao = spec.padrao === true;
  if (nivel === 'experimental' && padrao) {
    throw new Error(
      `[flags] "${id}" é experimental e não pode vir ligada por padrão. ` +
      `Se ela já é boa o bastante pra todo mundo, promova pra "beta" — e assuma o que isso significa na 1.0.0.`
    );
  }

  const anterior = registro.get(id);
  if (anterior && anterior.nivel !== nivel) {
    bus.emit('flags:promovida', { id, de: anterior.nivel, para: nivel });
  }

  const entrada = Object.freeze({
    id, nivel, padrao, ambiente,
    descricao: spec.descricao || ''
  });
  registro.set(id, entrada);
  return entrada;
}

/** Declara várias. */
export function declararTodas(specs) {
  return (specs || []).map(declarar);
}

/* ==============================================================
 *  Ambiente e persistência
 * ============================================================== */

/** 'web' ou 'app'. Chamado no boot a partir de `window.baluarte.native`. */
export function configurarAmbiente(ambiente) {
  if (ambiente !== 'web' && ambiente !== 'app') {
    throw new Error(`[flags] ambiente "${ambiente}" inválido — use 'web' ou 'app'.`);
  }
  ambienteAtual = ambiente;
  bus.emit('flags:ambiente', { ambiente });
  return ambienteAtual;
}

export function ambiente() {
  return ambienteAtual;
}

/**
 * Liga as escolhas do operador a um meio de persistência.
 *
 * Injetado em vez de importado pra manter o módulo puro: no navegador vem do
 * `storage`, nos testes vem de um objeto qualquer, e num servidor viria de um
 * arquivo — sem o motor precisar saber a diferença.
 *
 * @param {{ler:()=>object, gravar:(obj:object)=>void}} io
 */
export function conectarPersistencia(io) {
  persistir = io;
  const salvo = (io && io.ler && io.ler()) || {};
  for (const [id, valor] of Object.entries(salvo)) {
    /* Flag que não existe mais é descartada: o estado salvo é lembrança, não
     * autoridade (mesma regra do Permission Manager). */
    if (registro.has(id) && typeof valor === 'boolean') escolhas.set(id, valor);
  }
  return escolhas.size;
}

function salvar() {
  if (!persistir || !persistir.gravar) return;
  persistir.gravar(Object.fromEntries(escolhas));
}

/* ==============================================================
 *  Consulta
 * ============================================================== */

/**
 * A funcionalidade está ligada AGORA?
 *
 * Ordem: ambiente errado → sempre `false` (nem a escolha do operador liga uma
 * flag app-only na web; do contrário o gate do #238 teria um buraco). Depois a
 * escolha explícita. Depois o padrão. Flag não declarada → `false`.
 */
export function ativo(id) {
  const f = registro.get(id);
  if (!f) return false;
  if (f.ambiente !== 'ambos' && f.ambiente !== ambienteAtual) return false;
  if (escolhas.has(id)) return escolhas.get(id);
  return f.padrao;
}

/** Metadados de uma flag (ou `null`). */
export function descrever(id) {
  const f = registro.get(id);
  return f ? { ...f, ativo: ativo(id), escolhida: escolhas.has(id) } : null;
}

/** Todas as flags, ordenadas por id. Alimenta `/sistema/diagnostico`. */
export function listar() {
  return [...registro.keys()].sort().map(descrever);
}

/** Só o nível de estabilidade — a tabela que o README da 1.0.0 vai mostrar. */
export function porNivel() {
  return NIVEIS.reduce((acc, n) => {
    acc[n] = listar().filter((f) => f.nivel === n).map((f) => f.id);
    return acc;
  }, {});
}

/* ==============================================================
 *  Escolha do operador
 * ============================================================== */

/** Liga/desliga explicitamente e persiste. */
export function definir(id, ligada) {
  if (!registro.has(id)) throw new Error(`[flags] "${id}" não foi declarada.`);
  escolhas.set(id, ligada === true);
  salvar();
  bus.emit('flags:mudou', { id, ativo: ativo(id), origem: 'operador' });
  return ativo(id);
}

/** Volta ao padrão declarado (esquece a escolha do operador). */
export function resetar(id) {
  if (!registro.has(id)) throw new Error(`[flags] "${id}" não foi declarada.`);
  escolhas.delete(id);
  salvar();
  bus.emit('flags:mudou', { id, ativo: ativo(id), origem: 'reset' });
  return ativo(id);
}

/**
 * Aplica overrides vindos da URL: `?flags=jarvisAgente,-novoTerminal`
 * (prefixo `-` desliga). Para testar em produção sem mexer no estado salvo — por
 * isso NÃO persiste: fechou a aba, acabou.
 *
 * Recebe a query como string em vez de ler `location` sozinho, pra continuar
 * testável fora do navegador.
 *
 * @returns {string[]} ids aplicados
 */
export function aplicarDaURL(search) {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const bruto = params.get('flags');
  if (!bruto) return [];

  const aplicados = [];
  for (const parte of bruto.split(',')) {
    const item = parte.trim();
    if (!item) continue;
    const desliga = item.startsWith('-');
    const id = desliga ? item.slice(1) : item;
    if (!registro.has(id)) {
      console.warn(`[flags] "?flags=" pediu "${id}", que não existe. Ignorado.`);
      continue;
    }
    escolhas.set(id, !desliga);
    aplicados.push(id);
  }
  if (aplicados.length) bus.emit('flags:mudou', { ids: aplicados, origem: 'url' });
  return aplicados;
}

/** Zera tudo. Para os testes e para o "restaurar padrões" do app. */
export function limpar() {
  registro.clear();
  escolhas.clear();
  ambienteAtual = 'web';
  persistir = null;
}

export const flags = {
  NIVEIS, AMBIENTES,
  declarar, declararTodas, configurarAmbiente, ambiente, conectarPersistencia,
  ativo, descrever, listar, porNivel, definir, resetar, aplicarDaURL, limpar
};
