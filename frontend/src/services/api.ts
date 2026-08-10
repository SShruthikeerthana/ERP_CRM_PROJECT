import { ApiResponse } from '../types';

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export class ApiError extends Error {
  public statusCode: number;
  public details: any;

  constructor(message: string, statusCode: number = 400, details: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const request = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg = json.error?.message || 'An unexpected server error occurred';
    const errorDetails = json.error?.details || null;
    throw new ApiError(errorMsg, response.status, errorDetails);
  }

  return json.data as T;
};
