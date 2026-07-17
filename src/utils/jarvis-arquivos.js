/**
 * JARVIS Arquivista — lado WEB (#369, fase 1 / 0.6.0).
 *
 * Registra as ferramentas de arquivos no catálogo do agente QUANDO o site
 * roda dentro do Launcher (`window.baluarte.native`). Na web pura nada é
 * registrado — o agente nem fica sabendo que a capacidade existe (#238).
 *
 * O poder real mora no app (desktop/src/arquivos.js, read-only com cofre
 * pessoal e bloqueios); aqui é só o adaptador fino sobre o funil
 * `window.baluarte.invoke('arquivos:*')`.
 */

import { registerTool } from './jarvis-tools.js';

const temPonte = () =>
  typeof window !== 'undefined' && !!window.baluarte &&
  window.baluarte.native === true && typeof window.baluarte.invoke === 'function';

const invocar = (canal, payload) => window.baluarte.invoke(canal, payload || {});

/** Status do motor de arquivos (raiz, bloqueios, progresso). Nunca lança. */
export async function statusArquivos() {
  if (!temPonte()) return { disponivel: false };
  try { return await invocar('arquivos:status'); } catch { return { disponivel: false }; }
}

/** Busca por nome. @throws mensagem amigável do motor */
export function buscarArquivos(termo, limite) {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:buscar', { termo, limite });
}

/** Inventário completo + relatório em Documentos/Baluarte. */
export function relatorioArquivos() {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:relatorio');
}

/** Fase 2 (0.6.1): ler texto seguro · resumo de pasta · busca por conteúdo. */
export function lerArquivo(caminho) {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:ler', { caminho });
}
export function analisarPasta(caminho) {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:analisar', { caminho });
}
export function grepArquivos(termo, caminho) {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:grep', { termo, caminho });
}

/* Fase 3 (0.7.0) — ESCRITA com a mão do operador. Estas funções são chamadas
 * SÓ pelos comandos do Núcleo depois do "confirmar"; de propósito, nenhuma
 * delas vira tool do agente nesta fase. */
export function moverArquivo(de, para) {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:mover', { de, para });
}
export function apagarArquivo(caminho) {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:apagar', { caminho });
}
export function verLixeira() {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:lixeira');
}
export function restaurarArquivo(id) {
  if (!temPonte()) throw new Error('Arquivos só no app (Baluarte Launcher).');
  return invocar('arquivos:restaurar', { id });
}

let registrado = false;
/** Registra as ferramentas do agente (idempotente; no-op fora do app). */
export function initArquivosTools() {
  if (registrado || !temPonte()) return registrado;
  registrado = true;

  registerTool({
    name: 'buscar_arquivos',
    description: 'Busca arquivos REAIS do computador do operador por nome (substring, ignora acentos/caixa) e devolve caminhos, tamanhos e datas. Motor read-only do Launcher com cofre pessoal (pastas privadas nunca aparecem). Use quando o operador pedir pra achar/localizar um arquivo na máquina.',
    input_schema: {
      type: 'object',
      properties: {
        termo: { type: 'string', description: 'Trecho do nome do arquivo (mínimo 2 caracteres). Ex: "baluarte", ".blend", "relatorio"' }
      },
      required: ['termo']
    },
    run: async ({ termo }) => {
      try {
        const r = await buscarArquivos(termo);
        return {
          ok: true,
          total: r.total,
          tetoAtingido: !!r.tetoAtingido,
          parcial: !!(r.stats && r.stats.parcial),
          resultados: (r.resultados || []).slice(0, 20)
            .map((x) => ({ caminho: x.caminho, tamanho: x.bytes, modificado: x.modificado }))
        };
      } catch (e) { return { ok: false, error: e.message }; }
    }
  });

  registerTool({
    name: 'ler_arquivo',
    description: 'Lê o CONTEÚDO de um arquivo de texto/código do computador (read-only, máx 256 KB). Recusa binários, credenciais e qualquer coisa no cofre pessoal. Use quando o operador pedir pra ver/explicar/analisar um arquivo específico.',
    input_schema: {
      type: 'object',
      properties: { caminho: { type: 'string', description: 'Caminho do arquivo (absoluto ou relativo à pasta do usuário).' } },
      required: ['caminho']
    },
    run: async ({ caminho }) => {
      try {
        const r = await lerArquivo(caminho);
        return { ok: true, caminho: r.caminho, bytes: r.bytes, linhas: r.linhas, truncado: r.truncado, conteudo: r.conteudo.slice(0, 12000) };
      } catch (e) { return { ok: false, error: e.message }; }
    }
  });

  registerTool({
    name: 'analisar_pasta',
    description: 'Analisa uma PASTA do computador e responde "o que é isto?": classificação (projeto de código/fotos/música/documentos/backups), totais, top extensões, maiores e mais recentes, DUPLICADOS (mesmo tamanho + hash) e GORDURA (arquivos grandes parados há 90+ dias). Read-only. Use pra entender/organizar diretórios.',
    input_schema: {
      type: 'object',
      properties: { caminho: { type: 'string', description: 'Caminho da pasta. Vazio = pasta do usuário inteira.' } },
      required: []
    },
    run: async ({ caminho }) => {
      try { return { ok: true, ...(await analisarPasta(caminho || '.')) }; }
      catch (e) { return { ok: false, error: e.message }; }
    }
  });

  registerTool({
    name: 'buscar_conteudo',
    description: 'Busca um trecho de TEXTO DENTRO dos arquivos (grep literal, sem regex) de uma pasta do computador — só tipos de texto seguros, nunca credenciais/cofre. Devolve arquivo, linha e trecho. Use quando o operador procurar onde algo está escrito.',
    input_schema: {
      type: 'object',
      properties: {
        termo: { type: 'string', description: 'Texto a procurar (mínimo 3 caracteres).' },
        caminho: { type: 'string', description: 'Pasta onde procurar. Vazio = pasta do usuário inteira (mais lento).' }
      },
      required: ['termo']
    },
    run: async ({ termo, caminho }) => {
      try {
        const r = await grepArquivos(termo, caminho || '.');
        return { ok: true, total: r.total, arquivosLidos: r.arquivosLidos, tetoAtingido: r.tetoAtingido, acertos: r.acertos.slice(0, 20) };
      } catch (e) { return { ok: false, error: e.message }; }
    }
  });

  registerTool({
    name: 'relatorio_arquivos',
    description: 'Gera o INVENTÁRIO COMPLETO dos arquivos do computador (read-only): varre a pasta do usuário e salva um relatório .md (totais, top extensões, maiores arquivos, contagem por pasta) + a listagem completa de caminhos em .txt, em Documentos/Baluarte. Demora minutos em discos grandes. Use quando o operador pedir "relatório dos arquivos", "inventário do PC" ou algo assim.',
    input_schema: { type: 'object', properties: {} },
    run: async () => {
      try {
        const r = await relatorioArquivos();
        return { ok: true, relatorio: r.relatorio, listagem: r.listagem, resumo: r.resumo };
      } catch (e) { return { ok: false, error: e.message }; }
    }
  });
  return true;
}
