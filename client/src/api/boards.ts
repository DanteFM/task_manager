import { api } from './http';
import type { Board } from './types';

export const boardsApi = {
  list: () => api.get<Board[]>('/boards'),
  create: (data: { title: string }) => api.post('/boards', data),
};