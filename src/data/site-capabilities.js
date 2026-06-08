/**
 * Mapa de capacidades do site — fonte única para o J.A.R.V.I.S.
 *
 * Deriva tudo da navegação real (`NAV_GROUPS`), então quando uma página nova
 * entra no menu o JARVIS passa a conhecê-la automaticamente (sem manutenção
 * manual, sem "quebrar"). Resolve o issue #175: o JARVIS lê cada função do
 * site para poder citá-la, abri-la e responder mais rápido.
 */

import { NAV_GROUPS } from '../layout/sidebar.js';

/* Descrições curtas para enriquecer as respostas (opcional por rota). */
const DESCRICOES = {
  '/home': 'Ponte de comando — visão geral do Baluarte.',
  '/perfil': 'Perfil do operador + Motor de Universos (trocar a skin do site).',
  '/projetos': 'Índice de tudo feito com o Claude Code.',
  '/cerebro': 'Segundo Cérebro — knowledge graph dos domínios e projetos.',
  '/jarvis': 'Este assistente (J.A.R.V.I.S.), com IA real, skills e memória.',
  '/codigo': 'Raio-X do Código — grafo 3D do próprio código do site.',
  '/ocr': 'Leitor OCR — extrai texto de imagens no navegador.',
  '/editor': 'Editor de código com realce de sintaxe.',
  '/terminal': 'Terminal/console de comandos do site.',
  '/json-studio': 'Formatar, validar e explorar JSON.',
  '/git-helper': 'Montar comandos de Git.',
  '/regex': 'Testar e construir expressões regulares.',
  '/calculadoras': 'Hub de calculadoras.',
  '/graficos': 'Gerar gráficos a partir de dados.',
  '/tabela-periodica': 'Tabela periódica interativa.',
  '/cripto': 'Laboratório de criptografia e cifras.',
  '/dolar': 'Radar do Câmbio — Dólar, Euro e Bitcoin com histórico.',
  '/economia': 'Indicadores e cotações econômicas.',
  '/biblioteca': 'Crônicas "Onde os Deuses Sangram" + Dossiê das Equipes.',
  '/elites': 'Equipes de elite (ALFA→ZULU).',
  '/dossie': 'Dossiê das forças do Baluarte.',
  '/arsenal': 'Arsenal tático curado.',
  '/arsenal-expandido': 'Banco de 671 armas reais por categoria.',
  '/enciclopedia-militar': 'Enciclopédia militar (ramos, doutrina, gastos).',
  '/musicas': 'Central de música (SoundCloud, loop ao clicar).',
  '/radio': 'Rádio de frequências.',
  '/jogos': 'Arcade de jogos educativos.',
  '/visao': 'Visão & câmera (rastreio facial/mãos).',
  '/mapa': 'Mapa mundial interativo.'
};

/* Sinônimos extras para o reconhecedor de navegação (além do rótulo/rota). */
const SINONIMOS = {
  '/editor': ['código', 'codigo', 'programar'],
  '/cripto': ['cifra', 'criptografia', 'aes', 'rsa'],
  '/dolar': ['câmbio', 'cambio', 'bitcoin', 'btc', 'euro', 'dólar', 'dolar'],
  '/arsenal-expandido': ['armas', 'arsenal expandido', 'fuzil', 'rifle', 'tanque'],
  '/enciclopedia-militar': ['militar', 'exército', 'exercito', 'doutrina'],
  '/biblioteca': ['crônicas', 'cronicas', 'arcos', 'história', 'historia'],
  '/codigo': ['raio-x', 'raio x', 'grafo do código', 'auto-análise'],
  '/cerebro': ['segundo cérebro', 'segundo cerebro', 'knowledge graph'],
  '/ocr': ['ler imagem', 'texto da imagem', 'reconhecer texto'],
  '/musicas': ['música', 'musica', 'tocar', 'soundcloud']
};

/** Lista plana de capacidades, derivada da navegação real. */
export const CAPABILITIES = NAV_GROUPS.flatMap((g) =>
  g.items.map((it) => ({
    path: it.path,
    label: it.label,
    group: g.label,
    desc: DESCRICOES[it.path] || ''
  }))
);

function norm(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/**
 * Texto compacto agrupado para injetar no contexto do JARVIS — assim ele
 * conhece TODAS as páginas/ferramentas e pode citar a rota exata.
 */
export function capabilitiesText() {
  const lines = ['## MAPA DO SITE (páginas que você pode abrir/usar — cite a rota exata)'];
  for (const g of NAV_GROUPS) {
    const items = g.items.map((it) => {
      const d = DESCRICOES[it.path];
      return `${it.label} (${it.path})${d ? ' — ' + d : ''}`;
    }).join('; ');
    lines.push(`**${g.label}:** ${items}.`);
  }
  lines.push('Para abrir uma página, inclua a rota exata na resposta (ex.: "/arsenal-expandido") ou oriente o operador a abri-la pelo menu.');
  return lines.join('\n');
}

/**
 * Resolve uma frase do operador para a melhor rota (qualquer página do site).
 * @returns {{path:string,label:string}|null}
 */
export function findCapability(query) {
  const q = norm(query);
  if (!q) return null;
  let best = null, bestScore = 0;
  for (const cap of CAPABILITIES) {
    let score = 0;
    const label = norm(cap.label);
    const slug = norm(cap.path.replace(/[/-]/g, ' '));
    if (label && q.includes(label)) score = Math.max(score, 6 + label.length / 20);
    if (slug && q.includes(slug)) score = Math.max(score, 5);
    /* palavras significativas do rótulo */
    for (const w of label.split(/\s+/)) {
      if (w.length >= 4 && q.includes(w)) score = Math.max(score, 3 + w.length / 20);
    }
    /* sinônimos curados */
    for (const syn of (SINONIMOS[cap.path] || [])) {
      if (q.includes(norm(syn))) score = Math.max(score, 5);
    }
    if (score > bestScore) { bestScore = score; best = cap; }
  }
  return bestScore >= 3 ? { path: best.path, label: best.label } : null;
}
