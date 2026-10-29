import { api } from './http';
import type { Board, BoardWithStatuses } from './types';

export const boardsApi = {
  list: () => api.get<Board[]>('/boards'),
  create: (data: { title: string }) => api.post('/boards', data),
  get: (boardId: string) => api.get<BoardWithStatuses>(`/boards/${boardId}`),
};