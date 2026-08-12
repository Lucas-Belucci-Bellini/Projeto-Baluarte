import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

const root = await mkdtemp(join(tmpdir(), 'baluarte-runtime-'));
const moduleRoot = join(root, 'alpha');
await mkdir(moduleRoot, { recursive: true });
await writeFile(join(moduleRoot, 'hello.txt'), 'BALUARTE-V2');

const binary = process.platform === 'win32'
  ? 'v2/runtime/target/debug/baluarte-runtime.exe'
  : 'v2/runtime/target/debug/baluarte-runtime';

const child = spawn(binary, [], {
  env: { ...process.env, BALUARTE_RUNTIME_ROOT: root },
  stdio: ['pipe', 'pipe', 'pipe']
});

const lines = [];
let buffer = '';
child.stdout.setEncoding('utf8');
child.stdout.on('data', (chunk) => {
  buffer += chunk;
  const partes = buffer.split('\n');
  buffer = partes.pop() ?? '';
  lines.push(...partes.filter(Boolean));
});

function enviar(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout aguardando Runtime')), 5000);
    const onData = () => {
      if (!lines.length) return;
      clearTimeout(timer);
      child.stdout.off('data', onData);
      resolve(JSON.parse(lines.shift()));
    };
    child.stdout.on('data', onData);
    child.stdin.write(`${JSON.stringify(request)}\n`);
  });
}

try {
  const envelope = {
    versao: 1,
    modulos: [{ modulo: 'alpha', permissoes: ['READ_FILES'] }]
  };

  const authorized = await enviar({ op: 'authorize', envelope });
  if (authorized.status !== 'authorized' || !authorized.modulos.includes('alpha')) {
    throw new Error(`authorize inesperado: ${JSON.stringify(authorized)}`);
  }

  const file = await enviar({ op: 'read_file', envelope, modulo: 'alpha', path: 'hello.txt' });
  const content = Buffer.from(file.bytes ?? []).toString('utf8');
  if (file.status !== 'file' || content !== 'BALUARTE-V2') {
    throw new Error(`read_file inesperado: ${JSON.stringify(file)}`);
  }

  const escape = await enviar({ op: 'read_file', envelope, modulo: 'alpha', path: '../secret.txt' });
  if (escape.status !== 'error') {
    throw new Error(`escape não foi recusado: ${JSON.stringify(escape)}`);
  }

  console.log('V2 Runtime smoke: OK');
} finally {
  child.stdin.end();
  await new Promise((resolve) => child.once('exit', resolve));
  await rm(root, { recursive: true, force: true });
}
