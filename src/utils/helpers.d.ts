export type HChild =
  | Node
  | string
  | number
  | false
  | null
  | undefined
  | readonly HChild[];

export interface HAttributes {
  className?: string;
  class?: string;
  style?: string | Record<string, string | number>;
  dataset?: Record<string, string>;
  html?: string;
  [key: string]: unknown;
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: HAttributes | null,
  ...children: HChild[]
): HTMLElementTagNameMap[K];

export function cx(
  ...parts: ReadonlyArray<string | false | null | undefined | ReadonlyArray<string | false | null | undefined>>
): string;

export const pad2: (value: number) => string;
export function randHex(bytes?: number): string;

export function empty<T extends HTMLElement>(element: T): T;
export function mount(container: HTMLElement, child: Node | null | undefined): void;
export function normalize(value: unknown): string;
export function debounce<Args extends readonly unknown[]>(
  callback: (...args: Args) => void,
  wait: number,
): (...args: Args) => void;
