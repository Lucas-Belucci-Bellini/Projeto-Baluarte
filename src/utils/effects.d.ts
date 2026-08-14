export interface SpotlightOptions { color?: string }
export interface TiltOptions { amplitude?: number; scale?: number; perspective?: number }
export function attachSpotlight(element: HTMLElement, options?: SpotlightOptions): () => void;
export function attachTilt(element: HTMLElement, options?: TiltOptions): () => void;
export function decryptTitles(page: HTMLElement | null): void;
