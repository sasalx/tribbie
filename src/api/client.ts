export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, ...init } = options

  let url = `${import.meta.env.VITE_API_BASE_URL}${endpoint}`

  if (params) {
    url += `?${new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    )}`
  }

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    ...init,
  })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'GET', ...options }),

  post: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  put: <T>(endpoint: string, body: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { method: 'DELETE', ...options }),
}
