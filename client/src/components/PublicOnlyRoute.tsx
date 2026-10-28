import { Spin } from 'antd';
import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useMe';

// Страницы для гостей (вход, регистрация). Пока неизвестно, вошёл ли человек, показываем загрузку,
// чтобы форма не мелькала перед редиректом. Вошедшего отправляем на главную.
export default function PublicOnlyRoute() {
  const { data: user, isPending } = useMe();

  if (isPending) return <Spin fullscreen />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}