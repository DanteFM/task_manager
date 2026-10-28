import { Spin } from 'antd';
import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '../hooks/useMe';

export default function ProtectedRoute() {
  const { data: user, isPending } = useMe();

  if (isPending) return <Spin fullscreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}