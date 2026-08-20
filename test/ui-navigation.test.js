import test from 'node:test';
import assert from 'node:assert/strict';

import { NAV_GROUPS } from '../src/layout/sidebar.ts';
import {
  findNavigationEntry,
  projectLegacyNavigation,
  projectRegistryNavigation,
} from '../src/layout/navigation.ts';
import { createRegistryNavigationObserver } from '../src/layout/registry-observer.ts';

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
