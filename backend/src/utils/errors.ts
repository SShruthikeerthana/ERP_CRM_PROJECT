export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details: any;

  constructor(message: string, statusCode: number = 400, details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error', details: any = null) {
    super(message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized access', details: any = null) {
    super(message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied. Insufficient permissions.', details: any = null) {
    super(message, 403, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details: any = null) {
    super(message, 404, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict error', details: any = null) {
    super(message, 409, details);
  }
}
