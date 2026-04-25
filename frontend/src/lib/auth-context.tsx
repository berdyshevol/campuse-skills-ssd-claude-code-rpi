"use client";

/**
 * Auth context: holds the current user (or null) and exposes login/register/logout.
 *
 * On mount, we ensure the CSRF cookie is set, then call /api/auth/me/ to
 * see if the user is already logged in (the session cookie may already exist
 * from a previous visit).
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { apiFetch, ensureCsrf } from "./api";
import type { User } from "./types";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const me = await apiFetch<User>("/api/auth/me/");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await ensureCsrf();
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const me = await apiFetch<User>("/api/auth/login/", {
      method: "POST",
      jsonBody: { username, password },
    });
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    const me = await apiFetch<User>("/api/auth/register/", {
      method: "POST",
      jsonBody: data,
    });
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout/", { method: "POST" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
