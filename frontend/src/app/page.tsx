import Link from "next/link";

import { SkillCard } from "@/components/SkillCard";
import { serverApiFetch } from "@/lib/server-api";
import type { Paginated, Skill } from "@/lib/types";

export default async function Home() {
  // Server Component: fetch the latest skills directly during render.
  // No auth required for the public list endpoint.
  const { data } = await serverApiFetch<Paginated<Skill>>("/api/skills/?page=1");
  const featured = data?.results?.slice(0, 6) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium ring-1 ring-indigo-200">
            <span className="size-1.5 rounded-full bg-indigo-500" /> A campus marketplace
          </span>
          <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            Trade skills with{" "}
            <span className="text-indigo-600">classmates</span>, not platforms.
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-prose">
            Need calculus help? Want to learn guitar? Have design chops to offer? Post a
            skill, browse what others are sharing, and book a session — all in one place.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/skills"
              className="px-5 py-2.5 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              Browse skills
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-md bg-white ring-1 ring-slate-200 text-slate-900 font-medium hover:bg-slate-100"
            >
              Create an account
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-100 via-white to-pink-100 p-1 ring-1 ring-slate-200 shadow-sm">
          <div className="rounded-2xl bg-white/70 backdrop-blur p-6 grid grid-cols-2 gap-3">
            {[
              ["Tutoring", "📚"],
              ["Coding", "💻"],
              ["Design", "🎨"],
              ["Music", "🎸"],
              ["Sports", "🏀"],
              ["Writing", "✍️"],
            ].map(([label, emoji]) => (
              <div
                key={label}
                className="rounded-xl bg-white p-4 ring-1 ring-slate-200 shadow-sm flex flex-col gap-1"
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-medium text-slate-800">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">Latest skills</h2>
          <Link
            href="/skills"
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            See all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500 bg-white">
            No skills posted yet. Be the first to{" "}
            <Link href="/register" className="text-indigo-600 hover:underline">
              sign up
            </Link>{" "}
            and post one!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
