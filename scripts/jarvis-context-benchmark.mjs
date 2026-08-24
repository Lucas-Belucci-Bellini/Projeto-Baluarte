import { selectContextMessages } from '../src/utils/jarvis-context.js';
import { getToolSchemas } from '../src/utils/jarvis-tools.js';

const messages = Array.from({ length: 80 }, (_, index) => ({
  role: index % 2 === 0 ? 'user' : 'jarvis',
  text: `turno ${index + 1} — Projeto Baluarte e contexto operacional `.repeat(18),
}));

const unboundedCharacters = messages.reduce((total, message) => total + message.text.length, 0);
const standard = selectContextMessages(messages, { maxMessages: 24, maxCharacters: 12_000 });
const agent = selectContextMessages(messages, { maxMessages: 32, maxCharacters: 18_000 });
const fullTools = getToolSchemas();
const focusedTools = getToolSchemas({ query: 'procure um rifle no arsenal' });
const unknownTools = getToolSchemas({ query: 'assunto sem domínio conhecido' });

const report = {
  benchmark: 'jarvis-context-v1',
  deterministic: true,
  input: {
    messages: messages.length,
    characters: unboundedCharacters,
  },
  standardBudget: standard.metrics,
  agentBudget: agent.metrics,
  tools: {
    full: fullTools.length,
    focusedArsenal: focusedTools.length,
    unknownFocusFallback: unknownTools.length,
    focusedNames: focusedTools.map((tool) => tool.name),
  },
  reductions: {
    standardCharacterReductionPercent: Number(((1 - standard.metrics.characters / unboundedCharacters) * 100).toFixed(2)),
    agentCharacterReductionPercent: Number(((1 - agent.metrics.characters / unboundedCharacters) * 100).toFixed(2)),
    focusedToolReductionPercent: Number(((1 - focusedTools.length / fullTools.length) * 100).toFixed(2)),
  },
};

console.log(JSON.stringify(report, null, 2));
