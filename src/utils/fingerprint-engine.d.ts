export type FingerprintVector = ArrayLike<number>;

export interface FingerprintLocation {
  readonly centroid: number[];
  readonly n: number;
}

export interface FingerprintMatch {
  readonly name: string;
  readonly samples: number;
  readonly score: number;
  confidence: number;
}

export interface FingerprintLocationSummary {
  readonly name: string;
  readonly samples: number;
}

export interface FingerprintDatabase {
  readonly locations: Record<string, FingerprintLocation>;
}

export interface FingerprintDB {
  learn(name: string, vector: FingerprintVector): number;
  classify(vector: FingerprintVector): FingerprintMatch[];
  locations(): FingerprintLocationSummary[];
  remove(name: string): void;
  clear(): void;
}

export function cosine(a: FingerprintVector, b: FingerprintVector): number;
export function createFingerprintDB(): FingerprintDB;
