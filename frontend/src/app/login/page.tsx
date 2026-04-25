import { Suspense } from "react";

import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Welcome back to Campus SkillSwap.
        </p>
        {/*
         * useSearchParams() in the form requires a Suspense boundary so
         * Next can prerender the static shell while leaving the form
         * client-only.
         */}
        <Suspense fallback={<div className="mt-6 h-32 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
