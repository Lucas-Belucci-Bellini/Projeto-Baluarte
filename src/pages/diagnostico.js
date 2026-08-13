/**
 * Página /diagnostico — painel de estado do Baluarte (issue #420, item 8).
 *
 * Existe por uma razão específica: as três fronteiras da fase de hardening
 * (permissões, esquemas de storage, flags de estabilidade) são invisíveis por
 * natureza. Quando o JARVIS diz "🔒 permissão não concedida", o operador precisa
 * de um lugar para ver o que está negado e ligar — senão a fronteira vira só uma
 * ferramenta que parou de funcionar.
 *
 * É também onde a pergunta que o #420 faz sobre a 1.0.0 fica respondida na tela:
 * o que está `estavel`, o que é `beta`, o que é `experimental`.
 *
 * Sem `innerHTML` em nenhum lugar: tudo por `h()` com texto, então nada que
 * venha do storage do operador pode virar markup.
 */

import '../styles/diagnostico.css';
import { h } from '../utils/helpers.js';
import { bus } from '../core/events.js';
import { VERSION } from '../data/version.js';
import { estadoPolitica } from '../core/politica.js';
import { conceder, revogar, ultimasDecisoes } from '../core/permissions.js';
import { definir as definirFlag, resetar as resetarFlag } from '../core/flags.js';
import { storage } from '../core/storage.js';

/* ===== Sondas do ambiente ===== */

/* Cada sonda responde sim/não sobre uma capacidade do navegador. São `try` por
 * dentro porque consultar uma API ausente lança em alguns navegadores — e o
 * diagnóstico é justamente a página que não pode quebrar. */
const SONDAS = [
  ['localStorage', () => storage.hasLocalStorage],
  ['IndexedDB', () => typeof indexedDB !== 'undefined'],
  ['Service Worker', () => 'serviceWorker' in navigator],
  ['WebGL', () => {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  }],
  ['WebGPU', () => 'gpu' in navigator],
  ['Web Audio', () => typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined'],
  ['Web Worker', () => typeof Worker !== 'undefined'],
  ['Crypto subtle', () => !!(globalThis.crypto && globalThis.crypto.subtle)],
  ['Ponte do Launcher', () => !!(window.baluarte && window.baluarte.native === true)]
];

function sondar() {
  return SONDAS.map(([nome, fn]) => {
    let ok = false;
    try { ok = !!fn(); } catch { ok = false; }
    return { nome, ok };
  });
}

/* ===== Pedaços de UI ===== */

function selo(texto, tipo) {
  return h('span', { className: `diag-selo diag-selo--${tipo}` }, texto);
}

function secao(titulo, subtitulo, ...conteudo) {
  return h('section', { className: 'diag-secao' },
    h('h2', { className: 'diag-secao__titulo' }, titulo),
    subtitulo ? h('p', { className: 'diag-secao__sub' }, subtitulo) : null,
    ...conteudo
  );
}

function linhaSonda({ nome, ok }) {
  return h('li', { className: 'diag-sonda' },
    h('span', { className: 'diag-sonda__nome' }, nome),
    selo(ok ? '✓ disponível' : '— ausente', ok ? 'ok' : 'off')
  );
}

function linhaPermissao(p, redesenhar) {
  const restrito = p.risco === 'restrito';
  return h('li', { className: 'diag-item' },
    h('div', { className: 'diag-item__cabeca' },
      h('code', { className: 'diag-item__id' }, p.id),
      selo(p.risco, restrito ? 'risco' : 'neutro')
    ),
    p.descricao ? h('p', { className: 'diag-item__desc' }, p.descricao) : null,
    h('div', { className: 'diag-item__acao' },
      selo(p.concedida ? '● concedida' : '○ negada', p.concedida ? 'ok' : 'off'),
      h('button', {
        className: 'diag-btn',
        type: 'button',
        onclick: () => {
          /* Sempre pelo nome inteiro, nunca por curinga: conceder `restrito` só
           * pode acontecer explicitamente, e este botão é o "explicitamente". */
          if (p.concedida) revogar(p.id, { origem: 'diagnostico' });
          else conceder(p.id, { origem: 'diagnostico' });
          redesenhar();
        }
      }, p.concedida ? 'Revogar' : 'Conceder')
    )
  );
}

function linhaFlag(f, ambiente, redesenhar) {
  /* Flag de outro ambiente NÃO tem botão que funcione: o motor de flags recusa
   * ligar uma app-only na web (é o gate do #238, sem porta dos fundos). Um botão
   * clicável que não muda nada é pior do que nenhum — o operador clica, não
   * acontece nada, e ele conclui que a página está quebrada. */
  const foraDoAmbiente = f.ambiente !== 'ambos' && f.ambiente !== ambiente;

  return h('li', { className: 'diag-item' },
    h('div', { className: 'diag-item__cabeca' },
      h('code', { className: 'diag-item__id' }, f.id),
      selo(f.nivel, f.nivel === 'estavel' ? 'ok' : f.nivel === 'beta' ? 'neutro' : 'risco'),
      f.ambiente !== 'ambos' ? selo(`só ${f.ambiente}`, 'neutro') : null
    ),
    f.descricao ? h('p', { className: 'diag-item__desc' }, f.descricao) : null,
    h('div', { className: 'diag-item__acao' },
      selo(f.ativo ? '● ligada' : '○ desligada', f.ativo ? 'ok' : 'off'),
      foraDoAmbiente
        ? h('span', { className: 'diag-item__nota' },
            f.ambiente === 'app'
              ? 'Só funciona dentro do Baluarte Launcher.'
              : 'Só funciona no navegador.')
        : h('button', {
            className: 'diag-btn',
            type: 'button',
            onclick: () => { definirFlag(f.id, !f.ativo); redesenhar(); }
          }, f.ativo ? 'Desligar' : 'Ligar'),
      f.escolhida && !foraDoAmbiente
        ? h('button', {
            className: 'diag-btn diag-btn--fraco',
            type: 'button',
            onclick: () => { resetarFlag(f.id); redesenhar(); }
          }, 'Padrão')
        : null
    )
  );
}

function linhaEsquema(e) {
  /* Divergência entre o que o código entende e o que está gravado é o defeito
   * que este painel existe para tornar visível — ele é silencioso em runtime. */
  const atrasada = e.gravada != null && e.gravada !== e.versao;
  return h('li', { className: 'diag-item diag-item--compacto' },
    h('div', { className: 'diag-item__cabeca' },
      h('code', { className: 'diag-item__id' }, e.chave),
      selo(e.classe, e.classe === 'sensivel' || e.classe === 'secreto' ? 'risco' : 'neutro')
    ),
    h('p', { className: 'diag-item__desc' },
      `esquema v${e.versao} · gravado: ${e.gravada == null ? 'nada ainda' : 'v' + e.gravada}` +
      (e.temMigracao ? ' · tem migração' : ' · sem migração')
    ),
    atrasada ? selo('⚠ divergente', 'risco') : null
  );
}

/* ===== Página ===== */

export function diagnosticoPage() {
  const raiz = h('div', { className: 'diag' });

  function desenhar() {
    const pol = estadoPolitica();
    const sondas = sondar();
    const negadas = pol.permissoes.declaradas.filter((p) => !p.concedida);

    raiz.replaceChildren(
      h('header', { className: 'diag-hero' },
        h('h1', { className: 'diag-hero__titulo' }, 'Diagnóstico do sistema'),
        h('p', { className: 'diag-hero__sub' },
          `Baluarte v${VERSION} · ambiente: ${pol.ambiente === 'app' ? 'Launcher (app)' : 'navegador (web)'}`),
        h('div', { className: 'diag-hero__resumo' },
          selo(`${pol.permissoes.concedidas.length} de ${pol.permissoes.declaradas.length} permissões`, 'neutro'),
          selo(`${pol.porNivel.estavel.length} estáveis`, 'ok'),
          selo(`${pol.porNivel.beta.length} beta`, 'neutro'),
          selo(`${pol.porNivel.experimental.length} experimentais`, 'risco'),
          selo(`${bus.contarOuvintes('route:change')} ouvintes em route:change`, 'neutro')
        )
      ),

      secao('Ambiente', 'O que este navegador oferece.',
        h('ul', { className: 'diag-sondas' }, ...sondas.map(linhaSonda))
      ),

      secao('Estabilidade',
        'O que a 1.0.0 promete. "Estável" significa previsível, testado, recuperável e seguro — o resto está declarado como tal de propósito.',
        h('ul', { className: 'diag-lista' }, ...pol.flags.map((f) => linhaFlag(f, pol.ambiente, desenhar)))
      ),

      secao('Permissões',
        negadas.length
          ? `${negadas.length} negada(s). Ferramenta do JARVIS que responder 🔒 precisa da permissão correspondente ligada aqui.`
          : 'Tudo concedido. Risco "restrito" nunca entra por curinga — só pelo botão, um a um.',
        h('ul', { className: 'diag-lista' },
          ...pol.permissoes.declaradas.map((p) => linhaPermissao(p, desenhar)))
      ),

      secao('Dados guardados',
        'Cada chave com esquema declarado tem versão e classificação. "Divergente" quer dizer que o gravado não é o que este código entende.',
        h('ul', { className: 'diag-lista' }, ...pol.esquemas.map(linhaEsquema))
      ),

      secao('Últimas decisões de permissão',
        'Rastro em memória (não persiste). Serve para responder "por que isso foi negado?".',
        (() => {
          const decisoes = ultimasDecisoes(15);
          if (!decisoes.length) return h('p', { className: 'diag-vazio' }, 'Nada registrado nesta sessão.');
          return h('ul', { className: 'diag-log' },
            ...decisoes.slice().reverse().map((d) => h('li', { className: 'diag-log__linha' },
              h('code', null, d.acao),
              h('span', null, d.id || (d.ids || []).join(', ')),
              d.resultado ? selo(d.resultado, d.resultado === 'ok' ? 'ok' : 'risco') : null
            ))
          );
        })()
      )
    );
  }

  desenhar();
  return raiz;
}
