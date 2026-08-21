import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AUTH_EMAIL_MAX_LENGTH,
  AUTH_PASSWORD_MAX_LENGTH,
  authValidationMessage,
  normalizeAuthError,
  validateAuthForm,
} from '../src/security/auth-form-contract.ts';

test('login válido retorna somente dados bounded e comprimento da senha', () => {
  const result = validateAuthForm({ mode: 'login', email: '  lucas@example.com ', password: 'senha123' });
  assert.equal(result.valid, true);
  assert.equal(result.email, 'lucas@example.com');
  assert.equal(result.passwordLength, 8);
  assert.deepEqual(result.reasons, []);
  assert.equal(JSON.stringify(result).includes('senha123'), false);
});

test('cadastro válido exige confirmação igual', () => {
  const result = validateAuthForm({ mode: 'signup', email: 'lucas@example.com', password: 'senha123', confirmation: 'senha123' });
  assert.equal(result.valid, true);
  assert.deepEqual(result.reasons, []);
});

test('e-mail obrigatório e inválido são classificados separadamente', () => {
  assert.ok(validateAuthForm({ mode: 'login', password: 'senha123' }).reasons.includes('email-required'));
  assert.ok(validateAuthForm({ mode: 'login', email: 'fora-do-formato', password: 'senha123' }).reasons.includes('email-invalid'));
});

test('limites de e-mail e senha são bounded', () => {
  const result = validateAuthForm({
    mode: 'login',
    email: `${'a'.repeat(AUTH_EMAIL_MAX_LENGTH)}@example.com`,
    password: 'x'.repeat(AUTH_PASSWORD_MAX_LENGTH + 1),
  });
  assert.ok(result.reasons.includes('email-too-long'));
  assert.ok(result.reasons.includes('password-too-long'));
});

test('senha curta e confirmação ausente ou divergente são negadas', () => {
  const short = validateAuthForm({ mode: 'signup', email: 'lucas@example.com', password: '123', confirmation: '123' });
  assert.ok(short.reasons.includes('password-too-short'));
  const missing = validateAuthForm({ mode: 'signup', email: 'lucas@example.com', password: 'senha123' });
  assert.ok(missing.reasons.includes('confirmation-required'));
  const mismatch = validateAuthForm({ mode: 'signup', email: 'lucas@example.com', password: 'senha123', confirmation: 'outra123' });
  assert.ok(mismatch.reasons.includes('password-mismatch'));
});

test('mensagens de validação são bounded e cobrem todos os reason codes', () => {
  const reasons = [
    'email-required', 'email-invalid', 'email-too-long', 'password-too-short',
    'password-too-long', 'password-mismatch', 'confirmation-required',
  ];
  for (const reason of reasons) {
    assert.equal(typeof authValidationMessage(reason), 'string');
    assert.ok(authValidationMessage(reason).length < 120);
  }
});

test('erros conhecidos do provider são normalizados', () => {
  assert.equal(normalizeAuthError(new Error('Invalid login credentials')), 'E-mail ou senha inválidos.');
  assert.equal(normalizeAuthError(new Error('Email not confirmed')), 'Confirme seu e-mail antes de entrar.');
  assert.equal(normalizeAuthError(new Error('User already registered')), 'Este e-mail já possui uma conta.');
  assert.equal(normalizeAuthError(new Error('Failed to fetch')), 'O serviço de autenticação está indisponível. Tente novamente.');
});

test('erros desconhecidos não vazam provider, prompt, token ou segredo', () => {
  const result = normalizeAuthError(new Error('token-super-secreto prompt privado URL https://evil.example'));
  assert.equal(result, 'Não foi possível concluir a autenticação. Tente novamente.');
  assert.equal(result.includes('token-super-secreto'), false);
  assert.equal(result.includes('evil.example'), false);
});
