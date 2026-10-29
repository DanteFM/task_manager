import { api } from './http';
import type { Task } from './types';

export const tasksApi = {
  listByBoard: (boardId: string) => api.get<Task[]>(`/boards/${boardId}/tasks`),
  changeStatus: (taskId: string, statusId: string) =>
    api.patch<unknown>(`/tasks/${taskId}/status`, { statusId }),
};