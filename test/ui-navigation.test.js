import test from 'node:test';
import assert from 'node:assert/strict';

import { NAV_GROUPS } from '../src/layout/sidebar.ts';
import {
  findNavigationEntry,
  projectLegacyNavigation,
} from '../src/layout/navigation.ts';

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
