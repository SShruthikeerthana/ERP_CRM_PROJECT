import { request } from './api';
import { Customer, FollowUpNote, PaginatedResult } from '../types';

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export const getCustomersApi = async (params: GetCustomersParams = {}): Promise<PaginatedResult<Customer>> => {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.customerType) query.append('customerType', params.customerType);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request<PaginatedResult<Customer>>(`/customers${queryString}`);
};

export const getCustomerByIdApi = async (id: string): Promise<Customer> => {
  return request<Customer>(`/customers/${id}`);
};

export const createCustomerApi = async (data: Partial<Customer>): Promise<Customer> => {
  return request<Customer>('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateCustomerApi = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  return request<Customer>(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const addFollowUpNoteApi = async (customerId: string, noteText: string): Promise<FollowUpNote> => {
  return request<FollowUpNote>(`/customers/${customerId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note: noteText }),
  });
};
