import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boardsApi } from "../api/boards";

export function useBoards(){
  return useQuery({ queryKey: ["boards"], queryFn: boardsApi.list })
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: boardsApi.create,
    // Список на сервере изменился: перезапрашиваем. Возвращаем промис, чтобы мутация
    // считалась завершённой только после обновления списка.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });
}

export function useBoard(boardId: string) {
  return useQuery({ queryKey: ['boards', boardId], queryFn: () => boardsApi.get(boardId) });
}