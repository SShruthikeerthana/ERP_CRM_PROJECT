export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    message: string;
    details?: any;
  } | null;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: string;
}
