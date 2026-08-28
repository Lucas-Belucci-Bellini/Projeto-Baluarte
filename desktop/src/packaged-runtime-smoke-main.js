const { app } = require('electron');
const fs = require('node:fs');
const { mkdtemp, mkdir, writeFile, rm } = require('node:fs/promises');
const path = require('node:path');
const { tmpdir } = require('node:os');
const { criarRuntime, EXE } = require('./runtime');

function bytesToText(bytes) {
  return Buffer.from(bytes || []).toString('utf8');
}

async function executarSmoke() {
  if (process.env.BALUARTE_PACKAGED_RUNTIME_SMOKE !== '1') {
    throw new Error('smoke empacotado exige BALUARTE_PACKAGED_RUNTIME_SMOKE=1');
  }
  if (!app.isPackaged) throw new Error('smoke empacotado exige app.isPackaged=true');
  if (process.env.BALUARTE_RUNTIME_BIN) {
    throw new Error('smoke empacotado não aceita BALUARTE_RUNTIME_BIN: o teste deve provar resourcesPath');
  }

  const expectedBinary = path.join(process.resourcesPath, 'runtime', EXE);
  const expectedTransport = path.join(process.resourcesPath, 'v2core', 'runtime-stdio.js');
  if (!fs.existsSync(expectedBinary)) throw new Error(`binário ausente em resourcesPath: ${expectedBinary}`);
  if (!fs.existsSync(expectedTransport)) throw new Error(`transporte ausente em resourcesPath: ${expectedTransport}`);

  const raiz = await mkdtemp(path.join(tmpdir(), 'baluarte-packaged-runtime-'));
  await mkdir(path.join(raiz, 'alpha'), { recursive: true });
  await writeFile(path.join(raiz, 'alpha', 'hello.txt'), 'BALUARTE-V2');

  const runtime = criarRuntime({ raiz });
  const envelope = {
    versao: 1,
    modulos: [{ modulo: 'alpha', permissoes: ['READ_FILES'] }]
  };

  try {
    const status = runtime.status();
    if (!status.disponivel) throw new Error(`Runtime empacotado indisponível: ${status.motivo}`);
    if (status.binario !== expectedBinary) {
      throw new Error(`Runtime não veio de process.resourcesPath: ${status.binario}`);
    }

    const autorizacao = await runtime.autorizar(envelope);
    if (autorizacao.status !== 'authorized') {
      throw new Error(`autorização empacotada inesperada: ${autorizacao.status}`);
    }

    const arquivo = await runtime.ler(envelope, 'alpha', 'hello.txt');
    const leitura = bytesToText(arquivo.bytes);
    if (leitura !== 'BALUARTE-V2') throw new Error(`leitura empacotada inesperada: ${leitura}`);

    const fuga = await runtime.ler(envelope, 'alpha', '../secret.txt');
    if (fuga.status !== 'error') throw new Error('escape de raiz não foi recusado pelo Runtime');

    console.log(`BALUARTE_PACKAGED_RUNTIME_SMOKE ${JSON.stringify({
      packaged: app.isPackaged,
      resourcesPath: process.resourcesPath,
      binaryPath: status.binario,
      transportPath: expectedTransport,
      authorization: autorizacao.status,
      read: leitura,
      escape: fuga.status
    })}`);
  } finally {
    await runtime.fechar();
    await rm(raiz, { recursive: true, force: true });
  }
}

app.whenReady().then(executarSmoke).then(
  () => app.quit(),
  (error) => {
    console.error(`BALUARTE_PACKAGED_RUNTIME_SMOKE_ERROR ${error instanceof Error ? error.message : String(error)}`);
    app.exitCode = 1;
    app.quit();
  }
);
