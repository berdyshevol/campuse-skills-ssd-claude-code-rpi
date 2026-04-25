"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { StarRating } from "@/components/StarRating";
import { ApiError, apiFetch } from "@/lib/api";
import type { Rating, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type Props = {
  skillId: number;
  initialRatings: Rating[];
  currentUser: User | null;
  ownerId: number;
};

export function RatingsSection({
  skillId,
  initialRatings,
  currentUser,
  ownerId,
}: Props) {
  const [ratings, setRatings] = useState<Rating[]>(initialRatings);
  const router = useRouter();

  const isOwner = currentUser?.id === ownerId;
  const userHasReviewed =
    !!currentUser && ratings.some((r) => r.reviewer.id === currentUser.id);
  const canReview = !!currentUser && !isOwner && !userHasReviewed;

  async function handleDelete(ratingId: number) {
    if (!confirm("Delete your review?")) return;
    try {
      await apiFetch(`/api/ratings/${ratingId}/`, { method: "DELETE" });
      setRatings((rs) => rs.filter((r) => r.id !== ratingId));
      toast.success("Review removed");
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Delete failed";
      toast.error(msg);
    }
  }

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Reviews</h2>
        <span className="text-sm text-slate-500">
          {ratings.length} {ratings.length === 1 ? "review" : "reviews"}
        </span>
      </div>

      {canReview && (
        <RatingForm
          skillId={skillId}
          onCreated={(r) => {
            setRatings((rs) => [r, ...rs]);
            router.refresh();
          }}
        />
      )}

      {!currentUser && (
        <div className="mt-4 rounded-lg bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-600">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>{" "}
          to leave a review.
        </div>
      )}

      {currentUser && isOwner && (
        <div className="mt-4 rounded-lg bg-slate-50 ring-1 ring-slate-200 p-4 text-sm text-slate-600">
          You can&apos;t rate your own skill.
        </div>
      )}

      {currentUser && userHasReviewed && (
        <div className="mt-4 rounded-lg bg-emerald-50 ring-1 ring-emerald-200 p-4 text-sm text-emerald-800">
          You&apos;ve already reviewed this skill. Thanks!
        </div>
      )}

      <ul className="mt-6 space-y-4">
        {ratings.length === 0 && (
          <li className="text-sm text-slate-500">
            No reviews yet — be the first.
          </li>
        )}
        {ratings.map((r) => (
          <li
            key={r.id}
            className="rounded-lg ring-1 ring-slate-200 p-4 bg-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900">
                  @{r.reviewer.username}
                </div>
                <div className="mt-1">
                  <StarRating value={r.stars} />
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                {formatDate(r.created_at)}
                {currentUser?.id === r.reviewer.id && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="ml-3 text-red-600 hover:underline"
                  >
                    delete
                  </button>
                )}
              </div>
            </div>
            {r.review && (
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                {r.review}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RatingForm({
  skillId,
  onCreated,
}: {
  skillId: number;
  onCreated: (r: Rating) => void;
}) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await apiFetch<Rating>(`/api/skills/${skillId}/ratings/`, {
        method: "POST",
        jsonBody: { stars, review: text },
      });
      onCreated(r);
      setStars(5);
      setText("");
      toast.success("Review posted");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to post";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 rounded-lg ring-1 ring-slate-200 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Your rating:</span>
        <StarPicker value={stars} onChange={setStars} />
      </div>
      <textarea
        className="textarea mt-3"
        placeholder="What did you think? (optional)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-3 flex justify-end">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Posting…" : "Post review"}
        </button>
      </div>
    </form>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="text-xl leading-none"
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
        >
          <span className={n <= value ? "text-amber-400" : "text-slate-300"}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
}
