/**
 * Exportar e importar o dado local do operador (#420).
 *
 * Existe por três motivos que se somam, e o terceiro só apareceu depois:
 *
 * 1. **"Recuperável" é uma das quatro palavras da definição da 1.0.0**, e até
 *    aqui o Baluarte sabia **apagar** o dado do operador (`clearAll`) e não sabia
 *    devolvê-lo. Uma plataforma que só sabe destruir o que guarda cumpre metade
 *    da promessa.
 *
 * 2. **É a ponte V1→V2.** A V2 é reconstrução arquitetural, não evolução. Sem um
 *    arquivo que carregue *o dado e a versão de cada chave*, migrar significaria
 *    adivinhar formato — e adivinhar formato de dado alheio é como se perde
 *    dado alheio.
 *
 * 3. **O aviso de "V2 em construção" manda guardar o que for importante fora do
 *    navegador.** Enquanto não existisse isto, essa instrução era oca: só dava
 *    para cumpri-la pelo DevTools. Aviso que pede algo impossível é pior que
 *    aviso nenhum, porque ensina a ignorar avisos.
 *
 * ── O formato, e por que ele carrega versão ─────────────────────────────────
 * Cada chave vai com a `versao` em que foi gravada e a `classe`. É o que
 * permite a um Baluarte futuro — que não existe ainda e não pode ser consultado
 * hoje — decidir se precisa migrar, em vez de receber um saco de JSON sem
 * procedência. É exatamente o buraco que a varredura das 59 chaves fechou no
 * `localStorage`, e seria absurdo reabri-lo no arquivo de backup.
 *
 * ── O que NÃO é exportado, e por quê ────────────────────────────────────────
 * `auth:session` fica de fora. É o JWT do Supabase, de vida curta: restaurar uma
 * sessão vencida não devolve login nenhum e ainda coloca um token real num
 * arquivo que o operador vai mandar por e-mail para si mesmo. Perder nada,
 * arriscar algo — a troca é ruim nos dois lados.
 *
 * O resto das `sensivel` **vai** (cofre de chaves, conversas do JARVIS, histórico
 * do terminal): é justamente o que dói perder, e é por isso que o backup existe.
 * Quem chama tem a obrigação de avisar o operador do que está no arquivo.
 */

import { ESQUEMAS } from './politica.js';
import { get, set, esquemaDe } from './storage.js';
import { VERSION } from '../data/version.js';

/** Formato do arquivo. Sobe quando a ESTRUTURA do envelope mudar, não quando
 *  uma chave mudar de versão — isso já é registrado por chave. */
export const VERSAO_ARQUIVO = 1;

/** Sessão de auth: curta, inútil restaurada e perigosa num arquivo. */
const NUNCA_EXPORTAR = new Set(['auth:session']);

/**
 * Monta o objeto de backup a partir do que está gravado agora.
 * Chave sem dado é **omitida** — backup não inventa valor padrão.
 * @returns {{baluarte:string, versaoArquivo:number, geradoEm:string, versaoApp:string, chaves:object}}
 */
export function montarBackup() {
  const chaves = {};
  for (const esq of ESQUEMAS) {
    if (NUNCA_EXPORTAR.has(esq.chave)) continue;
    const valor = get(esq.chave, undefined);
    if (valor === undefined || valor === null) continue;
    chaves[esq.chave] = { versao: esq.versao, classe: esq.classe, d: valor };
  }
  return {
    baluarte: 'backup',
    versaoArquivo: VERSAO_ARQUIVO,
    geradoEm: new Date().toISOString(),
    versaoApp: VERSION,
    chaves
  };
}

/** Quantas chaves e quantas delas são sensíveis — para a tela poder avisar. */
export function resumoBackup(backup) {
  const nomes = Object.keys(backup.chaves || {});
  return {
    total: nomes.length,
    sensiveis: nomes.filter((n) => backup.chaves[n].classe === 'sensivel').length
  };
}

/**
 * Confere se um objeto é um backup do Baluarte antes de qualquer escrita.
 *
 * Recusar cedo importa: um arquivo errado (outro JSON qualquer que o operador
 * escolheu por engano) não pode chegar a `set()` e sobrescrever chave real.
 * @returns {{ok:true}|{ok:false, erro:string}}
 */
export function validarBackup(obj) {
  if (!obj || typeof obj !== 'object') return { ok: false, erro: 'O arquivo não contém um objeto JSON.' };
  if (obj.baluarte !== 'backup') return { ok: false, erro: 'Este arquivo não é um backup do Baluarte.' };
  if (typeof obj.versaoArquivo !== 'number') return { ok: false, erro: 'Backup sem versão de formato.' };
  if (obj.versaoArquivo > VERSAO_ARQUIVO) {
    return { ok: false, erro: `Backup da versão ${obj.versaoArquivo}; este Baluarte entende até a ${VERSAO_ARQUIVO}. Atualize antes de importar.` };
  }
  if (!obj.chaves || typeof obj.chaves !== 'object') return { ok: false, erro: 'Backup sem a seção de chaves.' };
  return { ok: true };
}

/**
 * Restaura um backup.
 *
 * **Só grava chave declarada em `politica.js`.** Chave desconhecida é ignorada e
 * relatada, nunca escrita: importar é a única porta pela qual dado de fora entra
 * no storage, e ela não pode virar o caminho por onde uma chave sem esquema
 * reaparece depois de a varredura ter fechado esse buraco.
 *
 * Chave gravada numa versão MAIOR que a atual também é recusada — é o mesmo
 * cuidado do `storage.get`: não dá para "desmigrar" sem destruir.
 *
 * @param {object} backup objeto já validado por `validarBackup`
 * @returns {{restauradas:string[], ignoradas:{chave:string, motivo:string}[]}}
 */
export function restaurarBackup(backup) {
  const restauradas = [];
  const ignoradas = [];

  for (const [chave, entrada] of Object.entries(backup.chaves)) {
    if (NUNCA_EXPORTAR.has(chave)) {
      ignoradas.push({ chave, motivo: 'não é restaurável' });
      continue;
    }
    const esq = esquemaDe(chave);
    if (!esq) {
      ignoradas.push({ chave, motivo: 'não existe neste Baluarte' });
      continue;
    }
    if (!entrada || typeof entrada !== 'object' || !('d' in entrada)) {
      ignoradas.push({ chave, motivo: 'entrada malformada' });
      continue;
    }
    if (typeof entrada.versao === 'number' && entrada.versao > esq.versao) {
      ignoradas.push({ chave, motivo: `gravada na versão ${entrada.versao}, este Baluarte entende até a ${esq.versao}` });
      continue;
    }
    if (set(chave, entrada.d)) restauradas.push(chave);
    else ignoradas.push({ chave, motivo: 'o navegador recusou a gravação (cota?)' });
  }

  return { restauradas, ignoradas };
}

/** Nome de arquivo estável e ordenável: baluarte-backup-AAAA-MM-DD.json */
export function nomeDoArquivo(agora = new Date()) {
  return `baluarte-backup-${agora.toISOString().slice(0, 10)}.json`;
}
