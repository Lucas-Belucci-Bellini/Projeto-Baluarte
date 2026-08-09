/**
 * Wrapper para localStorage com fallback in-memory.
 * Serializa JSON automaticamente. Namespace 'baluarte:' para evitar conflitos.
 *
 * Duas camadas foram somadas na fase de hardening da 1.0.0 (issue #420):
 *
 * ── Versionamento de esquema (item 🔴 16) ────────────────────────────────────
 * Dado gravado no navegador do operador é para sempre: ele não roda migração de
 * banco, ele só abre o site de novo. Quando o formato de `jarvis.settings` muda,
 * o que estava salvo continua no formato antigo — e o código novo lê lixo. Uma
 * chave pode registrar seu esquema:
 *
 *   registrarEsquema('jarvis.settings', {
 *     versao: 2,
 *     classe: 'sensivel',
 *     migrar(dados, de) { return de < 2 ? { ...dados, modo: dados.modo || 'local' } : dados; }
 *   });
 *
 * A partir daí o valor é gravado num envelope `{ __bv, d }`, e todo `get()`
 * migra o que estiver velho e regrava. Chave sem esquema registrado se comporta
 * exatamente como antes — nada do que já está gravado quebra.
 *
 * ── ⚠️ Sobre os `console.warn` deste arquivo ────────────────────────────────
 * A chave **nunca** entra no primeiro argumento do console. `console.warn(fmt,
 * ...args)` trata o primeiro argumento como *format string*: uma chave contendo
 * `%s` engoliria o `err` seguinte (escondendo o erro de verdade) e `%c` injeta
 * CSS no console — o vetor clássico de mensagem falsa convincente.
 *
 * Não é hipotético aqui: desde que o cache da Wikipédia passou pelo wrapper, a
 * chave é `wiki:sum:<lang>:<título>`, e o título vem de dado de página. O CodeQL
 * pegou isso no PR. Regra: **string estática primeiro, dado dinâmico como
 * argumento separado.**
 *
 * ── Classificação de dado (item 🟡 7) ────────────────────────────────────────
 * Cada esquema declara o que a chave guarda: `publico`, `local`, `sensivel` ou
 * `secreto`. E `secreto` é RECUSADO na gravação, alto. O frontend é público:
 * token de API salvo no localStorage não é "menos seguro", é publicado. A regra
 * do #420 é "nunca colocar segredo no frontend", e uma regra que ninguém cobra
 * é uma regra que vai ser quebrada num sábado à noite.
 */

const NAMESPACE = 'baluarte:';
const memory = new Map();

function isStorageAvailable() {
  try {
    const testKey = '__baluarte_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/* Em modo privado / cookies bloqueados, o localStorage lança ao escrever — aí
 * caímos num Map em memória, então o app nunca quebra (mas não persiste entre
 * sessões). `storage.hasLocalStorage` diz qual está em uso. */
const HAS_LS = typeof window !== 'undefined' && isStorageAvailable();

function key(k) {
  return `${NAMESPACE}${k}`;
}

/* ==============================================================
 *  Esquemas: versão + classificação por chave
 * ============================================================== */

/** Classes de dado, da mais aberta para a mais fechada. */
export const CLASSES = Object.freeze(['publico', 'local', 'sensivel', 'secreto']);

/* chave → { versao, migrar, classe } */
const esquemas = new Map();

/* Marca do envelope. `__bv` = baluarte version. Nome feio de propósito: precisa
 * ser algo que nenhum dado de verdade teria por acidente, porque é isso que
 * distingue "valor versionado" de "valor legado gravado antes do envelope". */
const MARCA = '__bv';

function ehEnvelope(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
    && typeof v[MARCA] === 'number' && MARCA in v && 'd' in v;
}

/**
 * Registra o esquema de uma chave.
 *
 * @param {string} chave
 * @param {{versao:number, migrar?:(dados:any, de:number, para:number)=>any, classe?:string}} spec
 */
export function registrarEsquema(chave, spec) {
  const versao = spec && spec.versao;
  if (!Number.isInteger(versao) || versao < 1) {
    throw new Error(`[storage] Esquema de "${chave}": versao precisa ser inteiro >= 1.`);
  }
  const classe = (spec && spec.classe) || 'local';
  if (!CLASSES.includes(classe)) {
    throw new Error(`[storage] Esquema de "${chave}": classe "${classe}" inválida. Use: ${CLASSES.join(', ')}.`);
  }
  esquemas.set(chave, { versao, classe, migrar: (spec && spec.migrar) || null });
  return esquemas.get(chave);
}

/** Esquema registrado de uma chave (ou `null`). */
export function esquemaDe(chave) {
  return esquemas.get(chave) || null;
}

/* ==============================================================
 *  Leitura / escrita cruas (envelope à parte)
 * ============================================================== */

function lerCru(fullKey) {
  const raw = HAS_LS ? localStorage.getItem(fullKey) : memory.get(fullKey);
  if (raw == null) return undefined;
  return JSON.parse(raw);
}

function gravarCru(fullKey, valor) {
  const raw = JSON.stringify(valor);
  if (HAS_LS) localStorage.setItem(fullKey, raw);
  else memory.set(fullKey, raw);
}

/* ==============================================================
 *  API
 * ============================================================== */

export function get(k, fallback = null) {
  const fullKey = key(k);
  try {
    const bruto = lerCru(fullKey);
    if (bruto === undefined) return fallback;

    const esq = esquemas.get(k);
    if (!esq) {
      /* Sem esquema: comportamento histórico. Se por acaso houver um envelope
       * (a chave TINHA esquema numa versão anterior do Baluarte e não tem mais),
       * devolve o conteúdo, não a caixa. */
      return ehEnvelope(bruto) ? bruto.d : bruto;
    }

    const de = ehEnvelope(bruto) ? bruto[MARCA] : 0;   // legado = versão 0
    const dados = ehEnvelope(bruto) ? bruto.d : bruto;

    if (de === esq.versao) return dados;

    if (de > esq.versao) {
      /* Dado de um Baluarte MAIS NOVO. Acontece de verdade: o operador usa o
       * app atualizado e depois abre uma aba com o bundle velho em cache. Não
       * dá pra "desmigrar" — tentar adivinhar destrói o dado bom. Recua pro
       * fallback e deixa o valor gravado intacto. */
      console.warn(
        '[storage] chave em versão mais nova que este código — usando o fallback e preservando o dado:',
        { chave: k, gravada: de, entendo: esq.versao }
      );
      return fallback;
    }

    if (!esq.migrar) {
      console.warn(
        '[storage] esquema sem migrar() para dado antigo — usando o fallback:',
        { chave: k, gravada: de, atual: esq.versao }
      );
      return fallback;
    }

    const migrado = esq.migrar(dados, de, esq.versao);
    /* Regrava já migrado: a migração roda uma vez, não a cada leitura. Se a
     * gravação falhar (cota cheia), o valor migrado ainda é devolvido — a tela
     * funciona nesta sessão e tenta de novo na próxima. */
    try {
      gravarCru(fullKey, { [MARCA]: esq.versao, d: migrado });
    } catch (err) {
      console.warn('[storage] migrou mas não conseguiu regravar:', { chave: k, de, para: esq.versao }, err);
    }
    return migrado;
  } catch (err) {
    console.warn('[storage] falha ao ler:', { chave: k }, err);
    return fallback;
  }
}

export function set(k, value) {
  const fullKey = key(k);
  const esq = esquemas.get(k);

  /* Recusa ANTES do try: gravar segredo no frontend não é uma falha pra
   * registrar no console e seguir — é pra estourar na cara de quem escreveu. */
  if (esq && esq.classe === 'secreto') {
    throw new Error(
      `[storage] "${k}" é classificada como "secreto" e o frontend é público — ` +
      `qualquer um lê o localStorage. Guarde no backend e traga só um token de sessão de curta duração.`
    );
  }

  try {
    gravarCru(fullKey, esq ? { [MARCA]: esq.versao, d: value } : value);
    return true;
  } catch (err) {
    console.warn('[storage] falha ao gravar:', { chave: k }, err);
    return false;
  }
}

export function remove(k) {
  const fullKey = key(k);
  if (HAS_LS) {
    localStorage.removeItem(fullKey);
  } else {
    memory.delete(fullKey);
  }
}

export function clearAll() {
  if (HAS_LS) {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(NAMESPACE)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } else {
    memory.clear();
  }
}

/**
 * Em que versão a chave está GRAVADA (não a que o código entende).
 * `null` = não existe · `0` = legado, gravado antes do envelope.
 */
export function versaoGravada(k) {
  try {
    const bruto = lerCru(key(k));
    if (bruto === undefined) return null;
    return ehEnvelope(bruto) ? bruto[MARCA] : 0;
  } catch {
    return null;
  }
}

/** Fotografia dos esquemas — alimenta `/sistema/diagnostico`. */
export function estadoEsquemas() {
  return [...esquemas.entries()]
    .map(([chave, e]) => ({
      chave, classe: e.classe, versao: e.versao,
      gravada: versaoGravada(chave), temMigracao: !!e.migrar
    }))
    .sort((a, b) => a.chave.localeCompare(b.chave));
}

export const storage = {
  get, set, remove, clearAll,
  registrarEsquema, esquemaDe, versaoGravada, estadoEsquemas, CLASSES,
  hasLocalStorage: HAS_LS
};
