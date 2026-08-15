/**
 * Página /conselho — Conselho de IAs.
 *
 * A UI permanece responsável apenas por convocar a deliberação, renderizar
 * membros conforme chegam e exibir o consenso. As engines JARVIS continuam
 * isoladas nas fronteiras declaradas desta onda.
 */

import '../styles/conselho.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { runCouncil } from '../utils/jarvis-council.js';
import type { CouncilMember } from '../utils/jarvis-council.js';
import { getLoadedModel } from '../utils/jarvis-webllm.js';

export function conselhoPage(): HTMLDivElement {
  const page = h('div', { className: 'page-conselho' });
  let busy = false;

  page.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CONSELHO'),
  ),
  h('h1', { className: 'page-header__title' }, '⚖️ Conselho de IAs'),
  h('p', { className: 'page-header__description' },
    'Várias IAs respondem ', h('span', { className: 'u-text-cyan' }, 'juntas'),
    ' — todas compartilhando a memória do JARVIS — e um moderador sintetiza o ',
    h('span', { className: 'u-text-cyan' }, 'consenso'), '.',
  ),
  ));

  const input = h('textarea', {
    className: 'cons-input',
    rows: 2,
    placeholder: 'Pergunte ao conselho… (Enter envia, Shift+Enter quebra linha)',
  });
  const askButton = h('button', {
    className: 'btn btn--primary',
    onclick: () => { void ask(); },
  }, '⚖️ Convocar conselho');
  input.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void ask();
    }
  });
  page.appendChild(h('div', { className: 'cons-ask' }, input, askButton));

  const status = h('div', { className: 'cons-status u-text-muted', style: { display: 'none' } });
  page.appendChild(status);
  const members = h('div', { className: 'cons-members' });
  page.appendChild(members);
  const consensus = h('div', { className: 'cons-consensus', style: { display: 'none' } });
  page.appendChild(consensus);
  page.appendChild(h('p', {
    className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' },
  },
  '🧠 O consenso entra na ', h('a', { href: '#/memoria', className: 'u-text-cyan' }, 'memória'),
  ' — assim o conselho também alimenta o cérebro comum. Para somar o modelo do navegador (Hermes), carregue-o antes no ',
  h('a', { href: '#/jarvis', className: 'u-text-cyan' }, 'JARVIS'), ' (modo Navegador).',
  ));

  function memberCard(member: CouncilMember): HTMLDivElement {
    return h('div', { className: `cons-card${member.ok ? '' : ' is-fail'}` },
      h('div', { className: 'cons-card__name' },
        h('span', { className: 'cons-card__dot' }), member.name,
      ),
      h('div', { className: 'cons-card__text' }, member.text || ''),
    );
  }

  async function ask(): Promise<void> {
    const question = input.value.trim();
    if (question.length < 3) {
      toast('Escreva a pergunta', { type: 'warning' });
      return;
    }
    if (busy) return;
    busy = true;
    askButton.disabled = true;
    askButton.textContent = '⏳ Deliberando…';
    empty(members);
    empty(consensus);
    consensus.style.display = 'none';
    const loaded = getLoadedModel();
    status.style.display = 'block';
    status.textContent = `Convocando: JARVIS Local · Gemini${loaded ? ` · Navegador (${loaded.split('-')[0]})` : ''}…`;
    try {
      const result = await runCouncil(question, {
        onMember: (member) => { members.appendChild(memberCard(member)); },
      });
      consensus.append(
        h('div', { className: 'cons-consensus__title' },
          `⚖️ Consenso do conselho${result.synthesizedBy ? ` · por ${result.synthesizedBy}` : ''}`,
        ),
        h('div', { className: 'cons-consensus__text' }, result.consensus),
      );
      consensus.style.display = 'block';
      status.style.display = 'none';
      toast('Conselho concluído', { type: 'success' });
    } catch (error) {
      console.error('[conselho]', error);
      status.textContent = '⚠ Falha ao convocar o conselho. Tente novamente.';
      toast('Falha no conselho', { type: 'danger' });
    } finally {
      busy = false;
      askButton.disabled = false;
      askButton.textContent = '⚖️ Convocar conselho';
    }
  }

  return page;
}
