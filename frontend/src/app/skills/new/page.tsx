import { redirect } from "next/navigation";

import { SkillForm } from "@/components/SkillForm";
import { serverApiFetch } from "@/lib/server-api";
import type { User } from "@/lib/types";

export default async function NewSkillPage() {
  const { data: me } = await serverApiFetch<User>("/api/auth/me/");
  if (!me) redirect("/login?next=/skills/new");

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Post a skill</h1>
      <p className="mt-1 text-sm text-slate-600">
        Share what you can teach or do for fellow students.
      </p>
      <div className="mt-6">
        <SkillForm mode="create" />
      </div>
    </div>
  );
}
