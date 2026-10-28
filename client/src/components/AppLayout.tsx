import { Button, Layout, Space, Tag, Typography } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, Outlet } from 'react-router-dom';
import { authApi } from '../api/auth';
import type { Role } from '../api/types';
import { useMe } from '../hooks/useMe';

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Администратор',
  executor: 'Исполнитель',
};

export default function AppLayout() {
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
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ color: '#fff', fontWeight: 600 }}>
          Task Manager
        </Link>
        <Space>
          <Typography.Text style={{ color: '#fff' }}>{user?.email}</Typography.Text>
          {user && <Tag>{ROLE_LABEL[user.role]}</Tag>}
          <Button onClick={() => logout.mutate()} loading={logout.isPending}>
            Выйти
          </Button>
        </Space>
      </Layout.Header>
      <Layout.Content style={{ padding: 24, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
        <Outlet />
      </Layout.Content>
    </Layout>
  );
}