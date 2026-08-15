export interface PerfilSocial {
  readonly rede: string;
  readonly user: string;
  readonly url: string;
  readonly icone: string;
  readonly cor: string;
  readonly desc: string;
}

export const PERFIS: readonly PerfilSocial[];
