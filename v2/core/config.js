/**
 * Configuração declarada — Regra 9, e Regra 10 com dentes.
 *
 * ── O que a medição da V1 mostrou, e como isso mudou o desenho ──────────────
 * A leitura fácil da Regra 9 ("não espalhar URLs, limites, caminhos, flags")
 * seria centralizar tudo num arquivo. Medindo a V1 antes: as 355 URLs literais
 * em `src/` são **conteúdo** — links de Steam, imagens, Discord —, não
 * configuração. O que existe de config são **7 constantes de timeout**, cada uma
 * no arquivo que a usa.
 *
 * E isso está *quase* certo: `TIMEOUT_MS = 8000` dentro do `supabase.js` tem
 * locality boa, e arrastá-la para um `config.js` gigante pioraria a leitura.
 * O que falta não é centralização — é que essas constantes **não são
 * declaradas, não são sobrescrevíveis e não são validadas**. Mudar o teto do
 * banco hoje exige editar código e publicar.
 *
 * Então este módulo não é um saco de constantes. É um **registro tipado com
 * precedência**: o módulo declara o que precisa, com padrão e faixa; o ambiente
 * sobrescreve; o Core valida na subida.
 *
 * ── A Regra 10 como mecânica ────────────────────────────────────────────────
 * "Segredos nunca entram no código." Uma declaração pode ser marcada
 * `segredo: true`, e aí:
 *
 *   - **não tem padrão** — segredo com valor de fallback é segredo no código;
 *   - **só vem do ambiente**;
 *   - **não aparece** em `paraDiagnostico()` nem em `JSON.stringify`;
 *   - **exige `revelar()`** para sair, e a chamada é explícita o bastante para
 *     saltar aos olhos em revisão.
 *
 * O objetivo é que o caminho acidental — logar o objeto de config inteiro,
 * mandar o diagnóstico para alguém, serializar num relatório — **não consiga**
 * vazar. Foi o operador quem pediu: *"não exponha nem copie valores de secrets
 * para código ou commits."*
 */

/** @typedef {'texto'|'numero'|'booleano'|'url'} Tipo */

/**
 * @typedef {object} Declaracao
 * @property {string} chave        namespaced por módulo, como o storage
 * @property {Tipo} tipo
 * @property {any} [padrao]        proibido quando `segredo`
 * @property {string} [env]        variável de ambiente que sobrescreve
 * @property {boolean} [segredo]
 * @property {boolean} [obrigatorio]
 * @property {number} [min]
 * @property {number} [max]
 * @property {string} [descricao]
 */

const MASCARA = '••••••••';

/** @param {unknown} v @param {Tipo} tipo */
function converter(v, tipo) {
  if (v === undefined || v === null) return undefined;
  switch (tipo) {
    case 'numero': {
      const n = typeof v === 'number' ? v : Number(String(v).trim());
      return Number.isFinite(n) ? n : undefined;
    }
    case 'booleano': {
      if (typeof v === 'boolean') return v;
      const s = String(v).trim().toLowerCase();
      /* Aceita as formas que aparecem de verdade em variável de ambiente. Um
       * `FLAG=0` que virasse `true` (porque "0" é string não-vazia) seria o
       * clássico — e silencioso. */
      if (['1', 'true', 'sim', 'yes', 'on'].includes(s)) return true;
      if (['0', 'false', 'nao', 'não', 'no', 'off', ''].includes(s)) return false;
      return undefined;
    }
    case 'url': {
      try { return new URL(String(v)).toString(); } catch { return undefined; }
    }
    default:
      return String(v);
  }
}

/**
 * @param {Declaracao[]} declaracoes
 * @param {Record<string, string|undefined>} [ambiente] normalmente `process.env`
 */
export function criarConfig(declaracoes, ambiente = {}) {
  /** @type {Map<string, Declaracao>} */
  const schema = new Map();
  /** @type {Map<string, any>} */
  const valores = new Map();
  /** @type {string[]} */
  const problemas = [];
  /** @type {Map<string, {presente: boolean, rejeitada: boolean}>} */
  const origens = new Map();

  for (const d of declaracoes) {
    if (schema.has(d.chave)) {
      problemas.push(`chave declarada duas vezes: "${d.chave}"`);
      continue;
    }
    if (d.segredo && d.padrao !== undefined) {
      /* Recusa alta: segredo com fallback é segredo escrito no código, que é
       * exatamente o que a Regra 10 proíbe. Aceitar "só o padrão de dev" é como
       * essas coisas entram no repositório. */
      problemas.push(`"${d.chave}" é segredo e tem padrão — segredo não pode ter valor no código`);
      continue;
    }
    schema.set(d.chave, d);

    const bruto = d.env ? ambiente[d.env] : undefined;
    const presente = bruto !== undefined;
    let valor = converter(bruto, d.tipo);
    /* Presente e recusada é um TERCEIRO estado, diferente de ausente. Tratá-lo
     * como ausente foi o que fazia a mensagem mandar o operador definir uma
     * variável que ele já tinha definido. */
    const rejeitada = presente && valor === undefined;

    if (rejeitada) {
      /* O valor bruto entra na mensagem porque é assim que se acha um erro de
       * digitação numa variável de ambiente — MENOS quando é segredo. `validacao()`
       * é lida no boot que falhou, ou seja: logada. Interpolar o valor aqui punha
       * a DSN com senha, ou a chave `sk-live-…`, em texto claro no caminho mais
       * acidental que existe — que é justamente o que o cabeçalho deste ficheiro
       * promete impedir. */
      problemas.push(d.segredo
        ? `${d.env} não é ${d.tipo} válido (chave "${d.chave}") — valor omitido por ser segredo`
        : `${d.env}="${bruto}" não é ${d.tipo} válido (chave "${d.chave}")`);
    }
    if (valor === undefined) valor = d.segredo ? undefined : d.padrao;

    /* `!rejeitada`: já se disse que o valor é inválido. Acrescentar "não está
     * definida" a seguir seria contradizer a linha anterior no mesmo relatório. */
    if (valor === undefined && (d.obrigatorio || d.segredo) && !rejeitada) {
      problemas.push(d.env
        ? `"${d.chave}" é obrigatória e ${d.env} não está definida`
        : `"${d.chave}" é obrigatória e não tem origem declarada`);
    }

    if (typeof valor === 'number') {
      /* Mesma regra da conversão: a faixa violada é o que interessa ao
       * diagnóstico; o valor do segredo não é, e sai. */
      if (d.min !== undefined && valor < d.min) {
        problemas.push(d.segredo
          ? `"${d.chave}" está abaixo do mínimo ${d.min} — valor omitido por ser segredo`
          : `"${d.chave}" = ${valor} < mínimo ${d.min}`);
      }
      if (d.max !== undefined && valor > d.max) {
        problemas.push(d.segredo
          ? `"${d.chave}" está acima do máximo ${d.max} — valor omitido por ser segredo`
          : `"${d.chave}" = ${valor} > máximo ${d.max}`);
      }
    }

    origens.set(d.chave, { presente, rejeitada });
    if (valor !== undefined) valores.set(d.chave, valor);
  }

  /** @param {string} chave */
  function ler(chave) {
    const d = schema.get(chave);
    if (!d) throw new Error(`config não declarada: "${chave}"`);
    if (d.segredo) {
      throw new Error(`"${chave}" é segredo — use revelar("${chave}"), e só onde precisa mesmo`);
    }
    return valores.get(chave);
  }

  /**
   * Única saída para um segredo. O nome é feio de propósito: `config.revelar()`
   * numa revisão de código chama atenção; `config.get()` não.
   * @param {string} chave
   */
  function revelar(chave) {
    const d = schema.get(chave);
    if (!d) throw new Error(`config não declarada: "${chave}"`);
    if (!d.segredo) throw new Error(`"${chave}" não é segredo — use ler()`);
    return valores.get(chave);
  }

  /**
   * O que pode ser mostrado, logado ou mandado para alguém. Segredo sai
   * mascarado, com a informação que interessa ao diagnóstico — se está definido
   * — sem a que não interessa a ninguém: o valor.
   */
  function paraDiagnostico() {
    return [...schema.values()].map((d) => {
      const o = origens.get(d.chave) ?? { presente: false, rejeitada: false };
      /* `origem` diz de onde veio o valor QUE ESTÁ EM VIGOR. Antes bastava a
       * variável existir para ela levar o crédito — mesmo quando o valor tinha
       * sido recusado e o padrão é que estava a valer. Quem lesse isso ia mexer
       * na variável e não veria nada mudar, porque ela não era a que mandava. */
      const veioDoAmbiente = o.presente && !o.rejeitada;
      return {
        chave: d.chave,
        tipo: d.tipo,
        origem: veioDoAmbiente ? `env:${d.env}` : 'padrão',
        /* Nomeia a variável recusada: sem isto, "padrão" não diz que houve uma
         * tentativa, e a tentativa é a informação. */
        ...(o.rejeitada ? { envRejeitada: d.env } : {}),
        valor: d.segredo
          ? (valores.has(d.chave) ? MASCARA : '(não definido)')
          : valores.get(d.chave),
        ...(d.descricao ? { descricao: d.descricao } : {})
      };
    });
  }

  /**
   * Recorta a config de um módulo — o mesmo princípio do storage no contexto.
   * @param {string} id
   */
  function paraModulo(id) {
    const prefixo = `${id}:`;
    return {
      /** @param {string} chave */
      ler: (chave) => {
        if (!chave.startsWith(prefixo)) {
          throw new Error(`módulo "${id}" não pode ler config de outro: "${chave}"`);
        }
        return ler(chave);
      },
      /** @param {string} chave */
      revelar: (chave) => {
        if (!chave.startsWith(prefixo)) {
          throw new Error(`módulo "${id}" não pode revelar segredo de outro: "${chave}"`);
        }
        return revelar(chave);
      },
      chaves: () => [...schema.keys()].filter((k) => k.startsWith(prefixo))
    };
  }

  return {
    ler,
    revelar,
    paraDiagnostico,
    paraModulo,
    /** `ok:false` significa não subir: config errada é falha de boot, não surpresa em runtime. */
    validacao: () => ({ ok: problemas.length === 0, problemas: [...problemas] }),
    /* Sem `toJSON` que exponha valores: serializar a config inteira é o caminho
     * acidental mais provável para um segredo vazar. */
    toJSON: () => paraDiagnostico()
  };
}
