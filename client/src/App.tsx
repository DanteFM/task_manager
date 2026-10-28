import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}