/**
 * Página /roadmap — Roadmap do Projeto Baluarte + Jarvis.
 * Mostra o estado atual, o que está sendo construído e o que vem a seguir.
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';

const NIVEIS_JARVIS = [
  {
    num: 1,
    label: 'Nível 1 — Presença',
    status: 'done',
    items: [
      'Detecção de movimento pela câmera',
      'Reconhecimento facial (identifica o usuário)',
      'Comando por voz com wake word "Jarvis"',
      'Pipeline integrado: movimento → rosto → voz'
    ]
  },
  {
    num: 2,
    label: 'Nível 2 — Inteligência',
    status: 'done',
    items: [
      'Integração com LLM (Claude API ou modelo local)',
      'Memória de contexto por sessão persistida em JSON',
      'Fatos permanentes entre sessões',
      'Auto-resumo via LLM quando contexto fica grande'
    ]
  },
  {
    num: 3,
    label: 'Nível 3 — Infraestrutura',
    status: 'done',
    items: [
      'Git como banco de dados append-only',
      'Cada sessão/evento vira um commit versionado',
      'n8n bridge: sessões → Sheets, alertas → email, memória → Drive',
      'Template de workflow n8n exportável'
    ]
  },
  {
    num: 4,
    label: 'Nível 4 — Site Auto-alimentado',
    status: 'done',
    items: [
      'Backend expõe Git DB via API REST',
      'Dashboard vivo no site lê dados em tempo real',
      'Auto-atualização a cada 30s com MutationObserver',
      'Sessões, memória, eventos e commits visíveis no Baluarte'
    ]
  }
];

const ROADMAP_SITE = [
  {
    area: 'IA & Jarvis',
    icon: '◉',
    status: 'active',
    done: [
      'J.A.R.V.I.S. web (6 modos: local, WebLLM, Claude, Ollama, Servidor, Agente)',
      'Mini-LLM do Zero', 'IA Proprietária',
      'Jarvis N1 — câmera, rosto, voz',
      'Jarvis N2 — LLM + memória persistida',
      'Jarvis N3 — Git DB + n8n automações',
      'Jarvis N4 — Dashboard vivo no site',
      'Sentinel — rastreamento oculto de acessos'
    ],
    next: ['Reconhecimento de gestos', 'Integração câmera ↔ site ao vivo', 'Jarvis N5 — autonomia total']
  },
  {
    area: 'Código & Dev',
    icon: '⌨',
    status: 'stable',
    done: ['Editor de código', 'Terminal', 'JSON Studio', 'Git Helper', 'Lab de Regex'],
    next: ['Debugger integrado', 'Diff viewer']
  },
  {
    area: 'Ciência & Lógica',
    icon: '∑',
    status: 'stable',
    done: ['Calculadoras (5 abas)', 'Calc. Científica', 'Calc. Numérica', 'Tabela Verdade', 'Logic Sim', 'Portas Lógicas', 'Gráficos', 'Tabela Periódica'],
    next: ['Simulador de circuitos', 'Plotagem 3D']
  },
  {
    area: 'Segurança & Cripto',
    icon: '⚿',
    status: 'stable',
    done: ['Cripto Lab (8 algoritmos)', 'Esteganografia', 'CiberSeg', 'Código Morse'],
    next: ['Análise de tráfego', 'Scanner de portas web']
  },
  {
    area: 'Conhecimento',
    icon: '◫',
    status: 'growing',
    done: ['Biblioteca', 'Academia', 'Universo', 'Tabela Periódica', 'Robótica', 'Guia para Montar PC'],
    next: ['Wiki integrada', 'Cursos interativos']
  },
  {
    area: 'Mídia & Entretenimento',
    icon: '♪',
    status: 'stable',
    done: ['Rádio', 'Música', 'Vídeos', 'TV', 'Cinema', 'Memes', 'FFT', 'Media Hub', 'Arcade'],
    next: ['Player sincronizado', 'Recomendações por IA']
  },
  {
    area: 'Campo & Tático',
    icon: '◆',
    status: 'growing',
    done: ['Elites', 'Arsenal', 'Radar Tático', 'GeoPulse', 'Onde Estou?', 'Triangulação'],
    next: ['Mapa interativo em tempo real', 'Integração GPS']
  },
  {
    area: 'Seção Militar — NOVA',
    icon: '⌖',
    status: 'active',
    done: [],
    next: [
      '🌍 Forças Armadas do Mundo — exércitos por país, efetivos, orçamento (% PIB)',
      '📜 História Militar — da pré-história ao moderno (por era)',
      '⚔ Arsenal Expandido — armas por categoria: infantaria, artilharia, blindados, naval, aéreo, mísseis',
      '🪖 Elites & Forças Especiais — SOF de todos os países',
      '🗺 Táticas & Estratégias — clássicas ao moderno, do Sun Tzu ao drone warfare',
      '🚀 Tecnologia Militar — veículos, aviões, navios, sistemas de combate',
      '🏅 Rankings de Poder — GFP index, gasto militar, efetivos, poder nuclear',
      '⚙ Organização Militar — ranks comparativos, estrutura de unidades por país',
      '🔫 Armas por País — catálogo interativo com filtros por tipo/época/nação',
      '📊 Orçamentos Militares — tabela SIPRI 2024 interativa',
      '🌐 Guerras & Conflitos — linha do tempo histórica interativa',
      '🔰 Batalhas Históricas — das guerras antigas às modernas'
    ]
  },
  {
    area: 'Infraestrutura',
    icon: '⚙',
    status: 'planned',
    done: ['Roteamento SPA (hash-based)', 'IndexedDB para memória', 'Sistema de temas'],
    next: ['Git como DB', 'Pipeline n8n', 'Auto-commit de dados', 'GitNexus integrado']
  }
];

const STATUS_LABEL = {
  done: { text: 'Concluído', cls: 'badge--success' },
  next: { text: 'Em andamento', cls: 'badge--warning' },
  planned: { text: 'Planejado', cls: 'badge--muted' },
  active: { text: 'Ativo', cls: 'badge--primary' },
  stable: { text: 'Estável', cls: 'badge--success' },
  growing: { text: 'Crescendo', cls: 'badge--warning' }
};

function badge(status) {
  const s = STATUS_LABEL[status] || { text: status, cls: 'badge--muted' };
  return h('span', { className: `badge ${s.cls}` }, s.text);
}

function jarvisCard(nivel) {
  const s = STATUS_LABEL[nivel.status];
  return h('div', { className: `roadmap-card roadmap-card--${nivel.status}` },
    h('div', { className: 'roadmap-card__head' },
      h('span', { className: 'roadmap-card__num' }, `N${nivel.num}`),
      h('strong', null, nivel.label),
      badge(nivel.status)
    ),
    h('ul', { className: 'roadmap-card__list' },
      ...nivel.items.map(i => h('li', null, i))
    )
  );
}

function siteCard(area) {
  return h('div', { className: 'roadmap-card' },
    h('div', { className: 'roadmap-card__head' },
      h('span', { className: 'roadmap-card__icon' }, area.icon),
      h('strong', null, area.area),
      badge(area.status)
    ),
    h('div', { className: 'roadmap-card__cols' },
      h('div', { className: 'roadmap-card__col' },
        h('div', { className: 'roadmap-card__col-label' }, '✓ Feito'),
        h('ul', null, ...area.done.map(i => h('li', null, i)))
      ),
      area.next.length && h('div', { className: 'roadmap-card__col' },
        h('div', { className: 'roadmap-card__col-label' }, '→ A seguir'),
        h('ul', null, ...area.next.map(i => h('li', null, i)))
      )
    )
  );
}

export function roadmapPage() {
  return h('div', { className: 'page-wrap roadmap-page' },

    h('div', { className: 'page-hero' },
      h('h1', null, '⬡ Roadmap'),
      h('p', { className: 'u-text-muted' },
        'Estado atual e próximos passos do Baluarte e do Jarvis.'
      )
    ),

    h('section', { className: 'roadmap-section' },
      h('h2', null, 'J.A.R.V.I.S. — Construção por Níveis'),
      h('p', { className: 'u-text-muted' },
        'O Jarvis é construído em 4 níveis progressivos. Cada nível adiciona uma camada de inteligência.'
      ),
      h('div', { className: 'roadmap-grid roadmap-grid--jarvis' },
        ...NIVEIS_JARVIS.map(jarvisCard)
      )
    ),

    h('section', { className: 'roadmap-section' },
      h('h2', null, 'Site Baluarte — Áreas'),
      h('p', { className: 'u-text-muted' },
        'O que cada área do site já tem e o que vem a seguir.'
      ),
      h('div', { className: 'roadmap-grid' },
        ...ROADMAP_SITE.map(siteCard)
      )
    ),

    h('section', { className: 'roadmap-section roadmap-section--vision' },
      h('h2', null, 'Visão Final'),
      h('div', { className: 'roadmap-vision' },
        h('div', { className: 'roadmap-vision__step' },
          h('span', { className: 'roadmap-vision__icon' }, '📷'),
          h('p', null, 'Câmera detecta sua presença')
        ),
        h('div', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('span', { className: 'roadmap-vision__icon' }, '◉'),
          h('p', null, 'Jarvis reconhece você e acorda')
        ),
        h('div', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('span', { className: 'roadmap-vision__icon' }, '🧠'),
          h('p', null, 'LLM processa seu comando')
        ),
        h('div', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('span', { className: 'roadmap-vision__icon' }, '⬡'),
          h('p', null, 'Baluarte executa e registra no Git')
        ),
        h('div', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('span', { className: 'roadmap-vision__icon' }, '🔄'),
          h('p', null, 'Site se auto-atualiza com o histórico')
        )
      )
    )
  );
}
