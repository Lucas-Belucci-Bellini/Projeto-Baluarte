export interface AuthUser { readonly id: string; readonly email: string; readonly meta: Readonly<Record<string, unknown>>; }
export function onAuthChange(listener: (session: unknown) => void): () => boolean;
export function isLoggedIn(): boolean;
export function currentUser(): AuthUser | null;
export function signInWithGoogle(): void;
export interface SignUpResult { readonly confirmed: boolean; }
export function signUpWithPassword(email: string, password: string): Promise<SignUpResult>;
export function signInWithPassword(email: string, password: string): Promise<void>;
export function signOut(): Promise<void>;
export function getAccessToken(): Promise<string | null>;
export function handleAuthRedirect(): boolean;
