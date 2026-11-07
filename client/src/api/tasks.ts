import { api } from './http';
import type { Priority, Task } from './types';

export interface TaskInput {
  title: string;
  description?: string;
  priority: Priority;
  statusId?: string;
  assigneeId?: string | null;
  tags: string[];
}

// Поля правки: любые из полей создания, кроме статуса (статус меняется перетаскиванием)
export type TaskUpdate = Partial<Omit<TaskInput, 'statusId'>>;

export const tasksApi = {
  listByBoard: (boardId: string) => api.get<Task[]>(`/boards/${boardId}/tasks`),
  changeStatus: (taskId: string, statusId: string) =>
    api.patch<unknown>(`/tasks/${taskId}/status`, { statusId }),
  create: (boardId: string, data: TaskInput) => api.post<unknown>(`/boards/${boardId}/tasks`, data),
  update: (taskId: string, data: TaskUpdate) => api.patch<unknown>(`/tasks/${taskId}`, data),
  remove: (taskId: string) => api.delete<void>(`/tasks/${taskId}`),
};