export interface RadioOption {
  readonly value: string;
  readonly label: string;
}

export interface RadioStation {
  readonly uuid: string;
  readonly name: string;
  readonly url: string;
  readonly country: string;
  readonly countryCode: string;
  readonly tags: readonly string[];
  readonly codec: string;
  readonly bitrate: number;
  readonly votes: number;
}

export interface RadioSearchOptions {
  readonly name?: string;
  readonly countryCode?: string;
  readonly tag?: string;
  readonly limit?: number;
}

export const COUNTRY_OPTIONS: readonly RadioOption[];
export const GENRE_OPTIONS: readonly RadioOption[];
export function searchStations(options?: RadioSearchOptions): Promise<RadioStation[]>;
