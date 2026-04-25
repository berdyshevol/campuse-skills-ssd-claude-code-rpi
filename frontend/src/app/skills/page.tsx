import Link from "next/link";

import { SkillFilters } from "@/components/SkillFilters";
import { SkillCard } from "@/components/SkillCard";
import { serverApiFetch } from "@/lib/server-api";
import type { Paginated, Skill } from "@/lib/types";

type SearchParams = {
  q?: string;
  category?: string;
  pricing?: string;
  availability?: string;
  page?: string;
};

export default async function SkillsListPage({
  searchParams,
}: {
  // Next 15+: searchParams is a Promise that must be awaited.
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q) qs.set("q", params.q);
  if (params.category) qs.set("category", params.category);
  if (params.pricing) qs.set("pricing", params.pricing);
  if (params.availability) qs.set("availability", params.availability);
  if (params.page) qs.set("page", params.page);

  const { data } = await serverApiFetch<Paginated<Skill>>(
    `/api/skills/?${qs.toString()}`,
  );
  const skills = data?.results ?? [];
  const count = data?.count ?? 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Browse skills</h1>
          <p className="text-sm text-slate-600 mt-1">
            {count} {count === 1 ? "result" : "results"}
          </p>
        </div>
        <Link href="/skills/new" className="btn-primary">
          + Post a skill
        </Link>
      </div>

      <SkillFilters />

      {skills.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 bg-white">
          No skills match your filters. Try clearing some.
        </div>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
