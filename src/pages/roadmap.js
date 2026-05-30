/**
 * Página /roadmap — Roadmap do Projeto Baluarte + Jarvis.
 */

import { h } from '../utils/helpers.js';

const NIVEIS_JARVIS = [
  {
    num: 1,
    label: 'Presença',
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
    label: 'Inteligência',
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
    label: 'Infraestrutura',
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
    label: 'Site Auto-alimentado',
    status: 'done',
    items: [
      'Backend expõe Git DB via API REST',
      'Dashboard vivo no site lê dados em tempo real',
      'Auto-atualização a cada 30s com MutationObserver',
      'Sessões, memória, eventos e commits visíveis no Baluarte'
    ]
  },
  {
    num: 5,
    label: 'Autonomia Total',
    status: 'next',
    items: [
      'Reconhecimento de gestos via câmera',
      'Integração câmera ↔ site ao vivo',
      'Modo agente: executa tarefas sem supervisão',
      'Auto-deploy de atualizações via Git'
    ]
  }
];

const ROADMAP_SITE = [
  {
    area: 'IA & Jarvis',
    icon: '◉',
    status: 'active',
    isNew: false,
    done: [
      'J.A.R.V.I.S. web (6 modos)',
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
    isNew: false,
    done: ['Editor de código', 'Terminal', 'JSON Studio', 'Git Helper', 'Lab de Regex'],
    next: ['Debugger integrado', 'Diff viewer']
  },
  {
    area: 'Ciência & Lógica',
    icon: '∑',
    status: 'stable',
    isNew: false,
    done: ['Calculadoras (5 abas)', 'Calc. Científica', 'Calc. Numérica', 'Tabela Verdade', 'Logic Sim', 'Portas Lógicas', 'Gráficos', 'Tabela Periódica'],
    next: ['Simulador de circuitos', 'Plotagem 3D']
  },
  {
    area: 'Segurança & Cripto',
    icon: '⚿',
    status: 'stable',
    isNew: false,
    done: ['Cripto Lab (8 algoritmos)', 'Esteganografia', 'CiberSeg', 'Código Morse'],
    next: ['Análise de tráfego', 'Scanner de portas web']
  },
  {
    area: 'Conhecimento',
    icon: '◫',
    status: 'growing',
    isNew: false,
    done: ['Biblioteca', 'Academia', 'Universo', 'Tabela Periódica', 'Robótica', 'Guia para Montar PC'],
    next: ['Wiki integrada', 'Cursos interativos']
  },
  {
    area: 'Mídia & Entretenimento',
    icon: '♪',
    status: 'stable',
    isNew: false,
    done: ['Rádio', 'Música', 'Vídeos', 'TV', 'Cinema', 'Memes', 'FFT', 'Media Hub', 'Arcade'],
    next: ['Player sincronizado', 'Recomendações por IA']
  },
  {
    area: 'Campo & Tático',
    icon: '◆',
    status: 'growing',
    isNew: false,
    done: ['Elites', 'Arsenal', 'Radar Tático', 'GeoPulse', 'Onde Estou?', 'Triangulação', 'Mapa Mundial (tráfego aéreo + radar chuva)'],
    next: ['Integração GPS em tempo real', 'Alertas de tempestade']
  },
  {
    area: 'Visão & Câmera',
    icon: '👁',
    status: 'active',
    isNew: true,
    done: ['Detecção de movimento (canvas diff)', 'Rastreamento de olhar (MediaPipe Face Mesh)'],
    next: ['Reconhecimento de gestos', 'Identificação de objetos']
  },
  {
    area: 'Seção Militar',
    icon: '⌖',
    status: 'active',
    isNew: true,
    done: [
      'Forças Armadas do Mundo — 30 países, efetivos e orçamento',
      'Orçamentos Militares SIPRI 2024 — tabela + gráfico interativo',
      'Rankings de Poder — GFP index, nuclear, aéreo, naval, terrestre'
    ],
    next: [
      'Arsenal Expandido — infantaria, artilharia, blindados, naval, aéreo',
      'Elites & Forças Especiais — SOF de todos os países',
      'Organização Militar — ranks e estrutura por país',
      'Tecnologia Militar — veículos, aviões, navios',
      'Táticas & Estratégias — do Sun Tzu ao drone warfare',
      'História Militar — da pré-história ao moderno',
      'Armas por País — catálogo interativo com filtros',
      'Guerras & Conflitos — linha do tempo histórica',
      'Batalhas Históricas — das guerras antigas às modernas'
    ]
  },
  {
    area: 'Infraestrutura',
    icon: '⚙',
    status: 'planned',
    isNew: false,
    done: ['Roteamento SPA (hash-based)', 'IndexedDB para memória', 'Sistema de temas'],
    next: ['Git como DB', 'Pipeline n8n', 'Auto-commit de dados', 'GitNexus integrado']
  }
];

const STATUS_META = {
  done:    { text: 'Concluído',   cls: 'done' },
  next:    { text: 'Em breve',    cls: 'next' },
  planned: { text: 'Planejado',   cls: 'planned' },
  active:  { text: 'Ativo',       cls: 'next' },
  stable:  { text: 'Estável',     cls: 'done' },
  growing: { text: 'Crescendo',   cls: 'next' }
};

const SITE_STATUS_BADGE = {
  active:  { text: 'Ativo',     cls: 'active' },
  stable:  { text: 'Estável',   cls: 'stable' },
  growing: { text: 'Crescendo', cls: 'growing' },
  planned: { text: 'Planejado', cls: 'planned' }
};

function jarvisCard(nivel) {
  const m = STATUS_META[nivel.status] || STATUS_META.planned;
  return h('div', { className: `jarvis-level jarvis-level--${nivel.status}` },
    h('div', { className: 'jarvis-level__num' }, `Nível ${nivel.num}`),
    h('div', { className: 'jarvis-level__title' }, nivel.label),
    h('span', { className: `jarvis-level__badge jarvis-level__badge--${m.cls}` },
      nivel.status === 'done' ? '✓ ' : nivel.status === 'next' ? '◎ ' : '◌ ',
      m.text
    ),
    h('ul', { className: 'jarvis-level__list' },
      ...nivel.items.map(i => h('li', null, i))
    )
  );
}

function siteCard(area) {
  const sb = SITE_STATUS_BADGE[area.status] || SITE_STATUS_BADGE.planned;
  const bodyClass = area.done.length === 0 ? 'site-card__body site-card__body--full' : 'site-card__body';
  return h('div', { className: `site-card${area.isNew ? ' site-card--new' : ''}` },
    h('div', { className: 'site-card__head' },
      h('span', { className: 'site-card__icon' }, area.icon),
      h('span', { className: 'site-card__name' }, area.area),
      h('span', { className: `site-card__status site-card__status--${sb.cls}` }, sb.text)
    ),
    h('div', { className: bodyClass },
      area.done.length > 0 && h('div', { className: 'site-card__col site-card__col--done' },
        h('div', { className: 'site-card__col-label' }, 'Concluído'),
        h('ul', null, ...area.done.map(i => h('li', null, i)))
      ),
      area.next.length > 0 && h('div', { className: 'site-card__col site-card__col--next' },
        h('div', { className: 'site-card__col-label' }, 'A seguir'),
        h('ul', null, ...area.next.map(i => h('li', null, i)))
      )
    )
  );
}

export function roadmapPage() {
  return h('div', { className: 'roadmap-page' },

    h('div', { className: 'roadmap-hero' },
      h('span', { className: 'roadmap-hero__glyph' }, '⬡'),
      h('h1', null, 'Roadmap'),
      h('p', null, 'Estado atual e próximos passos do Baluarte e do Jarvis.')
    ),

    h('section', { className: 'roadmap-section' },
      h('div', { className: 'roadmap-section__header' },
        h('div', { className: 'roadmap-section__icon' }, '◉'),
        h('div', null,
          h('h2', { className: 'roadmap-section__title' }, 'J.A.R.V.I.S. — Construção por Níveis'),
          h('p', { className: 'roadmap-section__sub' }, 'Cada nível adiciona uma camada de inteligência ao sistema.')
        )
      ),
      h('div', { className: 'roadmap-grid--jarvis' },
        ...NIVEIS_JARVIS.map(jarvisCard)
      )
    ),

    h('section', { className: 'roadmap-section' },
      h('div', { className: 'roadmap-section__header' },
        h('div', { className: 'roadmap-section__icon' }, '⬡'),
        h('div', null,
          h('h2', { className: 'roadmap-section__title' }, 'Site Baluarte — Áreas'),
          h('p', { className: 'roadmap-section__sub' }, 'O que cada área já tem e o que vem a seguir.')
        )
      ),
      h('div', { className: 'roadmap-grid--site' },
        ...ROADMAP_SITE.map(siteCard)
      )
    ),

    h('section', { className: 'roadmap-section' },
      h('div', { className: 'roadmap-section__header' },
        h('div', { className: 'roadmap-section__icon' }, '◈'),
        h('div', null,
          h('h2', { className: 'roadmap-section__title' }, 'Visão Final'),
          h('p', { className: 'roadmap-section__sub' }, 'O Baluarte como sistema autônomo integrado.')
        )
      ),
      h('div', { className: 'roadmap-vision' },
        h('div', { className: 'roadmap-vision__step' },
          h('div', { className: 'roadmap-vision__icon' }, '📷'),
          h('p', null, 'Câmera detecta sua presença')
        ),
        h('span', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('div', { className: 'roadmap-vision__icon' }, '◉'),
          h('p', null, 'Jarvis reconhece você e acorda')
        ),
        h('span', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('div', { className: 'roadmap-vision__icon' }, '🧠'),
          h('p', null, 'LLM processa seu comando')
        ),
        h('span', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('div', { className: 'roadmap-vision__icon' }, '⬡'),
          h('p', null, 'Baluarte executa e registra no Git')
        ),
        h('span', { className: 'roadmap-vision__arrow' }, '→'),
        h('div', { className: 'roadmap-vision__step' },
          h('div', { className: 'roadmap-vision__icon' }, '🔄'),
          h('p', null, 'Site se auto-atualiza com o histórico')
        )
      )
    )
  );
}
