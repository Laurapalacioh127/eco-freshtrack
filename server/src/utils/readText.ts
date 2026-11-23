import Boom from '@hapi/boom';

const DEFAULT_MAX_LENGTH = 300;

// Validates a required string field from a request body and returns it trimmed.
// Throws 400 with a Spanish message naming the field (shown to the user).
export const readRequiredText = (
  body: Record<string, unknown>,
  field: string,
  label: string,
  maxLength: number = DEFAULT_MAX_LENGTH,
): string => {
  const value = body[field];

  if (typeof value !== 'string' || !value.trim()) {
    throw Boom.badRequest(`El campo "${label}" es obligatorio`);
  }

  if (value.trim().length > maxLength) {
    throw Boom.badRequest(`El campo "${label}" no puede superar ${maxLength} caracteres`);
  }

  return value.trim();
};
