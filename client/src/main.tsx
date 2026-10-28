import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from './api/http';
import App from './App.tsx';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // Токен истёк посреди работы: считаем пользователя вышедшим,
      // ProtectedRoute сам отправит на /login.
      if (error instanceof ApiError && error.status === 401) {
        queryClient.setQueryData(['me'], null);
      }
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);