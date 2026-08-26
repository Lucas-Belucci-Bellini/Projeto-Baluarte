import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const DESKTOP = join(ROOT, 'desktop');
const WINDOWS = process.platform === 'win32';

function executar(comando, args, options = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(comando, args, {
      cwd: options.cwd || ROOT,
      env: { ...process.env, ...(options.env || {}) },
      stdio: 'inherit',
      shell: WINDOWS
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) reject(new Error(`${comando} terminou por sinal ${signal}`));
      else if (code !== 0) reject(new Error(`${comando} terminou com código ${code}`));
      else resolvePromise();
    });
  });
}

async function main() {
  if (WINDOWS) throw new Error('o smoke empacotado atual exige o runner Linux com Xvfb');
  if (!existsSync(join(ROOT, 'node_modules'))) {
    throw new Error('dependências raiz ausentes — execute `npm ci` antes do gate');
  }
  if (!existsSync(join(DESKTOP, 'node_modules'))) {
    throw new Error('dependências desktop ausentes — execute `npm ci --prefix desktop` antes do gate');
  }
  if (!existsSync('/usr/bin/xvfb-run')) {
    throw new Error('xvfb-run ausente — não é seguro declarar o app empacotado testado');
  }

  const output = await mkdtemp(join(tmpdir(), 'baluarte-desktop-packaged-'));
  try {
    await executar('npm', ['run', 'build']);
    await executar('cargo', ['build', '--release', '--manifest-path', 'v2/runtime/Cargo.toml']);
    await executar('npm', ['run', 'dist', '--', '--linux', 'dir', '--publish', 'never', '--config.directories.output=' + output, '--config.extraMetadata.main=src/packaged-runtime-smoke-main.js'], { cwd: DESKTOP });

    const executable = join(output, 'linux-unpacked', 'baluarte-launcher');
    if (!existsSync(executable)) throw new Error(`artefato Electron ausente: ${executable}`);

    await executar('xvfb-run', ['-a', executable, '--no-sandbox'], {
      cwd: DESKTOP,
      env: { BALUARTE_PACKAGED_RUNTIME_SMOKE: '1' }
    });
    console.log(`v2-packaged-runtime-smoke: PASS (${executable})`);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(`v2-packaged-runtime-smoke: FAIL — ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
