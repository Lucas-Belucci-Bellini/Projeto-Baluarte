export interface CouncilMember {
  readonly id: string;
  readonly name: string;
  readonly text: string;
  readonly ok: boolean;
  readonly rateLimited?: boolean;
}

export interface CouncilCallbacks {
  onMember?: (member: CouncilMember) => void;
}

export interface CouncilResult {
  readonly members: CouncilMember[];
  readonly consensus: string;
  readonly synthesizedBy: string;
}

export function runCouncil(question: string, callbacks?: CouncilCallbacks): Promise<CouncilResult>;
