"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError, apiFetch } from "@/lib/api";
import type { Skill, User } from "@/lib/types";

export function BookingPanel({
  skill,
  currentUser,
}: {
  skill: Skill;
  currentUser: User | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [proposedAt, setProposedAt] = useState("");
  const [busy, setBusy] = useState(false);

  const isOwner = currentUser?.id === skill.owner.id;
  const canBook = !!currentUser && !isOwner && skill.availability === "available";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !proposedAt) {
      toast.error("Add a message and pick a time.");
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`/api/skills/${skill.id}/bookings/`, {
        method: "POST",
        jsonBody: {
          message,
          proposed_at: new Date(proposedAt).toISOString(),
        },
      });
      toast.success("Booking request sent!");
      setMessage("");
      setProposedAt("");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to request";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold tracking-tight">Request a session</h2>
      {isOwner && (
        <p className="mt-2 text-sm text-slate-600">
          You own this skill. Visit your{" "}
          <Link href="/dashboard" className="text-indigo-600 hover:underline">
            dashboard
          </Link>{" "}
          to manage incoming bookings.
        </p>
      )}
      {!currentUser && (
        <p className="mt-2 text-sm text-slate-600">
          <Link href="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>{" "}
          to send a booking request.
        </p>
      )}
      {currentUser && skill.availability !== "available" && !isOwner && (
        <p className="mt-2 text-sm text-amber-700">
          This skill isn&apos;t accepting bookings right now.
        </p>
      )}
      {canBook && (
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block">
            <span className="label">Message to the owner</span>
            <textarea
              className="textarea mt-1"
              placeholder="Hi! I'd love to book a session about…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
            />
          </label>
          <label className="block">
            <span className="label">Proposed time</span>
            <input
              type="datetime-local"
              className="input mt-1"
              value={proposedAt}
              onChange={(e) => setProposedAt(e.target.value)}
            />
          </label>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? "Sending…" : "Send request"}
          </button>
        </form>
      )}
    </div>
  );
}
