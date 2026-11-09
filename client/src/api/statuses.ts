import { api } from './http';
import type { Status } from './types';

export const statusesApi = {
  create: (boardId: string, title: string) => api.post<Status>(`/boards/${boardId}/statuses`, { title }),
  rename: (boardId: string, statusId: string, title: string) =>
    api.patch<Status>(`/boards/${boardId}/statuses/${statusId}`, { title }),
  // Сервер откажет (409), если в колонке есть задачи
  remove: (boardId: string, statusId: string) => api.delete<void>(`/boards/${boardId}/statuses/${statusId}`),
};