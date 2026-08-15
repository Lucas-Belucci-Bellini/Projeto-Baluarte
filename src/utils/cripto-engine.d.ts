export interface HashResults {
  readonly 'SHA-1': string;
  readonly 'SHA-256': string;
  readonly 'SHA-384': string;
  readonly 'SHA-512': string;
  readonly MD5: string;
}
export function atbash(text: string): string;
export function vigenereEncode(text: string, key: string, decode?: boolean): string;
export function vigenereDecode(text: string, key: string): string;
export function allHashes(text: string): Promise<HashResults>;
