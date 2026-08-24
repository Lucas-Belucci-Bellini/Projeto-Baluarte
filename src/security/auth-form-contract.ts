export const AUTH_FORM_CONTRACT_VERSION = 'login-typescript/v1' as const;
export const AUTH_EMAIL_MAX_LENGTH = 254;
export const AUTH_PASSWORD_MIN_LENGTH = 6;
export const AUTH_PASSWORD_MAX_LENGTH = 128;

export type AuthFormMode = 'login' | 'signup';

export type AuthValidationReason =
  | 'email-required'
  | 'email-invalid'
  | 'email-too-long'
  | 'password-too-short'
  | 'password-too-long'
  | 'password-mismatch'
  | 'confirmation-required';

export interface AuthFormInput {
  readonly mode: AuthFormMode;
  readonly email?: unknown;
  readonly password?: unknown;
  readonly confirmation?: unknown;
}

export interface AuthFormValidation {
  readonly contractVersion: typeof AUTH_FORM_CONTRACT_VERSION;
  readonly valid: boolean;
  readonly mode: AuthFormMode;
  readonly email: string;
  readonly passwordLength: number;
  readonly reasons: readonly AuthValidationReason[];
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateAuthForm(input: AuthFormInput): AuthFormValidation {
  const email = text(input.email);
  const password = typeof input.password === 'string' ? input.password : '';
  const confirmation = typeof input.confirmation === 'string' ? input.confirmation : '';
  const reasons: AuthValidationReason[] = [];

  if (!email) reasons.push('email-required');
  else if (email.length > AUTH_EMAIL_MAX_LENGTH) reasons.push('email-too-long');
  else if (!EMAIL_PATTERN.test(email)) reasons.push('email-invalid');

  if (password.length < AUTH_PASSWORD_MIN_LENGTH) reasons.push('password-too-short');
  if (password.length > AUTH_PASSWORD_MAX_LENGTH) reasons.push('password-too-long');

  if (input.mode === 'signup') {
    if (!confirmation) reasons.push('confirmation-required');
    else if (password !== confirmation) reasons.push('password-mismatch');
  }

  return Object.freeze({
    contractVersion: AUTH_FORM_CONTRACT_VERSION,
    valid: reasons.length === 0,
    mode: input.mode,
    email,
    passwordLength: password.length,
    reasons: Object.freeze(reasons),
  });
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message.toLowerCase() : '';
}

export function authValidationMessage(reason: AuthValidationReason): string {
  switch (reason) {
    case 'email-required': return 'Informe seu e-mail.';
    case 'email-invalid': return 'Informe um e-mail válido.';
    case 'email-too-long': return 'O e-mail excede o limite permitido.';
    case 'password-too-short': return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'password-too-long': return 'A senha excede o limite permitido.';
    case 'password-mismatch': return 'As senhas não coincidem.';
    case 'confirmation-required': return 'Confirme sua senha.';
  }
}

export function normalizeAuthError(error: unknown): string {
  const message = errorText(error);
  if (message.includes('invalid login credentials') || message.includes('e-mail ou senha inválidos')) {
    return 'E-mail ou senha inválidos.';
  }
  if (message.includes('email not confirmed') || message.includes('confirme seu e-mail')) {
    return 'Confirme seu e-mail antes de entrar.';
  }
  if (message.includes('already registered') || message.includes('already exists') || message.includes('já cadastrado')) {
    return 'Este e-mail já possui uma conta.';
  }
  if (message.includes('not configured') || message.includes('não configurado') || message.includes('indisponível')) {
    return 'Autenticação indisponível neste ambiente.';
  }
  if (message.includes('timeout') || message.includes('aborted') || message.includes('failed to fetch') || message.includes('network')) {
    return 'O serviço de autenticação está indisponível. Tente novamente.';
  }
  return 'Não foi possível concluir a autenticação. Tente novamente.';
}
