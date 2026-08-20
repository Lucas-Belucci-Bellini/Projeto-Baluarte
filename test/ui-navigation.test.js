import test from 'node:test';
import assert from 'node:assert/strict';

import { NAV_GROUPS } from '../src/layout/sidebar.ts';
import {
  findNavigationEntry,
  projectLegacyNavigation,
  projectRegistryNavigation,
} from '../src/layout/navigation.ts';
import { createRegistryNavigationObserver } from '../src/layout/registry-observer.ts';
import { reconcileNavigationCatalogs } from '../src/layout/catalog-reconciliation.ts';
import { decideModuleAlignment } from '../src/layout/module-alignment.ts';

const projection = projectLegacyNavigation(NAV_GROUPS, {
  currentPhase: 21,
  titleForPath: (path, fallback) =>
    path === '/home' ? 'Ponte de Comando' : fallback,
  availabilityForPath: (path) =>
    path === '/wiki-arma3' ? 'degraded' : 'enabled',
});

test('UI-01 projeta todos os grupos e entradas do catálogo legado', () => {
  const expectedEntries = NAV_GROUPS.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  assert.equal(projection.domains.length, NAV_GROUPS.length);
  assert.equal(projection.entries.length, expectedEntries);
  assert.equal(new Set(projection.entries.map((entry) => entry.path)).size, expectedEntries);
  assert.ok(projection.entries.every((entry) => entry.source === 'legacy-sidebar'));
});

test('UI-01 preserva paths, labels e fase como projeção derivada', () => {
  const legacy = NAV_GROUPS.flatMap((group) => group.items);
  const projected = new Map(projection.entries.map((entry) => [entry.path, entry]));

  for (const item of legacy) {
    const entry = projected.get(item.path);
    assert.ok(entry, `rota não projetada: ${item.path}`);
    assert.equal(entry.label, item.label);
    assert.equal(entry.icon, item.icon);
    assert.equal(entry.phase, item.phase);
  }
});

test('UI-01 separa maturidade de disponibilidade', () => {
  const wiki = findNavigationEntry(projection, '/wiki-arma3');
  const home = findNavigationEntry(projection, '/home');

  assert.equal(wiki?.availability, 'degraded');
  assert.equal(wiki?.maturity, 'stable');
  assert.equal(home?.availability, 'enabled');
  assert.equal(home?.maturity, 'stable');
});

test('UI-01 normaliza consulta e permite título projetado', () => {
  assert.equal(findNavigationEntry(projection, 'home')?.title, 'Ponte de Comando');
  assert.equal(findNavigationEntry(projection, '/home/')?.path, '/home');
  assert.equal(findNavigationEntry(projection, '/rota-inexistente'), null);
});

test('UI-02 projeta a navegação selada do Registry sem confundir estabilidade com health', () => {
  const registryProjection = projectRegistryNavigation([
    {
      modulo: 'wiki-arma3',
      nome: 'Wiki de Arma 3',
      icone: '📖',
      secao: 'Conhecimento',
      ordem: 10,
      path: '/wiki-arma3',
      estabilidade: 'beta',
    },
    {
      modulo: 'baixar',
      nome: 'Baixar o App',
      icone: '⬇',
      secao: null,
      ordem: 1,
      path: '/baixar',
      estabilidade: 'estavel',
    },
  ], {
    availabilityForModule: (moduleId) =>
      moduleId === 'wiki-arma3' ? 'degraded' : 'enabled',
  });

  const wiki = findNavigationEntry(registryProjection, '/wiki-arma3');
  const baixar = findNavigationEntry(registryProjection, '/baixar');

  assert.equal(wiki?.source, 'registry');
  assert.equal(wiki?.moduleId, 'wiki-arma3');
  assert.equal(wiki?.stability, 'beta');
  assert.equal(wiki?.maturity, 'planned');
  assert.equal(wiki?.availability, 'degraded');
  assert.equal(baixar?.stability, 'estavel');
  assert.equal(baixar?.maturity, 'stable');
  assert.equal(baixar?.availability, 'enabled');
});

test('UI-03 observa paridade exata entre Registry e catálogo legado no ambiente de teste', () => {
  let order = 0;
  const registryEntries = NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      modulo: `fixture-${item.path.slice(1).replaceAll('/', '-')}`,
      nome: item.label,
      icone: item.icon,
      secao: group.label,
      ordem: order++,
      path: item.path,
      estabilidade: 'estavel',
    })),
  );
  const observer = createRegistryNavigationObserver({ currentPhase: 21 });
  const observation = observer.observe(registryEntries);

  assert.equal(observation.source, 'registry-observer');
  assert.equal(observation.parity.exact, true);
  assert.equal(observation.parity.registryOnly.length, 0);
  assert.equal(observation.parity.legacyOnly.length, 0);
  assert.equal(observation.parity.mismatches.length, 0);
  assert.equal(observer.latest(), observation);
});

test('UI-03 conserva divergência explícita e não a transforma em mudança de DOM', () => {
  const observer = createRegistryNavigationObserver({ currentPhase: 21 });
  const observation = observer.observe([
    {
      modulo: 'wiki-arma3',
      nome: 'Wiki de Arma 3',
      icone: '📖',
      secao: 'Conhecimento',
      ordem: 1,
      path: '/wiki-arma3',
      estabilidade: 'beta',
    },
  ]);

  assert.equal(observation.parity.registryOnly.length, 0);
  assert.equal(observation.parity.legacyOnly.length > 0, true);
  assert.equal(observation.parity.mismatches.length, 0);
  assert.equal(findNavigationEntry(observation.projection, '/wiki-arma3')?.availability, 'enabled');
});

test('UI-04 classifica catálogo alinhado como candidato sem ação', () => {
  const reconciliation = reconcileNavigationCatalogs([
    {
      modulo: 'home',
      nome: 'Ponte de Comando',
      icone: '⬡',
      secao: 'Início',
      ordem: 1,
      path: '/home',
      estabilidade: 'estavel',
    },
  ], { legacyGroups: [NAV_GROUPS[0]], currentPhase: 21 });
  const home = reconciliation.rows.find((row) => row.path === '/home');

  assert.equal(home?.disposition, 'aligned');
  assert.equal(home?.action, 'no-action');
  assert.equal(home?.promotionAllowed, true);
  assert.equal(reconciliation.summary.promotionCandidates, 1);
});

test('UI-04 bloqueia promoção de divergências sem apagar o fallback V1', () => {
  const reconciliation = reconcileNavigationCatalogs([
    {
      modulo: 'editor',
      nome: 'Editor V2',
      icone: '⌨',
      secao: 'Developer',
      ordem: 1,
      path: '/editor',
      estabilidade: 'beta',
    },
    {
      modulo: 'novo-modulo',
      nome: 'Novo módulo',
      icone: '✦',
      secao: 'Experimental',
      ordem: 2,
      path: '/novo-modulo',
      estabilidade: 'experimental',
    },
  ], { legacyGroups: [NAV_GROUPS[2]], currentPhase: 21 });
  const editor = reconciliation.rows.find((row) => row.path === '/editor');
  const novo = reconciliation.rows.find((row) => row.path === '/novo-modulo');
  const legacyOnly = reconciliation.rows.find((row) => row.path === '/gerar-codigo');

  assert.equal(editor?.disposition, 'metadata-mismatch');
  assert.equal(editor?.action, 'align-metadata-before-promotion');
  assert.equal(editor?.promotionAllowed, false);
  assert.equal(novo?.disposition, 'registry-only');
  assert.equal(novo?.action, 'defer-registry-promotion');
  assert.equal(novo?.promotionAllowed, false);
  assert.equal(legacyOnly?.disposition, 'legacy-only');
  assert.equal(legacyOnly?.action, 'preserve-v1-fallback');
  assert.equal(legacyOnly?.promotionAllowed, false);
  assert.equal(reconciliation.summary.promotionCandidates, 0);
});

test('piloto por módulo só candidata promoção com health, deep link e fallback válidos', () => {
  const reconciliation = reconcileNavigationCatalogs([
    {
      modulo: 'home',
      nome: 'Ponte de Comando',
      icone: '⬡',
      secao: 'Início',
      ordem: 1,
      path: '/home',
      estabilidade: 'estavel',
    },
  ], { legacyGroups: [NAV_GROUPS[0]], currentPhase: 21 });
  const row = reconciliation.rows.find((candidate) => candidate.path === '/home');
  assert.ok(row);

  const candidate = decideModuleAlignment(row, {
    health: { mode: 'healthy', status: 'healthy', source: 'runtime-registry' },
    deepLink: 'verified',
    fallback: 'v1-preserved',
  });
  const unknownHealth = decideModuleAlignment(row, {
    health: { mode: 'healthy', status: 'healthy', source: 'unknown' },
    deepLink: 'verified',
    fallback: 'v1-preserved',
  });

  assert.equal(candidate.outcome, 'promotion-candidate');
  assert.equal(candidate.allowPublicPromotion, true);
  assert.equal(candidate.normalUserAction, 'preserve-current-surface');
  assert.equal(unknownHealth.outcome, 'blocked');
  assert.equal(unknownHealth.allowPublicPromotion, false);
  assert.ok(unknownHealth.reasons.some((reason) => /desconhecida/.test(reason)));
});

test('piloto por módulo mantém observação ou bloqueio quando a V1 precisa ser preservada', () => {
  const reconciliation = reconcileNavigationCatalogs([
    {
      modulo: 'wiki-arma3',
      nome: 'Wiki de Arma 3',
      icone: '📖',
      secao: 'Conhecimento',
      ordem: 1,
      path: '/wiki-arma3',
      estabilidade: 'beta',
    },
  ], { legacyGroups: [NAV_GROUPS[5]], currentPhase: 21 });
  const row = reconciliation.rows.find((candidate) => candidate.path === '/wiki-arma3');
  assert.ok(row);

  const observation = decideModuleAlignment(row, {
    health: { mode: 'degraded', status: 'failed', source: 'runtime-registry' },
    deepLink: 'verified',
    fallback: 'registry-observation',
  });
  const brokenDeepLink = decideModuleAlignment(row, {
    health: { mode: 'healthy', status: 'healthy', source: 'runtime-registry' },
    deepLink: 'broken',
    fallback: 'v1-preserved',
  });

  assert.equal(observation.outcome, 'blocked');
  assert.equal(observation.allowPublicPromotion, false);
  assert.equal(brokenDeepLink.outcome, 'blocked');
  assert.equal(brokenDeepLink.allowPublicPromotion, false);
  assert.equal(observation.normalUserAction, 'preserve-current-surface');
});

test('UI-01 rejeita paths duplicados em vez de mascarar divergência', () => {
  assert.throws(
    () =>
      projectLegacyNavigation(
        [{
          label: 'Teste',
          items: [
            { path: '/duplicada', label: 'A', icon: 'A', phase: 1 },
            { path: '/duplicada', label: 'B', icon: 'B', phase: 1 },
          ],
        }],
        { currentPhase: 1 },
      ),
    /Rota duplicada/,
  );
});
