/**
 * A versão do Baluarte é uma só — cobrada em três arquivos.
 *
 * `src/data/version.js` se declara "fonte única de verdade", mas dois lugares
 * não conseguem importar dele:
 *
 *   - `package.json` — npm não lê JS;
 *   - `public/sw.js` — é servido cru, não passa pelo bundler.
 *
 * Ou seja, "fonte única" depende de alguém lembrar de copiar o número em dois
 * arquivos. Isso já falhou **duas vezes** neste repositório, e a falha é do tipo
 * pior: silenciosa em desenvolvimento e destrutiva em produção. Quando a VERSION
 * do Service Worker não muda, o navegador entende que o SW é o mesmo, **não
 * limpa os caches antigos** e continua servindo os assets da release anterior.
 * O sintoma que chega é "o site novo não funciona" — e ninguém suspeita do cache.
 *
 * Registro das duas vezes:
 *   0.7.3    — SW parado na v0.5.0 por duas releases
 *   1.0.0-rc — SW em v0.9.1 enquanto o site dizia 2.0.0
 *
 * Este teste é a terceira vez não acontecendo.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { VERSION, CODENAME } from '../src/data/version.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

const pkg = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'));
const sw = readFileSync(join(raiz, 'public/sw.js'), 'utf8');

/* O SW usa o prefixo `baluarte-v` na chave do cache. */
const swVersao = (/^const VERSION = '([^']+)';$/m.exec(sw) || [])[1];

test('package.json e src/data/version.js concordam', () => {
  assert.equal(
    pkg.version, VERSION,
    `package.json diz "${pkg.version}" e version.js diz "${VERSION}" — mude os dois juntos.`
  );
});

test('public/sw.js carrega a mesma versão (senão o cache velho não é limpo)', () => {
  assert.ok(swVersao, 'não achei "const VERSION = ..." em public/sw.js');
  assert.equal(
    swVersao, `baluarte-v${VERSION}`,
    `sw.js diz "${swVersao}" e a versão do projeto é "${VERSION}". ` +
    `Enquanto divergirem, o navegador NÃO troca o Service Worker e serve assets da release anterior.`
  );
});

test('a versão é semver válido', () => {
  /* Prerelease é permitido (`1.0.0-rc`); o que não pode é algo que o npm
   * recuse na hora de publicar ou de gerar a tag. */
  assert.match(
    VERSION, /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/,
    `"${VERSION}" não é semver`
  );
});

test('o codinome existe — a sidebar e o header o exibem', () => {
  assert.ok(CODENAME && CODENAME.length > 0);
});
