export interface UserProfile {
  readonly id?: string;
  readonly display_name?: string | null;
  readonly theme?: string | null;
  readonly universe?: string | null;
  readonly favorites?: unknown;
  readonly prefs?: unknown;
  readonly [key: string]: unknown;
}

export interface UserProfilePatch {
  readonly theme?: string;
  readonly universe?: string;
  readonly display_name?: string;
  readonly favorites?: unknown;
  readonly prefs?: unknown;
}

export function loadProfile(): Promise<UserProfile | null>;
export function saveProfile(patch: UserProfilePatch): Promise<UserProfile | null>;
