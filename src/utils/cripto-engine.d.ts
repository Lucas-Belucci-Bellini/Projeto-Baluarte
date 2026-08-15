export interface HashResults {
  readonly 'SHA-1': string;
  readonly 'SHA-256': string;
  readonly 'SHA-384': string;
  readonly 'SHA-512': string;
  readonly MD5: string;
}
export interface CaesarCandidate { readonly shift: number; readonly text: string; }
export interface BaseEncoders {
  readonly enc: (text: string) => string;
  readonly dec: (text: string) => string | null;
  readonly label: string;
  readonly alphabet: string;
}
export function caesarEncode(text: string, shift?: number, preserveCase?: boolean): string;
export function caesarDecode(text: string, shift?: number): string;
export function caesarBruteforce(text: string): readonly CaesarCandidate[];
export function ptScore(text: string): number;
export function toBase64(text: string): string;
export function fromBase64(text: string): string | null;
export function toBase32(text: string): string;
export function fromBase32(text: string): string | null;
export function toHex(text: string): string;
export function fromHex(text: string): string | null;
export function atbash(text: string): string;
export function vigenereEncode(text: string, key: string, decode?: boolean): string;
export function vigenereDecode(text: string, key: string): string;
export interface MorsePlaybackOptions { readonly wpm?: number; readonly freq?: number; }
export function randomBytes(length: number): Uint8Array;
export function otpEncode(textBytes: Uint8Array, keyBytes: Uint8Array): Uint8Array;
export function bytesToBase64(bytes: Uint8Array): string;
export function base64ToBytes(text: string): Uint8Array | null;
export function textToBytes(text: string): Uint8Array;
export function bytesToText(bytes: Uint8Array): string;
export function aesEncrypt(plaintext: string, password: string): Promise<string>;
export function aesDecrypt(ciphertext: string, password: string): Promise<string>;
export function toMorse(text: string): string;
export function fromMorse(text: string): string;
export function playMorse(morse: string, options?: MorsePlaybackOptions): number;
export function stopMorse(): void;
export function allHashes(text: string): Promise<HashResults>;
