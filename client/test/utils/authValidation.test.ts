import { expect, test } from 'vitest';
import { validateLogin, validateRegister } from '@/utils/authValidation';

const valid = { name: 'Valentina Ríos', email: 'valentina@correo.com', password: 'secreto1', confirm: 'secreto1' };

test('validateLogin rejects a malformed email', () => {
  expect(validateLogin({ ...valid, email: 'valentina' }).email).toBe('Ingresa un correo válido');
});

test('validateLogin requires a password', () => {
  expect(validateLogin({ ...valid, password: '' }).password).toBe('Ingresa tu contraseña');
});

test('validateRegister accepts valid values', () => {
  expect(validateRegister(valid)).toEqual({});
});

test('validateRegister rejects a password shorter than 6 characters', () => {
  expect(validateRegister({ ...valid, password: '123', confirm: '123' }).password).toBe(
    'La contraseña debe tener entre 6 y 72 caracteres',
  );
});

test('validateRegister rejects a confirmation that does not match', () => {
  expect(validateRegister({ ...valid, confirm: 'otra-cosa' }).confirm).toBe('Las contraseñas no coinciden');
});

test('validateRegister requires a name', () => {
  expect(validateRegister({ ...valid, name: '   ' }).name).toBe('Ingresa tu nombre');
});
