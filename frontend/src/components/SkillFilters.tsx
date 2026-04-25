"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { SKILL_CATEGORIES } from "@/lib/types";

/**
 * Search + filter bar for /skills.
 *
 * We're a Client Component because we update the URL on input (?q=&category=…).
 * The server page reads `searchParams` and re-fetches; the result re-streams
 * back to the browser. This is the App Router idiom for "server-rendered list
 * with client-driven filters."
 */
export function SkillFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  // Debounce text input so we don't spam the server on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q) next.set("q", q);
      else next.delete("q");
      next.delete("page");
      router.push(`/skills?${next.toString()}`);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/skills?${next.toString()}`);
  }

  return (
    <div className="card p-4 grid md:grid-cols-4 gap-3">
      <div className="md:col-span-2">
        <label className="label">Search</label>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or description…"
          className="input mt-1"
        />
      </div>
      <div>
        <label className="label">Category</label>
        <select
          value={params.get("category") ?? ""}
          onChange={(e) => setParam("category", e.target.value)}
          className="select mt-1"
        >
          <option value="">All categories</option>
          {SKILL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Pricing</label>
        <select
          value={params.get("pricing") ?? ""}
          onChange={(e) => setParam("pricing", e.target.value)}
          className="select mt-1"
        >
          <option value="">All</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>
    </div>
  );
}
