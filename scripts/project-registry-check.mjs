import { projectRegistrySnapshot } from '../v2/data/project-registry.js';

const snapshot = projectRegistrySnapshot();

if (snapshot.summary.available === 0 || snapshot.summary.returned !== snapshot.summary.available) {
  throw new Error('Project Registry vazio ou truncado sem limite explícito');
}

if (snapshot.entries.some((entry) => entry.auditState === 'not-audited' && entry.decision !== 'defer')) {
  throw new Error('Project Registry promoveu entrada não auditada');
}

console.log(JSON.stringify({
  scope: snapshot.scope,
  available: snapshot.summary.available,
  returned: snapshot.summary.returned,
  truncated: snapshot.summary.truncated,
  decisions: Object.fromEntries(
    [...new Set(snapshot.entries.map((entry) => entry.decision))]
      .map((decision) => [decision, snapshot.entries.filter((entry) => entry.decision === decision).length]),
  ),
}, null, 2));
