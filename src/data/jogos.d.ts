export interface JsDesafio { readonly code: string; readonly resp: string; }
export interface HtmlDesafio { readonly pergunta: string; readonly opcoes: readonly string[]; readonly certa: number; }
export interface CssNivel { readonly dica: string; readonly justify: string; readonly align: string; }
export const JS_DESAFIOS: readonly JsDesafio[];
export const HTML_DESAFIOS: readonly HtmlDesafio[];
export const CSS_NIVEIS: readonly CssNivel[];
export const JUSTIFY_OPCOES: readonly string[];
export const ALIGN_OPCOES: readonly string[];
