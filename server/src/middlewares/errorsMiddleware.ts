import { NextFunction, Request, Response } from 'express';
import Boom from '@hapi/boom';

export const errorsMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const boom = Boom.isBoom(err) ? err : Boom.internal();
  res.status(boom.output.statusCode).json(boom.output.payload);
};