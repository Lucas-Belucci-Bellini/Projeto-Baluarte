export interface QrCode {
  readonly version: number;
  readonly size: number;
  readonly modules: readonly (readonly boolean[])[];
}

export function encodeQR(text: string): QrCode;
