/**
 * Página /shadow — Ponte Shadow (setor restrito A.R.G.E.N.T.).
 *
 * NÃO existe link para esta página em nenhum menu, card ou rodapé.
 * O acesso é feito pelo gateway oculto: sem sessão restrita válida,
 * esta rota não revela o conteúdo protegido.
 */

import '../styles/fase18.css';
import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast';
import { isShadowUnlocked, openShadowGate, lockShadow } from '../utils/shadow-gate.js';

interface StorageReport {
  readonly keys: number;
  readonly kb: string;
}

function storageReport(): StorageReport {
  let keys = 0;
  let bytes = 0;
  try {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && key.startsWith('baluarte:')) {
        keys += 1;
        bytes += key.length + (localStorage.getItem(key) ?? '').length;
      }
    }
  } catch {
    /* sem acesso a localStorage */
  }
  return { keys, kb: (bytes / 1024).toFixed(1) };
}

function diagRow(label: string, value: string): HTMLDivElement {
  return h('div', { className: 'shadow-vault__row' },
    h('span', { className: 'shadow-vault__row-label' }, label),
    h('span', { className: 'shadow-vault__row-value u-mono' }, value),
  );
}

function restrictedLink(
  icon: string,
  label: string,
  desc: string,
  route: string,
): HTMLButtonElement {
  return h('button', {
    className: 'shadow-vault__link',
    onclick: () => router.navigate(route),
  },
    h('span', { className: 'shadow-vault__link-icon' }, icon),
    h('span', { className: 'shadow-vault__link-body' },
      h('span', { className: 'shadow-vault__link-label' }, label),
      h('span', { className: 'shadow-vault__link-desc' }, desc),
    ),
    h('span', { className: 'shadow-vault__link-arrow' }, '→'),
  );
}

export function shadowPage(): HTMLDivElement | HTMLElement {
  /* Setor selado: dispara o gateway e não revela nada. */
  if (!isShadowUnlocked()) {
    openShadowGate();
    return h('section', { className: 'empty-state anim-fade-in' },
      h('div', { className: 'empty-state__icon' }, '◍'),
      h('h1', { className: 'empty-state__title' }, 'Setor selado'),
      h('p', { className: 'empty-state__subtitle' },
        'Este setor exige autenticação do operador. Se você chegou aqui por acaso, ',
        'não há nada para ver.',
      ),
      h('div', { className: 'empty-state__phase' }, 'ACESSO RESTRITO'),
      h('button', {
        className: 'btn btn--primary',
        style: { marginTop: '24px' },
        onclick: () => router.navigate('/home'),
      }, '↩ Voltar à Ponte de Comando'),
    );
  }

  const report = storageReport();
  const swActive = Boolean(navigator.serviceWorker?.controller);
  const page = h('div', { className: 'page-shadow' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'SETOR RESTRITO'),
      ),
      h('h1', { className: 'page-header__title' }, '◖ Ponte Shadow'),
      h('p', { className: 'page-header__description' },
        'Setor restrito do Baluarte. Você autenticou com o código de acesso ',
        h('span', { className: 'u-text-cyan' }, 'A.R.G.E.N.T.'),
        ', verificado por SHA-256 iterado ×100. Esta área não aparece em nenhum menu.',
      ),
    ),
  );

  page.appendChild(
    h('div', { className: 'shadow-vault__granted anim-fade-in' },
      h('span', { className: 'shadow-vault__granted-icon' }, '✓'),
      h('div', null,
        h('div', { className: 'shadow-vault__granted-title' }, 'ACESSO CONCEDIDO'),
        h('div', { className: 'shadow-vault__granted-sub' },
          'Sessão restrita ativa — ela se encerra ao fechar esta aba do navegador.',
        ),
      ),
    ),
  );

  page.appendChild(
    h('div', { className: 'card shadow-vault__about' },
      h('h2', { className: 'shadow-vault__h' }, '◐ O que é a Ponte Shadow'),
      h('p', null,
        'A Ponte Shadow é a camada oculta do Baluarte — reservada para o que é ',
        h('strong', null, 'pesado, sensível ou perigoso'),
        ' demais para ficar exposto na navegação comum. Não existe aba, botão ou ',
        'link para ela: só chega aqui quem sabe invocar o gateway e conhece o ',
        'código de acesso do operador.',
      ),
      h('p', { className: 'u-text-muted' },
        'O código nunca foi gravado no site. O que existe no código-fonte é apenas o ',
        h('strong', null, 'hash'),
        ' — o resultado de passar o código por SHA-256 cem vezes seguidas. ',
        'Quem abrir o site e inspecionar o bundle vai encontrar a prova matemática ',
        'da senha, e nunca a senha em si.',
      ),
    ),
  );

  page.appendChild(
    h('div', { className: 'card shadow-vault__diag' },
      h('h2', { className: 'shadow-vault__h' }, '◈ Diagnóstico do núcleo'),
      h('div', { className: 'shadow-vault__rows' },
        diagRow('Versão do núcleo', 'Mark XIII · v1.0.0'),
        diagRow('Sessão restrita', 'ATIVA'),
        diagRow('Service Worker', swActive ? 'controlando · offline-ready' : 'inativo nesta sessão'),
        diagRow('Dados locais (baluarte:)', `${report.keys} chaves · ${report.kb} KB`),
        diagRow('Cifra do gateway', 'SHA-256 ×100 + salt fixo'),
      ),
    ),
  );

  page.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Módulos profundos'),
      h('span', { className: 'section-header__count' }, 'acesso direto'),
    ),
  );
  page.appendChild(
    h('div', { className: 'shadow-vault__links' },
      restrictedLink('◉', 'J.A.R.V.I.S.',
        'Agente IA com ferramentas e memória persistente.', '/jarvis'),
      restrictedLink('◎', 'IA Proprietária Mark 11',
        'Sistema de Skills dinâmico — capacidades modulares.', '/ia-proprietaria'),
      restrictedLink('⌨', 'Editor IDE',
        'Ambiente de código completo com filesystem virtual.', '/editor'),
      restrictedLink('▶', 'Terminal Web',
        'Terminal com 60+ comandos e VFS persistente.', '/terminal'),
    ),
  );

  page.appendChild(
    h('div', { className: 'shadow-vault__seal' },
      h('button', {
        className: 'btn btn--ghost',
        onclick: () => {
          lockShadow();
          toast('Ponte selada — sessão restrita encerrada.', { type: 'info' });
          router.navigate('/home');
        },
      }, '⊘ Selar a ponte e sair'),
    ),
  );

  return page;
}
