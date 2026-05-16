/**
 * Página /ia-proprietaria — IA Proprietária Mark 11 (Fase 21).
 *
 * Sistema de Skills dinâmico (SKILL.md). Skills built-in + customizadas.
 * Cada skill é uma capacidade modular descrita em markdown.
 */

import { h, cx, empty, debounce } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { router } from '../core/router.js';
import { BUILTIN_SKILLS, SKILL_CATEGORIES, skillToMarkdown } from '../data/skills.js';

const STORAGE_KEY = 'mark11:custom-skills';

let state = null;
let listEl = null;
let detailEl = null;

function loadCustom() {
  return storage.get(STORAGE_KEY) || [];
}
function saveCustom(skills) {
  storage.set(STORAGE_KEY, skills);
}

function allSkills() {
  return [...BUILTIN_SKILLS, ...loadCustom()];
}

function loadState() {
  return storage.get('mark11:state') || { selected: BUILTIN_SKILLS[0].id, filter: 'all' };
}
function persistState() { storage.set('mark11:state', state); }

/* ===== Markdown render mínimo ===== */

function renderMarkdown(md) {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
  html = html.split(/\n{2,}/).map((block) => {
    if (/^\s*<(h[2-4]|ul|blockquote)/.test(block.trim())) return block;
    if (!block.trim()) return '';
    return `<p>${block.replace(/\n/g, ' ')}</p>`;
  }).join('\n');
  return html;
}

/* ===== Render lista ===== */

function renderList() {
  if (!listEl) return;
  empty(listEl);
  const skills = allSkills().filter((s) =>
    state.filter === 'all' || s.category === state.filter
  );

  skills.forEach((s) => {
    const cat = SKILL_CATEGORIES.find((c) => c.id === s.category);
    const isCustom = !BUILTIN_SKILLS.find((b) => b.id === s.id);
    listEl.appendChild(
      h('div', {
        className: cx('skill-card', state.selected === s.id && 'is-active'),
        style: cat ? `--sk-color: ${cat.color};` : '',
        onclick: () => {
          state.selected = s.id;
          persistState();
          document.querySelectorAll('.skill-card').forEach((c) =>
            c.classList.toggle('is-active', c.dataset.id === s.id)
          );
          renderDetail();
        },
        'data-id': s.id
      },
        h('div', { className: 'skill-card__head' },
          h('span', { className: 'skill-card__cat u-mono' }, cat?.label || s.category),
          isCustom && h('span', { className: 'badge badge--magenta', style: { fontSize: '9px' } }, 'CUSTOM')
        ),
        h('div', { className: 'skill-card__name' }, s.name),
        h('div', { className: 'skill-card__trigger' }, s.trigger)
      )
    );
  });
}

/* ===== Render detalhe ===== */

function renderDetail() {
  if (!detailEl) return;
  empty(detailEl);
  const skill = allSkills().find((s) => s.id === state.selected);
  if (!skill) {
    detailEl.appendChild(h('div', { className: 'media-empty u-text-muted' }, 'Selecione uma skill'));
    return;
  }
  const cat = SKILL_CATEGORIES.find((c) => c.id === skill.category);
  const isCustom = !BUILTIN_SKILLS.find((b) => b.id === skill.id);

  detailEl.appendChild(
    h('div', { className: 'skill-detail__head', style: cat ? `--sk-color: ${cat.color};` : '' },
      h('div', null,
        h('div', { className: 'skill-detail__cat u-mono' },
          (cat?.label || skill.category) + ' · v' + (skill.version || '1.0.0')),
        h('h2', { className: 'skill-detail__name' }, skill.name)
      ),
      h('div', { style: { display: 'flex', gap: '6px' } },
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            navigator.clipboard.writeText(skillToMarkdown(skill));
            toast('SKILL.md copiado', { type: 'success' });
          }
        }, '⎘ SKILL.md'),
        isCustom && h('button', {
          className: 'btn btn--ghost btn--sm u-text-danger',
          onclick: () => {
            if (!confirm(`Apagar a skill "${skill.name}"?`)) return;
            const custom = loadCustom().filter((s) => s.id !== skill.id);
            saveCustom(custom);
            state.selected = BUILTIN_SKILLS[0].id;
            persistState();
            renderList();
            renderDetail();
            toast('Skill removida', { type: 'info' });
          }
        }, '× apagar')
      )
    )
  );

  detailEl.appendChild(
    h('div', { className: 'skill-detail__trigger' },
      h('span', { className: 'skill-detail__trigger-label' }, '⚡ TRIGGER'),
      h('span', null, skill.trigger)
    )
  );

  detailEl.appendChild(
    h('div', { className: 'skill-detail__body md-preview', html: renderMarkdown(skill.body) })
  );
}

/* ===== Criar skill ===== */

function openSkillCreator() {
  const overlay = h('div', { className: 'skill-modal-overlay' });
  const nameInput = h('input', { className: 'input', type: 'text', placeholder: 'Nome da skill' });
  const catSel = h('select', { className: 'input' },
    ...SKILL_CATEGORIES.map((c) => h('option', { value: c.id }, c.label))
  );
  const triggerInput = h('input', { className: 'input', type: 'text', placeholder: 'Quando ativar esta skill?' });
  const bodyInput = h('textarea', {
    className: 'input', rows: 10,
    placeholder: '# Nome da Skill\n\n## Propósito\n...\n\n## Como funciona\n...'
  });

  function close() { overlay.remove(); }

  overlay.appendChild(
    h('div', { className: 'skill-modal' },
      h('h2', { style: { margin: '0 0 12px' } }, '+ Nova Skill'),
      h('div', { className: 'skill-modal__form' },
        h('label', null, h('span', null, 'NOME'), nameInput),
        h('label', null, h('span', null, 'CATEGORIA'), catSel),
        h('label', null, h('span', null, 'TRIGGER'), triggerInput),
        h('label', null, h('span', null, 'CORPO (markdown)'), bodyInput)
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
            const skill = {
              id: 'custom_' + Date.now().toString(36),
              name: nameInput.value.trim(),
              category: catSel.value,
              trigger: triggerInput.value.trim() || 'Trigger não definido.',
              version: '1.0.0',
              body: bodyInput.value || '# ' + nameInput.value
            };
            custom.push(skill);
            saveCustom(custom);
            state.selected = skill.id;
            persistState();
            renderList();
            renderDetail();
            toast('Skill criada!', { type: 'success' });
            close();
          }
        }, '✓ Criar Skill')
      )
    )
  );
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.body.appendChild(overlay);
  nameInput.focus();
}

export function iaProprietariaPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-mark11' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'IA PROPRIETÁRIA')),
      h('h1', { className: 'page-header__title' }, '◉ IA Proprietária — Mark 11'),
      h('p', { className: 'page-header__description' },
        'Sistema de ',
        h('span', { className: 'u-text-cyan' }, 'Skills dinâmico'),
        ' (SKILL.md). Cada skill é uma capacidade modular e componível. ',
        BUILTIN_SKILLS.length + ' skills built-in + suas customizadas. ',
        'Integra com o ', h('a', { href: '#/jarvis', style: 'color: var(--color-cyan)' }, 'J.A.R.V.I.S.'), '.')
    )
  );

  /* Toolbar */
  const filterChips = h('div', { className: 'mark11-filters' });
  [{ id: 'all', label: 'Todas' }, ...SKILL_CATEGORIES].forEach((c) => {
    filterChips.appendChild(
      h('button', {
        className: cx('chip', state.filter === c.id && 'chip--active'),
        onclick: () => {
          state.filter = c.id;
          persistState();
          document.querySelectorAll('.mark11-filters .chip').forEach((b) =>
            b.classList.toggle('chip--active', b.textContent === c.label)
          );
          renderList();
        }
      }, c.label)
    );
  });

  fullPage.appendChild(
    h('div', { className: 'mark11-toolbar' },
      filterChips,
      h('button', { className: 'btn btn--primary btn--sm', onclick: openSkillCreator }, '+ Nova Skill')
    )
  );

  listEl = h('div', { className: 'skill-list' });
  detailEl = h('div', { className: 'skill-detail' });

  fullPage.appendChild(
    h('div', { className: 'mark11-grid' }, listEl, detailEl)
  );

  /* Doc footer */
  fullPage.appendChild(
    h('div', { className: 'mark11-doc' },
      h('div', { className: 'mark11-doc__title' }, '◆ Sobre o sistema Mark 11'),
      h('p', null,
        'A IA Proprietária Mark 11 é a camada de inteligência embarcada do Baluarte. ',
        'Diferente do J.A.R.V.I.S. (que conversa), o Mark 11 organiza ',
        h('strong', null, 'capacidades'),
        ' em skills modulares — cada uma um arquivo SKILL.md com trigger e instruções. ',
        'O conceito é inspirado nos sistemas de skills de agentes modernos: o modelo carrega ',
        'a skill relevante conforme o contexto, sem inflar o prompt base.'),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px' } },
        'Roadmap: indexação de repositórios de referência, skills com código executável, ',
        'e integração bidirecional com o agente do J.A.R.V.I.S. (Fase 20).')
    )
  );

  renderList();
  renderDetail();

  return fullPage;
}
