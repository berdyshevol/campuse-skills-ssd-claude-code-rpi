/**
 * Server-side fetch helpers for use inside Server Components and Route Handlers.
 *
 * Why a separate file? Server Components can't read cookies from `document`,
 * so we forward the incoming request's cookies via Next's `cookies()` helper.
 * That way Django sees the same `sessionid` the browser sent and treats the
 * request as authenticated.
 */

import { cookies } from "next/headers";

// Server-side fetches need an absolute URL. INTERNAL_API_URL is the same
// value next.config.ts uses for the /api/* rewrite, so SSR calls hit
// Django directly without a self-loop through Next.
const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ?? "http://localhost:8000";

export async function serverApiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ status: number; data: T | null }> {
  const cookieHeader = (await cookies()).toString();
  const res = await fetch(`${INTERNAL_API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers as Record<string, string> | undefined),
      cookie: cookieHeader,
      Accept: "application/json",
    },
    cache: "no-store",
  });
  if (res.status === 204) return { status: 204, data: null };
  const text = await res.text();
  let data: T | null = null;
  try {
    data = text ? (JSON.parse(text) as T) : null;
  } catch {
    data = null;
  }
  // Treat 4xx/5xx as "no data" so callers can use `if (!data)` to gate on
  // auth/missing-resource without inspecting status.
  if (!res.ok) data = null;
  return { status: res.status, data };
}
