import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { tagsApi } from '../api/tags';

export function useTags(enabled: boolean) {
  return useQuery({ queryKey: ['tags'], queryFn: tagsApi.list, enabled });
}

export function useCreateTag() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (name: string) => tagsApi.create(name),
    onSuccess: () => {
      message.success('Тег создан');
      // Дожидаемся обновления списка: тег уже должен быть среди вариантов, когда мы его выберем
      return queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error) => {
      message.error(error.message);
    }
  });
}