import type { LanguageDefinition } from '../data/editor-langs.js';

export interface AutocompleteOptions {
  textarea: HTMLTextAreaElement;
  anchor: HTMLElement;
  getLang: () => LanguageDefinition;
}

export interface AutocompleteController {
  refresh(): void;
  handleKey(event: KeyboardEvent): boolean;
  close(): void;
  readonly isOpen: boolean;
}

export function createAutocomplete(options: AutocompleteOptions): AutocompleteController;
