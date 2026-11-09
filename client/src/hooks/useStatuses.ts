import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { statusesApi } from '../api/statuses';

function useStatusMutation<V>(boardId: string, mutationFn: (variables: V) => Promise<unknown>) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn,
    // exact: только саму доску, задачи перезагружать незачем
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards', boardId], exact: true }),
    onError: (error) => {
      message.error(error.message);
    }
  });
}

export const useAddStatus = (boardId: string) =>
  useStatusMutation(boardId, (title: string) => statusesApi.create(boardId, title));

export const useRenameStatus = (boardId: string) =>
  useStatusMutation(boardId, ({ statusId, title }: { statusId: string; title: string }) =>
    statusesApi.rename(boardId, statusId, title),
  );

export const useDeleteStatus = (boardId: string) =>
  useStatusMutation(boardId, (statusId: string) => statusesApi.remove(boardId, statusId));