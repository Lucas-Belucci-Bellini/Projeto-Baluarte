export interface CommsMessage { readonly id: string | number; readonly user_id: string; readonly author: string; readonly text: string; readonly created_at: string; }
export interface CommsStatus { readonly connected: boolean; }
export interface CommsOptions { readonly onMessage?: (message: CommsMessage) => void; readonly onStatus?: (status: CommsStatus) => void; }
export interface CommsHandle { history(limit?: number): Promise<readonly CommsMessage[]>; send(text: string): Promise<CommsMessage | null>; close(): void; }
export function openComms(options?: CommsOptions): CommsHandle;
