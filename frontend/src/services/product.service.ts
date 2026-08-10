import { request } from './api';
import { Product, StockMovement, PaginatedResult } from '../types';

export interface GetProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStockOnly?: boolean;
}

export const getProductsApi = async (params: GetProductsParams = {}): Promise<PaginatedResult<Product>> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.category) query.append('category', params.category);
  if (params.lowStockOnly) query.append('lowStockOnly', 'true');

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResult<Product>>(`/products${queryString}`);
};

export const getProductByIdApi = async (id: string): Promise<Product> => {
  return request<Product>(`/products/${id}`);
};

export const createProductApi = async (data: Partial<Product>): Promise<Product> => {
  return request<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateProductApi = async (id: string, data: Partial<Product>): Promise<Product> => {
  return request<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const recordStockMovementApi = async (
  productId: string,
  data: { quantityChanged: number; movementType: 'IN' | 'OUT'; reason: string }
): Promise<{ movement: StockMovement; product: Product }> => {
  return request<{ movement: StockMovement; product: Product }>(`/products/${productId}/stock-movements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getStockMovementsApi = async (productId: string): Promise<StockMovement[]> => {
  return request<StockMovement[]>(`/products/${productId}/stock-movements`);
};
