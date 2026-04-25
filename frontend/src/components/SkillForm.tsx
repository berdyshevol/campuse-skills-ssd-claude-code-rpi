"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ApiError, apiFetch } from "@/lib/api";
import { SKILL_CATEGORIES, type Skill } from "@/lib/types";

const schema = z
  .object({
    title: z.string().min(3, "At least 3 characters").max(120),
    description: z.string().min(10, "At least 10 characters"),
    category: z.enum([
      "tutoring",
      "design",
      "coding",
      "music",
      "sports",
      "writing",
      "other",
    ]),
    pricing_type: z.enum(["free", "paid"]),
    price: z.string().optional(),
    contact_pref: z.enum(["email", "phone", "inapp"]),
    availability: z.enum(["available", "busy", "paused"]),
  })
  .refine(
    (v) =>
      v.pricing_type === "free" ||
      (v.price !== undefined && parseFloat(v.price) > 0),
    { path: ["price"], message: "Set a price greater than 0 for paid skills" },
  );

type FormValues = z.infer<typeof schema>;

export function SkillForm({
  initial,
  mode,
}: {
  initial?: Skill;
  mode: "create" | "edit";
}) {
  const router = useRouter();

  const defaults: FormValues = initial
    ? {
        title: initial.title,
        description: initial.description,
        category: initial.category,
        pricing_type: initial.pricing_type,
        price: initial.price ?? "",
        contact_pref: initial.contact_pref,
        availability: initial.availability,
      }
    : {
        title: "",
        description: "",
        category: "tutoring",
        pricing_type: "free",
        price: "",
        contact_pref: "email",
        availability: "available",
      };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  const pricingType = watch("pricing_type");

  async function onSubmit(values: FormValues) {
    const payload: Record<string, unknown> = {
      title: values.title,
      description: values.description,
      category: values.category,
      pricing_type: values.pricing_type,
      price: values.pricing_type === "paid" ? values.price : null,
      contact_pref: values.contact_pref,
      availability: values.availability,
    };
    try {
      const skill =
        mode === "create"
          ? await apiFetch<Skill>("/api/skills/", {
              method: "POST",
              jsonBody: payload,
            })
          : await apiFetch<Skill>(`/api/skills/${initial!.id}/`, {
              method: "PATCH",
              jsonBody: payload,
            });
      toast.success(mode === "create" ? "Skill posted!" : "Skill updated");
      router.push(`/skills/${skill.id}`);
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Save failed";
      toast.error(msg);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
      <Field label="Title" error={errors.title?.message}>
        <input {...register("title")} className="input" placeholder="e.g. Calculus tutoring" />
      </Field>
      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          className="textarea"
          placeholder="Tell other students what you offer."
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Category" error={errors.category?.message}>
          <select {...register("category")} className="select">
            {SKILL_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Availability" error={errors.availability?.message}>
          <select {...register("availability")} className="select">
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="paused">Paused</option>
          </select>
        </Field>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Pricing" error={errors.pricing_type?.message}>
          <select {...register("pricing_type")} className="select">
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </Field>
        {pricingType === "paid" && (
          <Field label="Price (USD)" error={errors.price?.message}>
            <input
              {...register("price")}
              type="number"
              min="0"
              step="0.01"
              className="input"
              placeholder="25.00"
            />
          </Field>
        )}
      </div>
      <Field label="Preferred contact" error={errors.contact_pref?.message}>
        <select {...register("contact_pref")} className="select">
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="inapp">In-app message</option>
        </select>
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting
            ? "Saving…"
            : mode === "create"
              ? "Post skill"
              : "Save changes"}
        </button>
      </div>
    </form>
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
      <span className="label">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <span className="text-xs text-red-600 mt-1 block">{error}</span>}
    </label>
  );
}
