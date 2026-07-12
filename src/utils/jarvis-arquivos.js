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
