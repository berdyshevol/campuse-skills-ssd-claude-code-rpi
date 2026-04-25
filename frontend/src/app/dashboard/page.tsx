import Link from "next/link";
import { redirect } from "next/navigation";

import { BookingActions } from "@/components/BookingActions";
import { SkillCard } from "@/components/SkillCard";
import { serverApiFetch } from "@/lib/server-api";
import type { Booking, Paginated, Skill, User } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

const STATUS_STYLES: Record<Booking["status"], string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  completed: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};

export default async function DashboardPage() {
  const { data: me } = await serverApiFetch<User>("/api/auth/me/");
  if (!me) redirect("/login?next=/dashboard");

  const [{ data: mySkills }, { data: incoming }, { data: outgoing }] =
    await Promise.all([
      serverApiFetch<Paginated<Skill>>("/api/skills/mine/"),
      serverApiFetch<Paginated<Booking>>("/api/bookings/incoming/"),
      serverApiFetch<Paginated<Booking>>("/api/bookings/outgoing/"),
    ]);

  const skills = mySkills?.results ?? [];
  const incomingList = incoming?.results ?? [];
  const outgoingList = outgoing?.results ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, @{me.username}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Manage your skills and bookings.
        </p>
      </header>

      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-semibold tracking-tight">Your skills</h2>
          <Link href="/skills/new" className="btn-primary">
            + Post a skill
          </Link>
        </div>
        {skills.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            You haven&apos;t posted any skills yet.{" "}
            <Link href="/skills/new" className="text-indigo-600 hover:underline">
              Create your first one
            </Link>
            .
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Incoming requests
        </h2>
        {incomingList.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">
            No one has requested a session on your skills yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {incomingList.map((b) => (
              <li key={b.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/skills/${b.skill.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-700"
                    >
                      {b.skill.title}
                    </Link>
                    <div className="text-sm text-slate-500 mt-0.5">
                      from <span className="font-medium">@{b.requester.username}</span>{" "}
                      · proposed for{" "}
                      <span className="font-medium">
                        {formatDateTime(b.proposed_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ring-1 capitalize ${STATUS_STYLES[b.status]}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">
                  {b.message}
                </p>
                <BookingActions booking={b} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold tracking-tight mb-4">
          Your booking requests
        </h2>
        {outgoingList.length === 0 ? (
          <div className="card p-6 text-sm text-slate-500">
            You haven&apos;t requested any sessions yet.{" "}
            <Link href="/skills" className="text-indigo-600 hover:underline">
              Browse skills
            </Link>
            .
          </div>
        ) : (
          <ul className="space-y-3">
            {outgoingList.map((b) => (
              <li key={b.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/skills/${b.skill.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-700"
                    >
                      {b.skill.title}
                    </Link>
                    <div className="text-sm text-slate-500 mt-0.5">
                      with{" "}
                      <span className="font-medium">@{b.skill.owner.username}</span> ·
                      proposed for{" "}
                      <span className="font-medium">
                        {formatDateTime(b.proposed_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ring-1 capitalize ${STATUS_STYLES[b.status]}`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-700 whitespace-pre-line">
                  {b.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
