/**
 * Health/Readiness do Core V2.
 *
 * Este módulo não inicia, para ou repara nada. Ele transforma o retrato já
 * produzido pelo Boot em uma decisão pequena e estável para supervisores,
 * diagnóstico e futura camada de transporte.
 *
 * A regra é simples: `liveness` responde "o Core está vivo?"; `readiness`
 * responde "há módulos no ar e nenhuma condição estrutural bloqueante?".
 * Uma falha de módulo isolado é registrada, mas não transforma todo o sistema
 * em morto — o Master Plan exige isolamento de falhas.
 */

/**
 * @typedef {{ fase: string, modulos?: unknown[], falhas?: unknown[], eventosOrfaos?: unknown[], referenciasOrfas?: unknown[] }} RetratoBoot
 */

/** @param {RetratoBoot} retrato */
export function avaliarSaude(retrato) {
  if (!retrato || typeof retrato !== 'object') {
    return {
      liveness: 'unhealthy',
      readiness: 'unhealthy',
      fase: 'desconhecida',
      motivos: ['retrato ausente'],
      /* `contagem` é declarada como obrigatória em `saude.d.ts`, e este caminho
       * omitia-a. Um consumidor TypeScript — `plataforma.ts` é um — escreve
       * `s.contagem.modulos` confiando no tipo e apanha um TypeError EXATAMENTE
       * quando o sistema já está doente, que é o pior momento para o
       * diagnóstico morrer. Zero é a contagem honesta: não se observou nada. */
      contagem: { modulos: 0, falhas: 0, eventosOrfaos: 0, referenciasOrfas: 0 }
    };
  }

  const motivos = [];
  /* `desconhecida` e não `undefined`: o caminho do retrato ausente logo acima já
   * usa essa palavra, e um retrato sem fase produzia a linha "Core não está no
   * ar: undefined" — que é a não-mensagem clássica — e ainda fazia o campo
   * `fase` desaparecer do JSON, porque `undefined` não serializa. */
  const fase = typeof retrato.fase === 'string' && retrato.fase ? retrato.fase : 'desconhecida';
  const vivos = Array.isArray(retrato.modulos) ? retrato.modulos : [];
  const falhas = Array.isArray(retrato.falhas) ? retrato.falhas : [];
  const eventosOrfaos = Array.isArray(retrato.eventosOrfaos) ? retrato.eventosOrfaos : [];
  const referenciasOrfas = Array.isArray(retrato.referenciasOrfas) ? retrato.referenciasOrfas : [];

  const liveness = fase === 'subindo' || fase === 'no-ar' || fase === 'descendo'
    ? 'healthy'
    : 'unhealthy';

  if (fase !== 'no-ar') motivos.push(`Core não está no ar: ${fase}`);
  if (vivos.length === 0 && fase === 'no-ar') motivos.push('nenhum módulo está no ar');
  if (falhas.length) motivos.push(`${falhas.length} falha(s) de módulo`);
  if (eventosOrfaos.length) motivos.push(`${eventosOrfaos.length} evento(s) órfão(s)`);
  if (referenciasOrfas.length) motivos.push(`${referenciasOrfas.length} referência(s) órfã(s)`);

  // Falhas de módulo e referências órfãs degradam o diagnóstico, mas não
  // escondem a disponibilidade dos módulos saudáveis. A única condição
  // estruturalmente bloqueante aqui é não estar no ar ou não ter nenhum módulo.
  const readiness = fase === 'no-ar' && vivos.length > 0 ? 'healthy' : 'unhealthy';

  return {
    liveness,
    readiness,
    fase,
    motivos,
    contagem: {
      modulos: vivos.length,
      falhas: falhas.length,
      eventosOrfaos: eventosOrfaos.length,
      referenciasOrfas: referenciasOrfas.length
    }
  };
}

/**
 * Cria um provedor sem acoplar a saúde ao objeto interno do Boot.
 * @param {{diagnostico: () => RetratoBoot}} boot
 */
export function criarMonitorSaude(boot) {
  if (!boot || typeof boot.diagnostico !== 'function') {
    throw new TypeError('boot.diagnostico é obrigatório');
  }

  let estado = 'idle';

  /**
   * O Supervisor é o dono da máquina operacional; Health apenas conserva o
   * estado publicado para que o retrato combine liveness/readiness com a fase
   * observada. O snapshot do Boot continua sendo consultado a cada chamada.
   * @param {string} novoEstado
   */
  function definirEstado(novoEstado) {
    estado = novoEstado;
  }

  /**
   * Uma sonda de saúde que LEVANTA é pior do que inútil: quem a chama pergunta
   * "está saudável?" para decidir o que fazer, e recebe uma exceção em vez de um
   * veredito — então o supervisor que devia reagir ao `unhealthy` morre junto
   * com o que ia diagnosticar. Pior ainda desde que o diagnóstico da Plataforma
   * agrega várias saúdes: uma sonda que estoura derruba o agregado inteiro.
   *
   * `avaliarSaude` já falha fechado para qualquer retrato inválido — `null`,
   * texto, número. O que faltava era o Boot LEVANTAR ao ser perguntado, que
   * escapava por cima dessa proteção em vez de passar por ela.
   */
  function verificar() {
    let retrato;
    try {
      retrato = boot.diagnostico();
    } catch (erro) {
      /* Distinguir de "o Boot não deu nada": um Boot que rebenta e um Boot que
       * devolve lixo são problemas diferentes, e quem lê o motivo precisa saber
       * qual dos dois foi. */
      return {
        liveness: 'unhealthy',
        readiness: 'unhealthy',
        fase: 'desconhecida',
        motivos: [`o diagnóstico do Boot levantou: ${erro instanceof Error ? erro.message : String(erro)}`],
        contagem: { modulos: 0, falhas: 0, eventosOrfaos: 0, referenciasOrfas: 0 }
      };
    }
    return avaliarSaude(retrato);
  }

  function retrato() {
    return { ...verificar(), estado };
  }

  return { verificar, retrato, definirEstado };
}
