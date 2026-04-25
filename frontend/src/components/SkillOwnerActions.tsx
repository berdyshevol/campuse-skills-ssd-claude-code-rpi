"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError, apiFetch } from "@/lib/api";
import type { Skill } from "@/lib/types";

export function SkillOwnerActions({ skill }: { skill: Skill }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this skill? This cannot be undone.")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/skills/${skill.id}/`, { method: "DELETE" });
      toast.success("Skill deleted");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Delete failed";
      toast.error(msg);
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 flex gap-2">
      <Link href={`/skills/${skill.id}/edit`} className="btn-secondary">
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="btn-danger"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
    </div>
  );
}
