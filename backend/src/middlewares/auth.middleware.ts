import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { sendError } from '../utils/response';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token missing or invalid format');
    }

    const token = authHeader.split(' ')[1];
    const decodedPayload = verifyJwtToken(token);
    req.user = decodedPayload;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Token expired, please login again', 401);
    }
    if (error.name === 'JsonWebTokenError') {
      return sendError(res, 'Invalid token payload signature', 401);
    }
    if (error instanceof UnauthorizedError) {
      return sendError(res, error.message, error.statusCode);
    }
    return sendError(res, 'Authentication failed', 401);
  }
};

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'User authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this resource. Allowed roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
};
