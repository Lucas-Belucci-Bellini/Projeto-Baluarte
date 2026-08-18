import type { JarvisConfig, JarvisMessage } from './jarvis-engine.js';

export interface HermesLocalPreset {
  readonly id: string;
  readonly label: string;
  readonly url: string;
}

export interface HermesLocalHealth {
  readonly ok: true;
  readonly url: string;
  readonly models: readonly string[];
}

/** Endpoint padrão — a porta do LM Studio. Vale quando o operador não configura. */
export declare const HERMES_LOCAL_DEFAULT_URL: string;

export declare const HERMES_LOCAL_PRESETS: readonly HermesLocalPreset[];
export declare function listHermesLocalModels(config: JarvisConfig): Promise<string[]>;
export declare function healthHermesLocal(config: JarvisConfig): Promise<HermesLocalHealth>;
export declare function processHermesLocal(messages: readonly JarvisMessage[], config: JarvisConfig): Promise<string>;
