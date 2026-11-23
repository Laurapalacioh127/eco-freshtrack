// Mirrors the server rules in auth.controller.ts; keep both in sync.
export const MIN_PASSWORD_LENGTH = 6;
export const MAX_PASSWORD_LENGTH = 72;
export const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthFormValues {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>;

export const validateLogin = ({ email, password }: AuthFormValues): AuthFormErrors => {
  const errors: AuthFormErrors = {};
  const trimmed = email.trim();

  if (!trimmed || trimmed.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(trimmed)) {
    errors.email = 'Ingresa un correo válido';
  }
  if (!password) {
    errors.password = 'Ingresa tu contraseña';
  }

  return errors;
};

export const validateRegister = (values: AuthFormValues): AuthFormErrors => {
  const errors: AuthFormErrors = { ...validateLogin(values) };
  const name = values.name.trim();

  if (!name) {
    errors.name = 'Ingresa tu nombre';
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `El nombre puede tener máximo ${MAX_NAME_LENGTH} caracteres`;
  }

  if (values.password.length < MIN_PASSWORD_LENGTH || values.password.length > MAX_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`;
  }

  if (!values.confirm) {
    errors.confirm = 'Confirma tu contraseña';
  } else if (values.confirm !== values.password) {
    errors.confirm = 'Las contraseñas no coinciden';
  }

  return errors;
};
