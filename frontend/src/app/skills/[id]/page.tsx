import Link from "next/link";
import { notFound } from "next/navigation";

import { BookingPanel } from "@/components/BookingPanel";
import { RatingsSection } from "@/components/RatingsSection";
import { SkillOwnerActions } from "@/components/SkillOwnerActions";
import { StarRating } from "@/components/StarRating";
import { serverApiFetch } from "@/lib/server-api";
import type { Rating, Skill, User } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";

const AVAILABILITY_LABEL: Record<Skill["availability"], string> = {
  available: "Available now",
  busy: "Currently busy",
  paused: "Paused",
};

const CONTACT_LABEL: Record<Skill["contact_pref"], string> = {
  email: "Email",
  phone: "Phone",
  inapp: "In-app message",
};

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ data: skill, status }, { data: ratings }, { data: me }] =
    await Promise.all([
      serverApiFetch<Skill>(`/api/skills/${id}/`),
      serverApiFetch<Rating[]>(`/api/skills/${id}/ratings/`),
      serverApiFetch<User>("/api/auth/me/"),
    ]);

  if (status === 404 || !skill) notFound();

  const isOwner = !!me && me.id === skill.owner.id;
  const ratingsList = Array.isArray(ratings) ? ratings : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <Link
            href="/skills"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to all skills
          </Link>
        </div>
        <div className="card overflow-hidden">
          {skill.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={skill.image_url}
              alt={skill.title}
              className="w-full h-72 object-cover"
            />
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
                  {skill.category}
                </span>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
                  {skill.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Posted by{" "}
                  <span className="font-medium text-slate-700">
                    @{skill.owner.username}
                  </span>{" "}
                  · {formatDate(skill.created_at)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-slate-900">
                  {formatPrice(skill.price, skill.pricing_type)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {AVAILABILITY_LABEL[skill.availability]}
                </div>
              </div>
            </div>
            {skill.rating_count > 0 && skill.average_rating !== null && (
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <StarRating value={skill.average_rating} />
                <span>
                  {skill.average_rating.toFixed(1)} ({skill.rating_count} review
                  {skill.rating_count === 1 ? "" : "s"})
                </span>
              </div>
            )}
            <p className="mt-6 whitespace-pre-line text-slate-700 leading-relaxed">
              {skill.description}
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3">
                <div className="text-slate-500">Preferred contact</div>
                <div className="font-medium text-slate-900">
                  {CONTACT_LABEL[skill.contact_pref]}
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3">
                <div className="text-slate-500">Owner email</div>
                <div className="font-medium text-slate-900 truncate">
                  {skill.owner.email || "—"}
                </div>
              </div>
            </div>
            {isOwner && <SkillOwnerActions skill={skill} />}
          </div>
        </div>

        <RatingsSection
          skillId={skill.id}
          initialRatings={ratingsList}
          currentUser={me}
          ownerId={skill.owner.id}
        />
      </div>

      <aside className="lg:sticky lg:top-20 self-start">
        <BookingPanel skill={skill} currentUser={me} />
      </aside>
    </div>
  );
}
