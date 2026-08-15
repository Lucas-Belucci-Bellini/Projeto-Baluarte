export interface ArquivosProgress { readonly ativo: boolean; readonly varridos: number }
export interface ArquivosStatus { readonly disponivel: boolean; readonly progresso?: ArquivosProgress; readonly raiz?: string; readonly cofrePessoal?: readonly string[] }
export interface ArquivosStats { readonly arquivos: number; readonly protegidas?: number; readonly parcial?: boolean; readonly motivoParcial?: string }
export interface ArquivoResultado { readonly caminho: string }
export interface BuscaArquivosResult { readonly termo: string; readonly total: number; readonly tetoAtingido?: boolean; readonly resultados: readonly ArquivoResultado[]; readonly stats: ArquivosStats }
export interface RelatorioArquivosResult { readonly relatorio: string; readonly listagem: string; readonly resumo: { readonly parcial?: boolean; readonly motivoParcial?: string; readonly arquivos: number; readonly pastas: number; readonly tamanho: string; readonly protegidas: number; readonly duracaoSeg: number } }
export interface LerArquivoResult { readonly caminho: string; readonly conteudo: string; readonly linhas: number; readonly truncado?: boolean }
export interface AnalisarPastaResult { readonly caminho: string; readonly tipo: string; readonly parcial?: boolean; readonly arquivos: number; readonly pastas: number; readonly tamanho: string; readonly protegidas?: number; readonly topExtensoes: readonly string[]; readonly maiores: readonly { readonly tamanho: string; readonly caminho: string }[]; readonly duplicados: readonly { readonly tamanho: string; readonly arquivos: readonly string[] }[]; readonly gordura: readonly { readonly tamanho: string; readonly paradoHaMeses: number }[] }
export interface GrepArquivosResult { readonly termo: string; readonly total: number; readonly tetoAtingido?: boolean; readonly arquivosLidos: number; readonly acertos: readonly { readonly caminho: string; readonly linha: number; readonly trecho: string }[] }
export interface MoverArquivoResult { readonly de: string; readonly para: string }
export interface ApagarArquivoResult { readonly original: string; readonly id: string }
export interface LixeiraResult { readonly total: number; readonly itens: readonly { readonly id: string; readonly original: string; readonly quando: string }[] }
export interface RestaurarArquivoResult { readonly restaurado: string }
export interface SentinelaResult { readonly varridos: readonly string[]; readonly duplaExtensao: readonly { readonly caminho: string }[]; readonly executaveis: readonly { readonly caminho: string; readonly tamanho: string; readonly modificado: string }[]; readonly autostart: readonly { readonly item: string }[]; readonly pesadosParados: readonly { readonly caminho: string; readonly tamanho: string; readonly meses: number }[]; readonly veredito: string; readonly nota: string }

export declare function initArquivosTools(): void;
export declare function statusArquivos(): Promise<ArquivosStatus>;
export declare function buscarArquivos(termo: string): Promise<BuscaArquivosResult>;
export declare function relatorioArquivos(): Promise<RelatorioArquivosResult>;
export declare function lerArquivo(caminho: string): Promise<LerArquivoResult>;
export declare function analisarPasta(caminho: string): Promise<AnalisarPastaResult>;
export declare function grepArquivos(termo: string, caminho: string): Promise<GrepArquivosResult>;
export declare function moverArquivo(de: string, para: string): Promise<MoverArquivoResult>;
export declare function apagarArquivo(alvo: string): Promise<ApagarArquivoResult>;
export declare function verLixeira(): Promise<LixeiraResult>;
export declare function restaurarArquivo(id: string): Promise<RestaurarArquivoResult>;
export declare function sentinelaPC(): Promise<SentinelaResult>;
