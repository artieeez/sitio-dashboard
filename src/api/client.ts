const base = import.meta.env.VITE_API_BASE_URL ?? '';

export type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

function buildHeaders(
  extra?: Record<string, string>,
  jsonBody?: boolean,
): HeadersInit {
  const h: Record<string, string> = {
    ...(extra ?? {}),
  };
  if (jsonBody) {
    h['Content-Type'] = 'application/json';
  }
  const userId = import.meta.env.VITE_DEV_USER_ID;
  if (userId && !h['x-auth-user-id'] && !h['x-share-link-authenticated']) {
    h['x-auth-user-id'] = userId;
  }
  return h;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers } = options;
  const url = `${base.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    method,
    headers: buildHeaders(headers, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function shareLinkHeaders(token: string): Record<string, string> {
  return {
    'x-share-link-authenticated': 'true',
    Authorization: `Bearer ${token}`,
  };
}
