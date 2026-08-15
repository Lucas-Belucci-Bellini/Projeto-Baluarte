import type { LanguageDefinition } from '../data/editor-langs.js';

export interface EditorTab {
  id: string;
  name: string;
  lang: string;
  content: string;
}

export interface EditorState {
  tabs: EditorTab[];
  activeId: string;
}

export interface IframeRunResult {
  type: 'iframe';
  payload: string;
}

export interface HtmlRunResult {
  type: 'html';
  payload: string;
}

export interface LogsRunResult {
  type: 'logs';
  payload: string;
}

export type EditorRunResult = IframeRunResult | HtmlRunResult | LogsRunResult;

export const LANGS: readonly LanguageDefinition[];
export function loadState(): EditorState;
export function saveState(state: EditorState): void;
export function addTab(state: EditorState, lang?: string): EditorTab;
export function closeTab(state: EditorState, tabId: string): void;
export function getActiveTab(state: EditorState): EditorTab;
export function updateTabContent(state: EditorState, tabId: string, content: string): void;
export function changeTabLang(state: EditorState, tabId: string, lang: string): void;
export function runTab(tab: EditorTab): EditorRunResult;
export function renameTab(state: EditorState, tabId: string, newName: string): void;
