import { Response } from 'express';
import { ApiResponse } from '../types/api';

export const sendSuccess = <T>(res: Response, data: T, statusCode: number = 200): Response => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode: number = 400,
  details: any = null
): Response => {
  const response: ApiResponse = {
    success: false,
    data: null,
    error: {
      message,
      ...(details && { details }),
    },
  };
  return res.status(statusCode).json(response);
};
