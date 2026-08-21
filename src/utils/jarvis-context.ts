import { VERSION } from '../data/version.js';
import { ARSENAL, TOTAL } from '../data/arsenal.js';
import { EQUIPES, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, ARCS_TOTAL } from '../data/cronicas.js';
import { UNIVERSOS } from '../data/universos.js';
import { capabilitiesText, findCapability } from '../data/site-capabilities.js';
import { codeContext } from './jarvis-brain.js';
import { getStatusText } from './baluarte-status';
export interface JarvisRouteCapability {
  readonly path: string;
  readonly label: string;
}

export interface JarvisMessage {
  readonly role: 'user' | 'assistant' | 'jarvis' | 'tool' | 'system';
  readonly text?: string;
  readonly content?: string;
}

export interface BriefingOptions {
  readonly compact?: boolean;
}

export interface ContextBudget {
  readonly maxCharacters?: number;
  readonly maxMessages?: number;
}

export interface ContextMetrics {
  readonly messages: number;
  readonly characters: number;
  readonly truncated: boolean;
}

export interface JarvisContextObservation extends ContextMetrics {
  readonly mode: string;
  readonly preparationMs: number;
}

interface BriefingCache {
  readonly key: string;
  readonly text: string;
}

const briefingCache = new Map<string, BriefingCache>();
let lastContextObservation: JarvisContextObservation | null = null;

function briefingKey(): string {
  return [VERSION, TOTAL, TOTAL_EQUIPES, ARCS_TOTAL, UNIVERSOS.length].join(':');
}

function messageText(message: JarvisMessage): string {
  return typeof message.text === 'string' ? message.text : message.content ?? '';
}

export function getBaluarteBriefing(options: BriefingOptions = {}): string {
  const key = `${briefingKey()}:${options.compact ? 'compact' : 'full'}`;
  const cached = briefingCache.get(key);
  if (cached) return cached.text;

  const universos = UNIVERSOS.map((u) => `${u.name} — ${u.tagline}`).join('; ');
  const equipes = EQUIPES.map((e) => `${e.code} (${e.name})`).join(', ');
  const text = [
    '## DOSSIÊ DO BALUARTE (use para falar do universo)',
    'Identidade: você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte Mark XIII. Operador-líder: Lucas Belucci Bellini.',
    `Plataforma v${VERSION}: ${TOTAL} itens no Arsenal · ${TOTAL_EQUIPES} equipes de elite · ${ARCS_TOTAL} arcos nas Crônicas · ${UNIVERSOS.length} universos.`,
    `Crônicas "Onde os Deuses Sangram" — universos: ${universos}.`,
    `Equipes (alfabeto OTAN): ${equipes}.`,
    'Para o universo Baluarte, baseie-se neste dossiê e no estado do site. Para fatos recentes do mundo real, use a busca na internet quando disponível.',
    ...(options.compact ? [] : ['', capabilitiesText(), '', codeContext(), '']),
    '## GRÁFICOS: para MOSTRAR um gráfico ao operador, inclua no fim da resposta um bloco cercado ```chart``` contendo JSON {"type":"bar|line|pie|donut|area|hbar|radar","title":"...","labels":[...],"values":[...]}. A interface desenha a imagem automaticamente — não descreva o JSON, apenas inclua o bloco.'
  ].join('\n');

  briefingCache.set(key, { key, text });
  return text;
}

export function invalidateBaluarteBriefing(): void {
  briefingCache.clear();
}

export function getJarvisRuntimeContext(options: BriefingOptions = {}): string {
  return `${getBaluarteBriefing(options)}\n\n## ESTADO ATUAL DO SITE (somente leitura)\n${getStatusText()}`;
}

export function selectContextMessages(
  messages: readonly JarvisMessage[],
  budget: ContextBudget = {},
): { messages: JarvisMessage[]; metrics: ContextMetrics } {
  const maxCharacters = Math.max(1000, budget.maxCharacters ?? 12000);
  const maxMessages = Math.max(2, budget.maxMessages ?? 24);
  const selected: JarvisMessage[] = [];
  let characters = 0;
  let truncated = false;

  for (let index = messages.length - 1; index >= 0 && selected.length < maxMessages; index -= 1) {
    const message = messages[index];
    const text = messageText(message);
    const remaining = maxCharacters - characters;
    if (remaining <= 0) {
      truncated = true;
      break;
    }
    const clipped = text.length > remaining ? text.slice(-remaining) : text;
    if (clipped.length !== text.length) truncated = true;
    selected.unshift({ ...message, text: clipped });
    characters += clipped.length;
  }

  if (selected.length < messages.length) truncated = true;
  return { messages: selected, metrics: { messages: selected.length, characters, truncated } };
}

export function recordJarvisContextObservation(observation: JarvisContextObservation): void {
  lastContextObservation = {
    mode: String(observation.mode).slice(0, 32),
    messages: Math.max(0, Math.floor(observation.messages)),
    characters: Math.max(0, Math.floor(observation.characters)),
    truncated: observation.truncated === true,
    preparationMs: Math.max(0, Math.min(60_000, Math.round(observation.preparationMs))),
  };
}

export function getLastJarvisContextObservation(): JarvisContextObservation | null {
  return lastContextObservation ? { ...lastContextObservation } : null;
}

export function findJarvisCapability(query: string): JarvisRouteCapability | null {
  return findCapability(query);
}
