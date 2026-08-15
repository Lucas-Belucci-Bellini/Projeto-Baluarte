export type SkillCategoryId = 'core' | 'dev' | 'research' | 'creative' | 'ops';

export interface SkillCategory {
  readonly id: SkillCategoryId;
  readonly label: string;
  readonly color: string;
}

export interface Skill {
  readonly id: string;
  readonly name: string;
  readonly category: SkillCategoryId;
  readonly trigger: string;
  readonly version?: string;
  readonly body: string;
}

export const SKILL_CATEGORIES: readonly SkillCategory[];
export const BUILTIN_SKILLS: readonly Skill[];
export function skillToMarkdown(skill: Skill): string;
