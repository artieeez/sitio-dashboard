function apiBase(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (typeof raw === "string" && raw.length > 0) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000/api";
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

function parseJsonSafe(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = apiBase();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Typed JSON fetch against `VITE_API_URL` (OpenAPI servers base includes `/api`).
 */
export async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(resolveUrl(path), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new ApiError(
      res.status,
      text ? parseJsonSafe(text) : null,
      typeof text === "string" ? text : undefined,
    );
  }

  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export async function apiPostJson<TRes>(
  path: string,
  body: unknown,
  init?: Omit<RequestInit, "body" | "method">,
): Promise<TRes> {
  return apiJson<TRes>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(body),
  });
}
