export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

type UnauthorizedHandler = () => void;

const UNAUTHORIZED_IGNORE_PATHS = new Set(["/a/auth/login", "/a/auth/session"]);

let unauthorizedHandler: UnauthorizedHandler | null = null;
let unauthorizedHandled = false;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

export function resetUnauthorizedGuard() {
  unauthorizedHandled = false;
}

function shouldHandleUnauthorized(path: string) {
  const cleanPath = path.split("?")[0] ?? path;
  return !UNAUTHORIZED_IGNORE_PATHS.has(cleanPath);
}

function notifyUnauthorized(path: string) {
  if (unauthorizedHandled || !unauthorizedHandler || !shouldHandleUnauthorized(path)) return;
  unauthorizedHandled = true;
  unauthorizedHandler();
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = path.startsWith("http") ? new URL(path) : new URL(path, window.location.origin);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.pathname + url.search;
}

export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(buildUrl(path, query), {
    credentials: "include",
    ...rest,
    headers: {
      ...(isFormData || body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "errMsg" in payload && String((payload as { errMsg: unknown }).errMsg)) ||
      (payload && typeof payload === "object" && "errorMsg" in payload && String((payload as { errorMsg: unknown }).errorMsg)) ||
      (typeof payload === "string" && payload) ||
      `Request failed (${response.status})`;
    if (response.status === 401) {
      notifyUnauthorized(path);
    }
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export const api = {
  get: <T = unknown>(path: string, query?: RequestOptions["query"]) =>
    apiRequest<T>(path, { method: "GET", query, cache: "no-store" }),
  post: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "POST", body }),
  put: <T = unknown>(path: string, body?: unknown) =>
    apiRequest<T>(path, { method: "PUT", body }),
  postForm: <T = unknown>(path: string, body: FormData) =>
    apiRequest<T>(path, { method: "POST", body }),
};
