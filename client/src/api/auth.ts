import { api } from './http';
import type { User } from './types';

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterData extends Credentials {
  firstName: string;
  lastName: string;
}

export const authApi = {
  me: () => api.get<User>('/me'),
  login: (data: Credentials) => api.post<{ user: User }>('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
  logout: () => api.post<void>('/auth/logout'),
};