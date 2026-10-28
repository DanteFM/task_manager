import { queryOptions, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { ApiError } from '../api/http';

// Текущий пользователь. Единый источник правды о том, авторизован ли пользователь.
// data === null означает «не авторизован» (это не ошибка), undefined — ещё грузится.
export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    try {
      return await authApi.me();
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null;
      throw e;
    }
  },
  staleTime: Infinity // пока не обновлено - данные актуальны
});

export function useMe() {
  return useQuery(meQueryOptions);
}