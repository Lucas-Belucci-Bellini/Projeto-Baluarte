export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
}

export function initToast(): void;
export function toast(message: string, options?: ToastOptions): void;
