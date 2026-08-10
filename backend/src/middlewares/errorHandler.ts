import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error] ${req.method} ${req.path} ->`, err);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.details);
  }

  return sendError(res, 'Internal server error occurred', 500, {
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
