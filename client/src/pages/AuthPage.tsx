import { Alert, Button, Card, Form, Input } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, Navigate  } from 'react-router-dom';
import { authApi, type Credentials } from '../api/auth';
import { meQueryOptions, useMe } from '../hooks/useMe';

interface Props {
  mode: 'login' | 'register';
}

export default function AuthPage({ mode }: Props) {
  const isLogin = mode === "login";
  const queryClient = useQueryClient();
  const { data: user } = useMe();

  const submit = useMutation({
    mutationFn: (data: Credentials) => (isLogin ? authApi.login(data) : authApi.register(data)),
    // перезапрашиваем /me для получения инфы по пользователю, т.к. куки с токеном уже поставлены сервером
    onSuccess: async () => queryClient.query({ ...meQueryOptions, staleTime: 0 }),
  });

  if (user) return <Navigate to="/" replace />;

  return(
    <Card title={isLogin ? 'Вход' : 'Регистрация'} style={{ width: 360, margin: '15vh auto 0' }}>
      {submit.error && (
        <Alert type="error" showIcon message={submit.error.message} style={{ marginBottom: 16 }} />
      )}
      <Form<Credentials> layout="vertical" onFinish={(values) => submit.mutate(values)}>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, type: 'email', message: 'Введите корректный email' }]}
        >
          <Input autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Пароль"
          rules={[
            { required: true, message: 'Введите пароль' },
            ...(isLogin ? [] : [{ min: 8, message: 'Не короче 8 символов' }]),
          ]}
        >
          <Input.Password autoComplete={isLogin ? 'current-password' : 'new-password'} />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={submit.isPending}>
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </Button>
      </Form>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        {isLogin ? <Link to="/register">Нет аккаунта? Регистрация</Link> : <Link to="/login">Уже есть аккаунт? Войти</Link>}
      </div>
    </Card>
  );
}