import { notFound, redirect } from "next/navigation";

import { SkillForm } from "@/components/SkillForm";
import { serverApiFetch } from "@/lib/server-api";
import type { Skill, User } from "@/lib/types";

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: me }, { data: skill, status }] = await Promise.all([
    serverApiFetch<User>("/api/auth/me/"),
    serverApiFetch<Skill>(`/api/skills/${id}/`),
  ]);

  if (!me) redirect(`/login?next=/skills/${id}/edit`);
  if (status === 404 || !skill) notFound();
  if (skill.owner.id !== me.id) redirect(`/skills/${id}`);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Edit skill</h1>
      <div className="mt-6">
        <SkillForm mode="edit" initial={skill} />
      </div>
    </div>
  );
}
