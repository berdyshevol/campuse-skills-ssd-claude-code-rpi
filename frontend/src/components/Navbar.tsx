"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Sign-out failed");
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-slate-900 tracking-tight">
          <span className="text-indigo-600">Skill</span>Swap
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/skills"
            className="px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100"
          >
            Browse
          </Link>
          {!loading && user && (
            <>
              <Link
                href="/skills/new"
                className="px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100"
              >
                Post a skill
              </Link>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <span className="px-2 text-slate-400">·</span>
              <span className="px-2 text-slate-600">@{user.username}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </>
          )}
          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-100"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="ml-1 px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
