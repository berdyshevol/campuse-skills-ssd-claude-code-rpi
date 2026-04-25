"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const schema = z.object({
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(150)
    .regex(/^[\w.@+-]+$/, "Letters, digits and @/./+/-/_ only"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  first_name: z.string().max(150).optional(),
  last_name: z.string().max(150).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await registerUser(values);
      toast.success("Account created!");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Registration failed";
      toast.error(msg);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-sm text-slate-600">
          Join the campus marketplace in 30 seconds.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Field label="Username" error={errors.username?.message}>
            <input {...register("username")} autoComplete="username" className="input" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              className="input"
            />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <input
              {...register("password")}
              type="password"
              autoComplete="new-password"
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.first_name?.message}>
              <input {...register("first_name")} className="input" />
            </Field>
            <Field label="Last name" error={errors.last_name?.message}>
              <input {...register("last_name")} className="input" />
            </Field>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? "Creating…" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
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
