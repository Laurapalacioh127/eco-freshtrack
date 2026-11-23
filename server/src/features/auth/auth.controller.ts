import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import { loginService, refreshService, registerService } from './auth.service';

// Supabase's default minimum; keep both in sync if the project setting changes.
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readBody = (req: Request): Record<string, unknown> =>
  typeof req.body === 'object' && req.body !== null ? (req.body as Record<string, unknown>) : {};

const readEmail = (body: Record<string, unknown>): string => {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_REGEX.test(email)) {
    throw Boom.badRequest('Ingresa un correo válido');
  }

  return email;
};

const readPassword = (body: Record<string, unknown>): string => {
  const password = typeof body.password === 'string' ? body.password : '';

  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw Boom.badRequest(
      `La contraseña debe tener entre ${MIN_PASSWORD_LENGTH} y ${MAX_PASSWORD_LENGTH} caracteres`,
    );
  }

  return password;
};

export const registerController = async (req: Request, res: Response) => {
  const body = readBody(req);
  const email = readEmail(body);
  const password = readPassword(body);
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!name || name.length > MAX_NAME_LENGTH) {
    throw Boom.badRequest(`El nombre es obligatorio (máximo ${MAX_NAME_LENGTH} caracteres)`);
  }

  res.status(201).json(await registerService({ email, password, name }));
};

export const loginController = async (req: Request, res: Response) => {
  const body = readBody(req);
  const email = readEmail(body);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!password) {
    throw Boom.badRequest('Ingresa tu contraseña');
  }

  res.json(await loginService({ email, password }));
};

export const refreshController = async (req: Request, res: Response) => {
  const body = readBody(req);
  const refreshToken = typeof body.refreshToken === 'string' ? body.refreshToken.trim() : '';

  if (!refreshToken) {
    throw Boom.badRequest('Falta el refreshToken');
  }

  res.json(await refreshService({ refreshToken }));
};
