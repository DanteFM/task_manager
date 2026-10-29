import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '../api/tasks';

export function useBoardTasks(boardId: string) {
  return useQuery({
    queryKey: ['boards', boardId, 'tasks'],
    queryFn: () => tasksApi.listByBoard(boardId),
  });
}