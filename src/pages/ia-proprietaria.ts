/**
 * Página /ia-proprietaria — IA Proprietária Mark 11.
 *
 * Sistema de Skills dinâmico: skills built-in e customizadas persistidas
 * localmente, com renderização segura de SKILL.md.
 */

import '../styles/editor.css';
import '../styles/fase21.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import {
  BUILTIN_SKILLS,
  SKILL_CATEGORIES,
  skillToMarkdown,
} from '../data/skills.js';
import type {
  Skill,
  SkillCategory,
  SkillCategoryId,
} from '../data/skills.js';

const STORAGE_KEY = 'mark11:custom-skills';
const STATE_KEY = 'mark11:state';
type SkillFilter = 'all' | SkillCategoryId;

interface SkillState {
  selected: string;
  filter: SkillFilter;
}

let state: SkillState = {
  selected: '',
  filter: 'all',
};
let listEl: HTMLDivElement | null = null;
let detailEl: HTMLDivElement | null = null;

function isSkillCategoryId(value: string): value is SkillCategoryId {
  return SKILL_CATEGORIES.some((category) => category.id === value);
}

function isSkill(value: unknown): value is Skill {
  if (value === null || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === 'string'
    && typeof candidate.name === 'string'
    && typeof candidate.category === 'string'
    && isSkillCategoryId(candidate.category)
    && typeof candidate.trigger === 'string'
    && (candidate.version === undefined || typeof candidate.version === 'string')
    && typeof candidate.body === 'string';
}

function loadCustom(): Skill[] {
  const stored: unknown = storage.get<unknown>(STORAGE_KEY, []);
  return Array.isArray(stored) ? stored.filter(isSkill) : [];
}

function saveCustom(skills: readonly Skill[]): void {
  storage.set(STORAGE_KEY, skills);
}

function allSkills(): Skill[] {
  return [...BUILTIN_SKILLS, ...loadCustom()];
}

function loadState(): SkillState {
  const stored: unknown = storage.get<unknown>(STATE_KEY, null);
  if (stored === null || typeof stored !== 'object') {
    return { selected: BUILTIN_SKILLS[0].id, filter: 'all' };
  }
  const candidate = stored as Record<string, unknown>;
  const selected = typeof candidate.selected === 'string'
    ? candidate.selected
    : BUILTIN_SKILLS[0].id;
  const filter = candidate.filter === 'all'
    || (typeof candidate.filter === 'string' && isSkillCategoryId(candidate.filter))
    ? candidate.filter
    : 'all';
  return { selected, filter };
}

function persistState(): void {
  storage.set(STATE_KEY, state);
}

function renderMarkdown(markdown: string): string {
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);
  html = html.split(/\n{2,}/).map((block) => {
    if (/^\s*<(h[2-4]|ul|blockquote)/.test(block.trim())) return block;
    if (!block.trim()) return '';
    return `<p>${block.replace(/\n/g, ' ')}</p>`;
  }).join('\n');
  return html;
}

function categoryFor(skill: Skill): SkillCategory | undefined {
  return SKILL_CATEGORIES.find((category) => category.id === skill.category);
}

function isCustomSkill(skill: Skill): boolean {
  return !BUILTIN_SKILLS.some((builtin) => builtin.id === skill.id);
}

function renderList(): void {
  if (!listEl) return;
  empty(listEl);
  const skills = allSkills().filter((skill) => (
    state.filter === 'all' || skill.category === state.filter
  ));

  skills.forEach((skill) => {
    const category = categoryFor(skill);
    listEl?.appendChild(
      h('div', {
        className: cx('skill-card', state.selected === skill.id && 'is-active'),
        style: category ? `--sk-color: ${category.color};` : '',
        onclick: () => {
          state.selected = skill.id;
          persistState();
          document.querySelectorAll<HTMLElement>('.skill-card').forEach((card) => {
            card.classList.toggle('is-active', card.dataset.id === skill.id);
          });
          renderDetail();
        },
        'data-id': skill.id,
      },
        h('div', { className: 'skill-card__head' },
          h('span', { className: 'skill-card__cat u-mono' }, category?.label ?? skill.category),
          isCustomSkill(skill) && h('span', {
            className: 'badge badge--magenta',
            style: { fontSize: '9px' },
          }, 'CUSTOM'),
        ),
        h('div', { className: 'skill-card__name' }, skill.name),
        h('div', { className: 'skill-card__trigger' }, skill.trigger),
      ),
    );
  });
}

function renderDetail(): void {
  if (!detailEl) return;
  empty(detailEl);
  const skill = allSkills().find((candidate) => candidate.id === state.selected);
  if (!skill) {
    detailEl.appendChild(h('div', { className: 'media-empty u-text-muted' }, 'Selecione uma skill'));
    return;
  }
  const category = categoryFor(skill);
  const custom = isCustomSkill(skill);
  detailEl.appendChild(
    h('div', {
      className: 'skill-detail__head',
      style: category ? `--sk-color: ${category.color};` : '',
    },
      h('div', null,
        h('div', { className: 'skill-detail__cat u-mono' },
          `${category?.label ?? skill.category} · v${skill.version ?? '1.0.0'}`,
        ),
        h('h2', { className: 'skill-detail__name' }, skill.name),
      ),
      h('div', { style: { display: 'flex', gap: '6px' } },
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            navigator.clipboard.writeText(skillToMarkdown(skill));
            toast('SKILL.md copiado', { type: 'success' });
          },
        }, '⎘ SKILL.md'),
        custom && h('button', {
          className: 'btn btn--ghost btn--sm u-text-danger',
          onclick: () => {
            if (!confirm(`Apagar a skill "${skill.name}"?`)) return;
            const remaining = loadCustom().filter((candidate) => candidate.id !== skill.id);
            saveCustom(remaining);
            state.selected = BUILTIN_SKILLS[0].id;
            persistState();
            renderList();
            renderDetail();
            toast('Skill removida', { type: 'info' });
          },
        }, '× apagar'),
      ),
    ),
  );
  detailEl.appendChild(
    h('div', { className: 'skill-detail__trigger' },
      h('span', { className: 'skill-detail__trigger-label' }, '⚡ TRIGGER'),
      h('span', null, skill.trigger),
    ),
  );
  detailEl.appendChild(
    h('div', { className: 'skill-detail__body md-preview', html: renderMarkdown(skill.body) }),
  );
}

function openSkillCreator(): void {
  const overlay = h('div', { className: 'skill-modal-overlay' });
  const nameInput = h('input', {
    className: 'input',
    type: 'text',
    placeholder: 'Nome da skill',
  });
  const categorySelect = h('select', { className: 'input' },
    ...SKILL_CATEGORIES.map((category) => h('option', {
      value: category.id,
    }, category.label)),
  );
  const triggerInput = h('input', {
    className: 'input',
    type: 'text',
    placeholder: 'Quando ativar esta skill?',
  });
  const bodyInput = h('textarea', {
    className: 'input',
    rows: 10,
    placeholder: '# Nome da Skill\n\n## Propósito\n...\n\n## Como funciona\n...',
  });

  function close(): void {
    overlay.remove();
  }

  overlay.appendChild(
    h('div', { className: 'skill-modal' },
      h('h2', { style: { margin: '0 0 12px' } }, '+ Nova Skill'),
      h('div', { className: 'skill-modal__form' },
        h('label', null, h('span', null, 'NOME'), nameInput),
        h('label', null, h('span', null, 'CATEGORIA'), categorySelect),
        h('label', null, h('span', null, 'TRIGGER'), triggerInput),
        h('label', null, h('span', null, 'CORPO (markdown)'), bodyInput),
      ),
      h('div', { className: 'skill-modal__actions' },
        h('button', { className: 'btn btn--ghost', onclick: close }, 'Cancelar'),
        h('button', {
          className: 'btn btn--primary',
          onclick: () => {
            if (!nameInput.value.trim()) {
              toast('Defina um nome', { type: 'warning' });
              return;
            }
            const custom = loadCustom();
            const category = isSkillCategoryId(categorySelect.value)
              ? categorySelect.value
              : 'core';
            const skill: Skill = {
              id: `custom_${Date.now().toString(36)}`,
              name: nameInput.value.trim(),
              category,
              trigger: triggerInput.value.trim() || 'Trigger não definido.',
              version: '1.0.0',
              body: bodyInput.value || `# ${nameInput.value}`,
            };
            custom.push(skill);
            saveCustom(custom);
            state.selected = skill.id;
            persistState();
            renderList();
            renderDetail();
            toast('Skill criada!', { type: 'success' });
            close();
          },
        }, '✓ Criar Skill'),
      ),
    ),
  );
  overlay.addEventListener('click', (event: MouseEvent) => {
    if (event.target === overlay) close();
  });
  document.body.appendChild(overlay);
  nameInput.focus();
}

export function iaProprietariaPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-mark11' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'IA PROPRIETÁRIA'),
      ),
      h('h1', { className: 'page-header__title' }, '◉ IA Proprietária — Mark 11'),
      h('p', { className: 'page-header__description' },
        'Sistema de ',
        h('span', { className: 'u-text-cyan' }, 'Skills dinâmico'),
        ' (SKILL.md). Cada skill é uma capacidade modular e componível. ',
        `${BUILTIN_SKILLS.length} skills built-in + suas customizadas. `,
        'Integra com ',
        h('a', { href: '#/jarvis', style: 'color: var(--color-cyan)' }, 'J.A.R.V.I.S.'),
        '.',
      ),
    ),
  );

  const filterChips = h('div', { className: 'mark11-filters' });
  const filters: readonly ({ id: SkillFilter; label: string })[] = [
    { id: 'all', label: 'Todas' },
    ...SKILL_CATEGORIES,
  ];
  filters.forEach((filter) => {
    filterChips.appendChild(
      h('button', {
        className: cx('chip', state.filter === filter.id && 'chip--active'),
        onclick: () => {
          state.filter = filter.id;
          persistState();
          document.querySelectorAll<HTMLElement>('.mark11-filters .chip').forEach((button) => {
            button.classList.toggle('chip--active', button.textContent === filter.label);
          });
          renderList();
        },
      }, filter.label),
    );
  });

  fullPage.appendChild(
    h('div', { className: 'mark11-toolbar' },
      filterChips,
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: openSkillCreator,
      }, '+ Nova Skill'),
    ),
  );

  listEl = h('div', { className: 'skill-list' });
  detailEl = h('div', { className: 'skill-detail' });
  fullPage.appendChild(h('div', { className: 'mark11-grid' }, listEl, detailEl));
  fullPage.appendChild(
    h('div', { className: 'mark11-doc' },
      h('div', { className: 'mark11-doc__title' }, '◆ Sobre o sistema Mark 11'),
      h('p', null,
        'A IA Proprietária Mark 11 é a camada de inteligência embarcada do Baluarte. ',
        'Diferente do J.A.R.V.I.S. (que conversa), o Mark 11 organiza ',
        h('strong', null, 'capacidades'),
        ' em skills modulares — cada uma um arquivo SKILL.md com trigger e instruções. ',
        'O conceito é inspirado nos sistemas de skills de agentes modernos: o modelo carrega ',
        'a skill relevante conforme o contexto, sem inflar o prompt base.',
      ),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px' } },
        'Roadmap: indexação de repositórios de referência, skills com código executável, ',
        'e integração bidirecional com o agente do J.A.R.V.I.S. (Fase 20).',
      ),
    ),
  );

  renderList();
  renderDetail();
  return fullPage;
}
