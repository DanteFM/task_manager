import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/boards";
import { App } from 'antd';

export function useBoards(){
  return useQuery({ queryKey: ["boards"], queryFn: boardsApi.list })
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: boardsApi.create,
    // Список на сервере изменился: перезапрашиваем. Возвращаем промис, чтобы мутация
    // считалась завершённой только после обновления списка.
    onSuccess: () => {
      message.success('Доска создана');
      return queryClient.invalidateQueries({ queryKey: ['boards'] });
    }
  });
}

export function useBoard(boardId: string) {
  return useQuery({ queryKey: ['boards', boardId], queryFn: () => boardsApi.get(boardId) });
}