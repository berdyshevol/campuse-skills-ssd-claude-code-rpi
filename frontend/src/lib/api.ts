/**
 * API client for the Django backend.
 *
 * Auth model: Django sets a session cookie + a CSRF cookie. We:
 *   - send `credentials: "include"` on every request
 *   - read the `csrftoken` cookie and echo it in `X-CSRFToken` on writes
 *
 * Two callers:
 *   - The browser (Client Components / form handlers): cookies set by Django stick automatically.
 *   - Server Components: must forward the user's incoming `cookie` header via `apiServer`
 *     so Django sees them as authenticated. See lib/server-api.ts.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.status = status;
    this.data = data;
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : null;
}

type FetchOptions = RequestInit & { jsonBody?: unknown };

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { jsonBody, headers, body, ...rest } = options;

  const isWrite = !!options.method && !["GET", "HEAD"].includes(options.method);
  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  // Only set JSON content-type when sending JSON. FormData (image upload)
  // needs the browser to set its own multipart boundary.
  let finalBody = body;
  if (jsonBody !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    finalBody = JSON.stringify(jsonBody);
  }

  if (isWrite) {
    const csrf = getCookie("csrftoken");
    if (csrf) finalHeaders["X-CSRFToken"] = csrf;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
    credentials: "include",
  });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data, formatApiError(data) || res.statusText);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Best-effort flattening of DRF validation errors into a single user-readable string. */
export function formatApiError(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    const lines: string[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (Array.isArray(v)) lines.push(`${k}: ${v.join(", ")}`);
      else if (typeof v === "string") lines.push(`${k}: ${v}`);
    }
    if (lines.length) return lines.join(" • ");
  }
  return "";
}

/** Force-set the CSRF cookie. Call once on app load. */
export async function ensureCsrf() {
  await apiFetch("/api/auth/csrf/");
}
