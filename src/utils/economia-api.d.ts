export interface CurrencyPair { readonly code: string; readonly label: string; readonly symbol: string; readonly icon: string; }
export interface CurrencyQuote extends CurrencyPair { readonly bid: number | null; readonly pct: number | null; readonly high?: number; readonly low?: number; readonly updatedAt?: string; readonly error?: boolean; }
export interface CryptoDefinition { readonly id: string; readonly label: string; readonly symbol: string; }
export interface CryptoQuote extends CryptoDefinition { readonly brl: number | null; readonly usd: number | null; readonly pct24h?: number; readonly error?: boolean; }
export const CURRENCY_PAIRS: readonly CurrencyPair[];
export const CRYPTO_IDS: readonly CryptoDefinition[];
export function fetchCurrencies(): Promise<readonly CurrencyQuote[]>;
export function fetchCrypto(): Promise<readonly CryptoQuote[]>;
export function fmtBRL(value: number | null | undefined): string;
export function fmtUSD(value: number | null | undefined): string;
export function fmtPct(value: number | null | undefined): string;
