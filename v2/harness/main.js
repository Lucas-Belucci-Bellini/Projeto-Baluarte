/**
 * Banco de prova: a fundação da V2 dirigindo o router REAL da V1.
 *
 * A pergunta que este arquivo responde, e que nenhum teste com mock responde:
 * **o boot da V2 consegue servir as páginas da V1?**
 *
 * Se a resposta fosse não, o lugar de descobrir é aqui — num arquivo
 * descartável — e não depois de reescrever o `main.js` do site.
 */

import { criarRegistry } from '../core/registry.js';
import { criarBoot } from '../core/boot.js';
import { criarBus } from '../core/bus.js';
import { criarLog, definirDestino } from '../core/log.js';

/* O router da V1, sem alteração nenhuma. É o ponto: adaptar, não reescrever. */
import { router } from '../../src/core/router.js';
/* O bus da V1 — o router NÃO monta nada, ele emite `route:change` e quem monta
 * é o `shell.js`. Achado no banco de prova: sem assinar este evento, as 17
 * rotas registram e a tela fica vazia. É a peça que o `main.js` do site vai
 * precisar ligar quando a V2 assumir. */
import { bus as busV1 } from '../../src/core/events.js';
import { storage } from '../../src/core/storage.js';
import { aplicarPolitica } from '../../src/core/politica.js';

import cripto from '../modules/cripto/module.js';
import editor from '../modules/editor/module.js';
import militar from '../modules/militar/module.js';

/* Expõe os registros para o teste de navegador inspecionar sem depender de
 * texto na tela — asserção sobre pixel é frágil, sobre estado não. */
const registros = [];
definirDestino((r) => { registros.push(r); console.log(`[${r.modulo}] ${r.msg}`, r.campos ?? ''); });

const log = criarLog('harness');

async function principal() {
  /* A política da V1 declara as chaves; sem ela o storage cai no fallback. */
  aplicarPolitica();

  const registry = criarRegistry();
  [cripto, editor, militar].forEach((m) => registry.registrar(m));
  const selo = registry.selar();

  const bus = criarBus({ log });
  const saida = document.getElementById('saida');

  const boot = criarBoot(registry, { storage, bus }, {
    router,
    renderNav: (itens) => {
      const nav = document.getElementById('nav');
      nav.innerHTML = '';
      for (const item of itens) {
        const a = document.createElement('a');
        a.href = `#${item.path}`;
        /* `textContent`, não `innerHTML`: o nome vem do manifesto, que é dado de
         * módulo — e dado de módulo é entrada não confiável (Regra 37). */
        a.textContent = `${item.icone ?? ''} ${item.nome}`;
        nav.appendChild(a);
      }
    }
  });

  const r = await boot.subir();

  document.getElementById('resumo').textContent =
    `${r.vivos.length} módulos · ${r.rotas} rotas · ${r.nav.length} na navegação` +
    (r.falhas.length ? ` · ${r.falhas.length} falhas` : ' · sem falhas');

  router.setNotFound(() => {
    const d = document.createElement('div');
    d.textContent = 'rota não encontrada';
    return d;
  });

  /* A montagem: o router resolve e ANUNCIA; quem escuta decide onde põe. É um
   * desenho bom — desacopla resolução de renderização — e é justamente por isso
   * que não dá pra "só registrar rotas" e esperar tela. */
  const montar = ({ view }) => {
    saida.replaceChildren();
    if (view instanceof Node) saida.appendChild(view);
    else if (view) saida.textContent = `view não é um nó: ${typeof view}`;
  };
  busV1.on('route:change', montar);
  busV1.on('route:notfound', montar);
  busV1.on('route:error', ({ error }) => {
    saida.textContent = `falha ao carregar: ${error?.message ?? error}`;
    saida.dataset.erro = '1';
  });

  router.start('/cripto');

  /* Ponte para o teste: estado, não pixel. */
  // @ts-ignore — superfície de teste, só no banco de prova
  window.__v2 = {
    selo,
    resultado: r,
    diagnostico: boot.diagnostico(),
    rotasNoRouter: router.list ? router.list() : null,
    totalRotas: router.count ? router.count() : null,
    registros,
    eventos: bus.contagem()
  };

  log.info('banco de prova pronto', { modulos: r.vivos.length, rotas: r.rotas });
  saida.dataset.pronto = '1';
}

principal().catch((err) => {
  console.error('[harness] falhou', err);
  const s = document.getElementById('saida');
  if (s) { s.textContent = `falhou: ${err.message}`; s.dataset.erro = '1'; }
  // @ts-ignore
  window.__v2 = { erro: String(err && err.message) };
});
