import type { JarvisConfig, JarvisMessage } from './jarvis-engine.js';

export interface WebLLMModel {
  readonly id: string;
  readonly label: string;
}

export declare const WEBLLM_MODELS: readonly WebLLMModel[];
export declare const DEFAULT_WEBLLM_MODEL: string;

export interface WebLLMCallbacks {
  /**
   * Progresso do download/carga do modelo.
   *
   * ⚠️ São **dois** argumentos: o texto e a fração de 0 a 1. A tela do JARVIS
   * usa a fração para a barra de progresso — declarar só o texto tornaria o
   * segundo parâmetro um erro de tipo justamente em quem já o consome.
   */
  onProgress?: (text: string, fraction: number) => void;
  onToken?: (partial: string) => void;
}

export function getLoadedModel(): string | null;

/** O navegador tem WebGPU? Sem ele nenhum modo de modelo local roda. */
export function isWebGPUAvailable(): boolean;

/**
 * Baixa e carrega o modelo antes de conversar, para a 1ª mensagem não esperar.
 *
 * Devolve o id do modelo que **realmente** ficou ativo, que pode não ser o
 * pedido: GPU sem shader-f16 cai para o gêmeo f32 sozinha.
 *
 * @throws {Error} sem WebGPU, ou se a biblioteca/modelo não carregar.
 */
export function preloadWebLLM(
  modelId?: string | null,
  onProgress?: (text: string, fraction: number) => void,
): Promise<string | null>;

export function processWebLLM(messages: readonly JarvisMessage[], config: JarvisConfig, callbacks?: WebLLMCallbacks): Promise<string>;
