export interface GitCommand {
  readonly cmd: string;
  readonly desc: string;
}

export interface GitSection {
  readonly grupo: string;
  readonly icon: string;
  readonly comandos: readonly GitCommand[];
}

export interface GitignoreTemplate {
  readonly nome: string;
  readonly conteudo: string;
}

export const GIT_SECTIONS: readonly GitSection[];
export const GITIGNORE_TEMPLATES: readonly GitignoreTemplate[];
