"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await login(values.username, values.password);
      toast.success("Welcome back!");
      router.push(next);
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Login failed";
      toast.error(msg);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Field label="Username" error={errors.username?.message}>
          <input {...register("username")} autoComplete="username" className="input" />
        </Field>
        <Field label="Password" error={errors.password?.message}>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            className="input"
          />
        </Field>
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-sm text-slate-600">
        New here?{" "}
        <Link href="/register" className="text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
