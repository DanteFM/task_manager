import { Button } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { useMe } from '../hooks/useMe';

// Временная, в будущем списки досок будут здесь
export default function HomePage() {
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Чистим весь кэш, чтобы данные прошлого пользователя не показались следующему
      queryClient.setQueryData(['me'], null);
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
    },
  });

  return (
    <div style={{ padding: 24 }}>
      <p>
        {user?.email} ({user?.role})
      </p>
      <Button onClick={() => logout.mutate()} loading={logout.isPending}>
        Выйти
      </Button>
    </div>
  );
}