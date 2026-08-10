import { request } from './api';
import { Challan, PaginatedResult } from '../types';

export interface GetChallansParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
}

export interface CreateChallanInput {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const getChallansApi = async (params: GetChallansParams = {}): Promise<PaginatedResult<Challan>> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.customerId) query.append('customerId', params.customerId);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResult<Challan>>(`/challans${queryString}`);
};

export const getChallanByIdApi = async (id: string): Promise<Challan> => {
  return request<Challan>(`/challans/${id}`);
};

export const createChallanApi = async (input: CreateChallanInput): Promise<Challan> => {
  return request<Challan>('/challans', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const updateChallanApi = async (id: string, input: Partial<CreateChallanInput>): Promise<Challan> => {
  return request<Challan>(`/challans/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
};

export const confirmChallanApi = async (id: string): Promise<Challan> => {
  return request<Challan>(`/challans/${id}/confirm`, {
    method: 'POST',
  });
};

export const cancelChallanApi = async (id: string): Promise<Challan> => {
  return request<Challan>(`/challans/${id}/cancel`, {
    method: 'POST',
  });
};
