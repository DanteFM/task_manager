// Обертка над ошибкой API: добавляем HTTP-статус и описание полей из ответа сервера ({ message, errors })
export class ApiError extends Error {
  status: number;
  errors?: unknown;

  constructor(status: number, message: string, errors?: unknown) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body !== undefined ? { 'Content-Type': "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content: тела нет
  if (res.status === 204) return undefined as T;

  // Тело может оказаться не JSON (например, при падении прокси), поэтому разбор защищён
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? "", data?.errors);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};