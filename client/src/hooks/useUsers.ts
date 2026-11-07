import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

// Исполнители для выбора в форме. enabled: грузим только когда форма открыта
// (исполнителю этот запрос вернет 403).
export function useExecutors(enabled: boolean) {
  return useQuery({
    queryKey: ['users', 'executor'],
    queryFn: () => usersApi.list('executor'),
    enabled,
  });
}