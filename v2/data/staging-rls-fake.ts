import {
  STAGING_RLS_SCENARIOS,
  type RlsExpectation,
  type RlsOperation,
  type StagingPrincipal,
  type StagingRlsScenario,
} from './staging-rls-matrix.ts';

/**
 * Executor local somente para contrato e testes.
 * Não importa este arquivo no frontend e não o trate como implementação de RLS.
 */

export interface FakePrincipal {
  readonly kind: StagingPrincipal;
  readonly id: string | null;
  readonly role: 'anonymous' | 'user' | 'operator';
}

export interface FakeProfile {
  readonly id: string;
  displayName: string;
  readonly fixtureId: string;
}

export interface FakeMemory {
  readonly id: string;
  readonly userId: string;
  content: string;
  readonly fixtureId: string;
}

export interface FakeMuralPost {
  readonly id: string;
  readonly authorId: string;
  content: string;
  readonly fixtureId: string;
}

export interface FakeRlsSnapshot {
  readonly profiles: readonly FakeProfile[];
  readonly memories: readonly FakeMemory[];
  readonly muralPosts: readonly FakeMuralPost[];
}

export interface FakeRlsAuditEntry {
  readonly type: 'fake.rls.decision';
  readonly scenarioId: string;
  readonly principal: StagingPrincipal;
  readonly table: string;
  readonly operation: RlsOperation;
  readonly decision: RlsExpectation;
  readonly changed: boolean;
  readonly timestamp: number;
}

export interface FakeRlsExecution {
  readonly decision: RlsExpectation;
  readonly rows: readonly unknown[];
  readonly changed: boolean;
}

export interface FakeRlsScenarioResult {
  readonly id: string;
  readonly expected: RlsExpectation;
  readonly observed: RlsExpectation;
  readonly changed: boolean;
  readonly rows: readonly unknown[];
  readonly before: FakeRlsSnapshot;
  readonly after: FakeRlsSnapshot;
}

export interface FakeRlsHarness {
  readonly seedFixtures: () => void;
  readonly executeScenario: (scenarioId: string) => FakeRlsScenarioResult;
  readonly runMatrix: () => readonly FakeRlsScenarioResult[];
  readonly snapshot: () => FakeRlsSnapshot;
  readonly audit: () => readonly FakeRlsAuditEntry[];
  readonly cleanup: () => { removed: number };
}

const FIXTURE_IDS = Object.freeze({
  profile: 'fixture-profile-u1',
  memory: 'fixture-memory-u1',
  operatorPost: 'fixture-mural-operator',
});

const U1: FakePrincipal = Object.freeze({ kind: 'owner', id: 'U1', role: 'user' });
const U2: FakePrincipal = Object.freeze({ kind: 'non-owner', id: 'U2', role: 'user' });
const ANON: FakePrincipal = Object.freeze({ kind: 'anonymous', id: null, role: 'anonymous' });
const OPERATOR: FakePrincipal = Object.freeze({ kind: 'operator', id: 'OP1', role: 'operator' });

function clone<T>(value: T): T {
  return structuredClone(value);
}

function principalFor(kind: StagingPrincipal): FakePrincipal {
  if (kind === 'owner') return U1;
  if (kind === 'non-owner') return U2;
  if (kind === 'operator') return OPERATOR;
  return ANON;
}

function scenarioOrThrow(id: string): StagingRlsScenario {
  const scenario = STAGING_RLS_SCENARIOS.find((candidate) => candidate.id === id);
  if (!scenario) throw new Error(`cenário RLS desconhecido: ${id}`);
  return scenario;
}

export function criarFakeStagingRls(
  options: { readonly clock?: () => number } = {},
): FakeRlsHarness {
  const clock = options.clock ?? (() => Date.now());
  const profiles = new Map<string, FakeProfile>();
  const memories = new Map<string, FakeMemory>();
  const muralPosts = new Map<string, FakeMuralPost>();
  const auditEntries: FakeRlsAuditEntry[] = [];

  function snapshot(): FakeRlsSnapshot {
    return clone({
      profiles: [...profiles.values()],
      memories: [...memories.values()],
      muralPosts: [...muralPosts.values()],
    });
  }

  function seedFixtures(): void {
    profiles.set(FIXTURE_IDS.profile, {
      id: 'U1',
      displayName: 'Fixture U1',
      fixtureId: FIXTURE_IDS.profile,
    });
    memories.set(FIXTURE_IDS.memory, {
      id: 'memory-u1',
      userId: 'U1',
      content: 'fixture-memory-content',
      fixtureId: FIXTURE_IDS.memory,
    });
    muralPosts.delete(FIXTURE_IDS.operatorPost);
  }

  function execute(
    scenario: StagingRlsScenario,
    principal: FakePrincipal,
  ): FakeRlsExecution {
    const profile = profiles.get(FIXTURE_IDS.profile);
    const memory = memories.get(FIXTURE_IDS.memory);
    const hasOwner = principal.kind === 'owner' && principal.id === 'U1';
    const hasOperatorPolicy = principal.kind === 'operator' && principal.role === 'operator';

    if (scenario.table === 'profiles' && scenario.operation === 'select') {
      return hasOwner && profile
        ? { decision: 'allow', rows: [clone(profile)], changed: false }
        : { decision: 'empty', rows: [], changed: false };
    }

    if (scenario.table === 'profiles' && scenario.operation === 'update') {
      if (!hasOwner || !profile) return { decision: 'deny', rows: [], changed: false };
      profile.displayName = 'Fixture U1 updated by owner';
      return { decision: 'allow', rows: [clone(profile)], changed: true };
    }

    if (scenario.table === 'memories' && scenario.operation === 'select') {
      return hasOwner && memory
        ? { decision: 'allow', rows: [clone(memory)], changed: false }
        : { decision: 'empty', rows: [], changed: false };
    }

    if (scenario.table === 'memories' && scenario.operation === 'delete') {
      return { decision: 'deny', rows: [], changed: false };
    }

    if (scenario.table === 'mural_posts' && scenario.operation === 'insert') {
      if (!hasOperatorPolicy) return { decision: 'deny', rows: [], changed: false };
      const post: FakeMuralPost = {
        id: FIXTURE_IDS.operatorPost,
        authorId: principal.id ?? 'unknown',
        content: 'fixture operator post',
        fixtureId: FIXTURE_IDS.operatorPost,
      };
      muralPosts.set(post.id, post);
      return { decision: 'allow', rows: [clone(post)], changed: true };
    }

    throw new Error(`operação RLS fake não implementada: ${scenario.table}.${scenario.operation}`);
  }

  function executeScenario(scenarioId: string): FakeRlsScenarioResult {
    const scenario = scenarioOrThrow(scenarioId);
    const principal = principalFor(scenario.principal);
    const before = snapshot();
    const result = execute(scenario, principal);
    const after = snapshot();
    auditEntries.push({
      type: 'fake.rls.decision',
      scenarioId: scenario.id,
      principal: scenario.principal,
      table: scenario.table,
      operation: scenario.operation,
      decision: result.decision,
      changed: result.changed,
      timestamp: clock(),
    });
    return {
      id: scenario.id,
      expected: scenario.expectation,
      observed: result.decision,
      changed: result.changed,
      rows: clone(result.rows),
      before,
      after,
    };
  }

  function runMatrix(): readonly FakeRlsScenarioResult[] {
    seedFixtures();
    return STAGING_RLS_SCENARIOS.map(({ id }) => executeScenario(id));
  }

  function audit(): readonly FakeRlsAuditEntry[] {
    return clone(auditEntries);
  }

  function cleanup(): { removed: number } {
    let removed = 0;
    for (const table of [profiles, memories, muralPosts]) {
      for (const [id, row] of table.entries()) {
        if ('fixtureId' in row && Object.values(FIXTURE_IDS).includes(row.fixtureId)) {
          table.delete(id);
          removed += 1;
        }
      }
    }
    return { removed };
  }

  return { seedFixtures, executeScenario, runMatrix, snapshot, audit, cleanup };
}
