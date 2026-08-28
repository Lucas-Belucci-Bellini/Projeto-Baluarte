#!/usr/bin/env node

import assert from 'node:assert/strict';

import {
  montarBackup,
  restaurarBackup,
  validarBackup,
} from '../src/core/backup.js';
import { aplicarPolitica } from '../src/core/politica.js';
import { clearAll, get, set } from '../src/core/storage.js';
import * as flags from '../src/core/flags.js';
import * as permissoes from '../src/core/permissions.js';

function prepararStorage() {
  permissoes.limpar();
  flags.limpar();
  clearAll();
  aplicarPolitica();
}

function executarDrill() {
  prepararStorage();

  const esperadoEditor = [{ nome: 'ação.js', conteudo: 'const coração = "único";' }];
  const esperadoTema = 'rubi';
  set('editor:state', esperadoEditor);
  set('ui:theme', esperadoTema);
  set('auth:session', { access_token: 'não deve ser exportado' });

  const backup = montarBackup();
  assert.equal(validarBackup(backup).ok, true);
  assert.equal('auth:session' in backup.chaves, false);

  clearAll();
  aplicarPolitica();
  assert.equal(get('editor:state'), null);
  assert.equal(get('ui:theme'), null);

  const restaurado = restaurarBackup(backup);
  assert.deepEqual(restaurado.restauradas.sort(), ['editor:state', 'permissoes', 'ui:theme']);
  assert.deepEqual(get('editor:state'), esperadoEditor);
  assert.equal(get('ui:theme'), esperadoTema);
  assert.equal(get('auth:session'), null);

  const adulterado = {
    ...backup,
    chaves: {
      ...backup.chaves,
      'drill:chave-desconhecida': { versao: 1, classe: 'local', d: 'não gravar' },
    },
  };
  const resultadoAdulterado = restaurarBackup(adulterado);
  assert.equal(get('drill:chave-desconhecida'), null);
  assert.equal(
    resultadoAdulterado.ignoradas.some(({ chave, motivo }) => (
      chave === 'drill:chave-desconhecida' && /não existe/i.test(motivo)
    )),
    true,
  );

  const resumo = {
    backupValidado: true,
    chavesExportadas: Object.keys(backup.chaves).sort(),
    restauradas: restaurado.restauradas.sort(),
    sessaoExcluida: !('auth:session' in backup.chaves) && get('auth:session') === null,
    chaveDesconhecidaIgnorada: resultadoAdulterado.ignoradas.some(
      ({ chave }) => chave === 'drill:chave-desconhecida',
    ),
    rpoRto: 'não-aprovados',
  };

  assert.equal(resumo.sessaoExcluida, true);
  assert.equal(resumo.chaveDesconhecidaIgnorada, true);
  return resumo;
}

try {
  const resumo = executarDrill();
  console.log(JSON.stringify({
    drill: 'v2-backup-restore-local',
    estado: 'passou',
    ...resumo,
  }, null, 2));
} finally {
  permissoes.limpar();
  flags.limpar();
  clearAll();
}
