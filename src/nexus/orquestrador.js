/**
 * Orquestrador do Nexus — compõe os módulos de domínio num sistema só.
 *
 * Recebe os manifestos (`baluarte.module.js` de cada domínio) e devolve o que
 * o app precisa pra montar: a tabela de rotas, os destaques agregados da home
 * e a ordem de inicialização. Não toca no DOM e não importa domínio nenhum —
 * é função pura sobre os manifestos, então dá pra testar sem navegador.
 *
 * As recusas são o ponto. Um módulo torto tem que falhar AQUI, com mensagem
 * que diz de quem é a culpa, e não meia tela depois:
 *
 *  - contrato de major diferente → o módulo fala outra língua;
 *  - dois domínios reivindicando a mesma rota → um ia sobrescrever o outro
 *    em silêncio, e qual vencia dependeria da ordem de carregamento;
 *  - dependência ausente → o domínio subiria e quebraria no primeiro uso;
 *  - ciclo de dependência → não existe ordem de inicialização possível;
 *  - destaque apontando pra rota de outro domínio → porta dos fundos pro
 *    acoplamento que o contrato proíbe.
 *
 * Contrato: docs/NEXUS-CONTRATO.md · Decisões: docs/NEXUS-DECISOES.md
 */

/** Versão do contrato que este orquestrador fala. Recusa major diferente. */
export const CONTRATO = '1.1.0';

const major = (v) => Number(String(v ?? '').split('.')[0]);

/**
 * Compõe os manifestos.
 *
 * @param {Array<object>} manifestos módulos de domínio já importados
 * @param {{nativo?: boolean}} [opcoes] `nativo` = rodando no app desktop (#238)
 * @returns {{rotas: Array, destaques: Array, ordem: string[], erros: string[]}}
 */
export function compor(manifestos, opcoes = {}) {
  const nativo = !!opcoes.nativo;
  const erros = [];
  const modulos = (manifestos ?? []).filter(Boolean);

  const porNome = new Map();
  for (const m of modulos) {
    const nome = `baluarte-${m?.nome}`;
    if (!m?.nome) { erros.push('módulo sem nome no manifesto'); continue; }
    if (porNome.has(nome)) { erros.push(`domínio duplicado na composição: ${nome}`); continue; }
    if (major(m.contrato) !== major(CONTRATO)) {
      erros.push(`${nome}: contrato "${m.contrato}" incompatível com ${CONTRATO}`);
      continue;
    }
    porNome.set(nome, m);
  }

  /* Dependências: existem no conjunto composto e não formam ciclo. Um domínio
   * pode depender de quem não está na composição — aí ele simplesmente não
   * entra, em vez de subir pela metade. */
  for (const [nome, m] of porNome) {
    for (const dep of m.precisa ?? []) {
      if (!porNome.has(dep)) erros.push(`${nome} precisa de ${dep}, que não está na composição`);
    }
  }

  const ordem = [];
  const estado = new Map();   // nome -> 'visitando' | 'pronto'
  const visitar = (nome, caminho) => {
    if (estado.get(nome) === 'pronto') return;
    if (estado.get(nome) === 'visitando') {
      erros.push(`ciclo de dependência: ${[...caminho, nome].join(' → ')}`);
      return;
    }
    estado.set(nome, 'visitando');
    for (const dep of porNome.get(nome)?.precisa ?? []) {
      if (porNome.has(dep)) visitar(dep, [...caminho, nome]);
    }
    estado.set(nome, 'pronto');
    ordem.push(nome);           // dependência antes de quem depende
  };
  for (const nome of porNome.keys()) visitar(nome, []);

  /* Rotas: uma rota tem um dono só. Colisão silenciosa seria decidida pela
   * ordem de carregamento — o pior tipo de bug pra reproduzir. */
  const rotas = [];
  const donoDaRota = new Map();
  for (const nome of ordem) {
    const m = porNome.get(nome);
    for (const r of m.rotas ?? []) {
      if (!r?.path?.startsWith('/')) { erros.push(`${nome}: rota "${r?.path}" precisa começar com /`); continue; }
      if (typeof r.load !== 'function') { erros.push(`${nome} ${r.path}: load precisa ser () => import(...)`); continue; }
      if (donoDaRota.has(r.path)) {
        erros.push(`rota ${r.path} reivindicada por ${donoDaRota.get(r.path)} e ${nome}`);
        continue;
      }
      donoDaRota.set(r.path, nome);
      rotas.push({
        path: r.path,
        titulo: r.titulo ?? r.path,
        icone: r.icone ?? '',
        peso: r.peso === 'pesado' ? 'pesado' : 'leve',
        dominio: nome,
        load: r.load,
        /* Gate do mega-plano #238: na web o pesado vira teaser "abre no app" e
         * o chunk NÃO é baixado; no launcher carrega de verdade. */
        gateado: r.peso === 'pesado' && !nativo,
      });
    }
  }

  /* Destaques da home (contrato §1.2): quem tem o dado declara. A rota tem que
   * ser do próprio domínio — senão "destaque" vira acoplamento com outro nome. */
  const destaques = [];
  for (const nome of ordem) {
    const m = porNome.get(nome);
    const minhas = new Set([...(m.rotas ?? []), ...(m.planejado ?? [])].map((r) => r?.path));
    for (const d of m.destaques ?? []) {
      if (!d?.rotulo?.trim()) { erros.push(`${nome}: destaque sem rótulo`); continue; }
      if (!minhas.has(d.rota)) {
        erros.push(`${nome}: destaque "${d.rotulo}" aponta pra ${d.rota}, que não é dele`);
        continue;
      }
      destaques.push({ ...d, dominio: nome });
    }
  }

  return { rotas, destaques, ordem, erros };
}

/**
 * Sobe os módulos na ordem de dependência, entregando o contexto a cada um.
 *
 * Cada domínio recebe os destaques agregados — hoje só o shell usa, pra pintar
 * a home. Falha de um `iniciar()` não derruba a composição: o domínio fica
 * fora e o resto do sistema segue.
 */
export async function iniciarTodos(porNome, composicao, extras = {}) {
  const falhas = [];
  for (const nome of composicao.ordem) {
    const m = porNome.get(nome);
    if (typeof m?.iniciar !== 'function') continue;
    try {
      await m.iniciar({ destaques: composicao.destaques, rotas: composicao.rotas, ...extras });
    } catch (err) {
      falhas.push(`${nome}: ${err?.message ?? err}`);
    }
  }
  return falhas;
}
