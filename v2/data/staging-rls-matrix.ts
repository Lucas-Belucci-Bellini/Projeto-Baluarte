export type StagingPrincipal = 'anonymous' | 'owner' | 'non-owner' | 'operator';
export type RlsExpectation = 'allow' | 'deny' | 'empty';
export type RlsOperation = 'select' | 'insert' | 'update' | 'delete';

export interface StagingRlsScenario {
  readonly id: string;
  readonly principal: StagingPrincipal;
  readonly table: string;
  readonly operation: RlsOperation;
  readonly expectation: RlsExpectation;
  readonly setup: string;
  readonly cleanup: string;
  readonly rationale: string;
}

export const STAGING_RLS_SCENARIOS: readonly StagingRlsScenario[] = Object.freeze([
  {
    id: 'anon-profile-select',
    principal: 'anonymous',
    table: 'profiles',
    operation: 'select',
    expectation: 'empty',
    setup: 'Nenhum token de sessão.',
    cleanup: 'Nenhuma linha criada.',
    rationale: 'Perfil não é leitura pública; RLS deve impedir exposição para anon.',
  },
  {
    id: 'owner-profile-select',
    principal: 'owner',
    table: 'profiles',
    operation: 'select',
    expectation: 'allow',
    setup: 'Usuário U1 autenticado e linha profiles.id = U1.',
    cleanup: 'Remover fixture U1.',
    rationale: 'O dono pode ler o próprio perfil.',
  },
  {
    id: 'owner-profile-update',
    principal: 'owner',
    table: 'profiles',
    operation: 'update',
    expectation: 'allow',
    setup: 'Usuário U1 autenticado e linha profiles.id = U1.',
    cleanup: 'Restaurar/remover fixture U1.',
    rationale: 'O dono pode atualizar somente a própria linha.',
  },
  {
    id: 'non-owner-profile-select',
    principal: 'non-owner',
    table: 'profiles',
    operation: 'select',
    expectation: 'empty',
    setup: 'Usuário U2 autenticado tentando ler linha profiles.id = U1.',
    cleanup: 'Nenhuma linha criada.',
    rationale: 'Usuário autenticado não deve ler perfil de outro usuário.',
  },
  {
    id: 'non-owner-profile-update',
    principal: 'non-owner',
    table: 'profiles',
    operation: 'update',
    expectation: 'deny',
    setup: 'Usuário U2 autenticado tentando atualizar linha profiles.id = U1.',
    cleanup: 'Nenhuma alteração deve persistir.',
    rationale: 'RLS deve bloquear alteração cross-user.',
  },
  {
    id: 'owner-memory-select',
    principal: 'owner',
    table: 'memories',
    operation: 'select',
    expectation: 'allow',
    setup: 'Usuário U1 autenticado e memory.user_id = U1.',
    cleanup: 'Remover fixture de memória U1.',
    rationale: 'Memória persistida é propriedade do usuário.',
  },
  {
    id: 'non-owner-memory-delete',
    principal: 'non-owner',
    table: 'memories',
    operation: 'delete',
    expectation: 'deny',
    setup: 'Usuário U2 autenticado tentando excluir memory.user_id = U1.',
    cleanup: 'Confirmar que a memória U1 permanece.',
    rationale: 'Exclusão cross-user é proibida.',
  },
  {
    id: 'operator-mural-insert',
    principal: 'operator',
    table: 'mural_posts',
    operation: 'insert',
    expectation: 'allow',
    setup: 'Usuário operador autenticado conforme policy server-side aprovada.',
    cleanup: 'Remover post de teste pelo identificador da fixture.',
    rationale: 'Operação administrativa depende de policy server-side, nunca da UI.',
  },
  {
    id: 'owner-mural-insert',
    principal: 'owner',
    table: 'mural_posts',
    operation: 'insert',
    expectation: 'deny',
    setup: 'Usuário autenticado comum sem autorização operacional.',
    cleanup: 'Nenhuma linha deve ser criada.',
    rationale: 'Identidade autenticada não implica privilégio administrativo.',
  },
] as const);
