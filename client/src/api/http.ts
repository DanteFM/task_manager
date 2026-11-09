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

// Текст по умолчанию, когда сервер не прислал свой
function fallbackMessage(status: number): string {
  return status >= 500 ? 'Сервер недоступен, попробуйте позже' : 'Ошибка запроса';
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch бросает исключение, когда до сервера вообще не достучаться (нет сети)
    throw new ApiError(0, 'Нет связи с сервером. Проверьте подключение');
  }

  // 204 No Content: тела нет
  if (res.status === 204) return undefined as T;

  // Тело может оказаться не JSON (например, при падении прокси), поэтому разбор защищён
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.message || fallbackMessage(res.status), data?.errors);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};