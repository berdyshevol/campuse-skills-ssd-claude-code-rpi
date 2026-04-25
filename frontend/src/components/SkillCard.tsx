import Link from "next/link";

import { StarRating } from "@/components/StarRating";
import type { Skill } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const AVAILABILITY_STYLES: Record<Skill["availability"], string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  busy: "bg-amber-50 text-amber-700 ring-amber-200",
  paused: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Link
      href={`/skills/${skill.id}`}
      className="group block rounded-xl bg-white ring-1 ring-slate-200 hover:ring-indigo-300 hover:shadow-md transition overflow-hidden"
    >
      {skill.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={skill.image_url}
          alt={skill.title}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="h-36 w-full bg-gradient-to-br from-indigo-100 via-white to-pink-100 flex items-center justify-center text-indigo-400 text-3xl">
          {emojiFor(skill.category)}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700 line-clamp-1">
            {skill.title}
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ring-1 capitalize ${AVAILABILITY_STYLES[skill.availability]}`}
          >
            {skill.availability}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600 line-clamp-2">{skill.description}</p>
        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="capitalize">{skill.category}</span>
            <span>·</span>
            <span>@{skill.owner.username}</span>
          </div>
          <span className="font-medium text-slate-900">
            {formatPrice(skill.price, skill.pricing_type)}
          </span>
        </div>
        {skill.rating_count > 0 && skill.average_rating !== null && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <StarRating value={skill.average_rating} />
            <span>
              {skill.average_rating.toFixed(1)} · {skill.rating_count} review
              {skill.rating_count === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function emojiFor(category: Skill["category"]): string {
  switch (category) {
    case "tutoring":
      return "📚";
    case "coding":
      return "💻";
    case "design":
      return "🎨";
    case "music":
      return "🎸";
    case "sports":
      return "🏀";
    case "writing":
      return "✍️";
    default:
      return "✨";
  }
}
