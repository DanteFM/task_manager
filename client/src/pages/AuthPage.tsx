import { Alert, Button, Card, Form, Input } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { authApi, type RegisterData } from '../api/auth';
import { meQueryOptions } from '../hooks/useMe';

interface Props {
  mode: 'login' | 'register';
}

export default function AuthPage({ mode }: Props) {
  const isLogin = mode === 'login';
  const queryClient = useQueryClient();

  const submit = useMutation({
    mutationFn: (data: RegisterData) =>
      isLogin ? authApi.login({ email: data.email, password: data.password }) : authApi.register(data),
    // перезапрашиваем /me для получения инфы по пользователю, т.к. куки с токеном уже поставлены сервером
    onSuccess: () => queryClient.query({ ...meQueryOptions, staleTime: 0 }),
  });

  return (
    <Card title={isLogin ? 'Вход' : 'Регистрация'} style={{ width: 360, margin: '15vh auto 0' }}>
      {submit.error && (
        <Alert type="error" showIcon message={submit.error.message} style={{ marginBottom: 16 }} />
      )}
      <Form<RegisterData> layout="vertical" onFinish={(values) => submit.mutate(values)}>
        {!isLogin && (
          <>
            <Form.Item
              name="firstName"
              label="Имя"
              rules={[{ required: true, whitespace: true, message: 'Введите имя' }]}
            >
              <Input maxLength={50} autoComplete="given-name" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Фамилия"
              rules={[{ required: true, whitespace: true, message: 'Введите фамилию' }]}
            >
              <Input maxLength={50} autoComplete="family-name" />
            </Form.Item>
          </>
        )}
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
        {isLogin ? (
          <Link to="/register">Нет аккаунта? Регистрация</Link>
        ) : (
          <Link to="/login">Уже есть аккаунт? Войти</Link>
        )}
      </div>
    </Card>
  );
}