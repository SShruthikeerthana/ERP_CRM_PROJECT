import { request } from './api';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const loginApi = async (email: string, passwordInput: string): Promise<LoginResponse> => {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: passwordInput }),
  });
};

export const getMeApi = async (): Promise<User> => {
  return request<User>('/auth/me', {
    method: 'GET',
  });
};
