import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { tasksApi } from '../api/tasks';
import type { Task } from '../api/types';

export function useBoardTasks(boardId: string) {
  return useQuery({
    queryKey: ['boards', boardId, 'tasks'],
    queryFn: () => tasksApi.listByBoard(boardId),
  });
}

export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();
  const tasksKey = ['boards', boardId, 'tasks'];

  return useMutation({
    mutationFn: ({ taskId, statusId }: { taskId: string; statusId: string }) =>
      tasksApi.changeStatus(taskId, statusId),

    // Оптимистичное обновление: карточка переезжает сразу, не дожидаясь сервера
    onMutate: async ({ taskId, statusId }) => {
      // Отменяем текущие загрузки списка, иначе их ответ перезапишет наше изменение
      await queryClient.cancelQueries({ queryKey: tasksKey });
      const previous = queryClient.getQueryData<Task[]>(tasksKey);
      queryClient.setQueryData<Task[]>(tasksKey, (tasks) =>
        tasks?.map((task) => (task._id === taskId ? { ...task, statusId } : task)),
      );
      return { previous };
    },

    // Ошибка сервера (нет прав, задачу удалили и т.д.): возвращаем как было и показываем причину
    onError: (error, _variables, context) => {
      queryClient.setQueryData(tasksKey, context?.previous);
      message.error(error.message);
    },

    // В любом случае сверяемся с сервером
    onSettled: () => queryClient.invalidateQueries({ queryKey: tasksKey }),
  });
}