import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { getUserFromTokenService } from '../features/auth/auth.service';
import { AuthUser } from '../features/auth/auth.types';
import { UserRole } from '../features/users/user.types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const [scheme, token, ...rest] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token || rest.length > 0) {
    throw Boom.unauthorized('Falta el token de acceso o tiene un formato inválido');
  }

  req.user = await getUserFromTokenService(token);
  next();
};

// Authorization on top of authentication: must run after authMiddleware.
export const requireRole =
  (...roles: UserRole[]) =>
    (req: Request, _res: Response, next: NextFunction) => {
      if (!req.user) {
        throw Boom.unauthorized('Usuario no autenticado');
      }

      if (!roles.includes(req.user.role)) {
        throw Boom.forbidden('No tienes permisos para realizar esta acción');
      }

      next();
    };

export const getUserFromRequest = (req: Request): AuthUser => {
  if (!req.user) {
    throw Boom.unauthorized('Usuario no autenticado');
  }

  return req.user;
};

// Admins see every record; households only their own. Returns null for "no filter".
export const getScopeUserId = (req: Request): string | null => {
  const user = getUserFromRequest(req);
  return user.role === 'admin' ? null : user.id;
};
