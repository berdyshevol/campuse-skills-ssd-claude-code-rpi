# Campus SkillSwap — Manual E2E Test Scenarios

Run via Playwright (or by hand in a browser) against a freshly seeded
local stack. Mark each scenario `[X]` when it passes; `[F]` if currently
failing (with a note).

## Last run

- **2026-04-25** — 15/15 scenarios passing.
- Found and fixed one bug en route: `serverApiFetch` was returning the
  Django error body as `data` on 4xx responses, so server-side
  `if (!me) redirect("/login")` checks didn't fire for anonymous users
  (the dashboard rendered a logged-in shell with empty data instead of
  redirecting). Fixed in [`frontend/src/lib/server-api.ts`](../frontend/src/lib/server-api.ts)
  by setting `data = null` when `!res.ok`.

## Setup (run once before each test pass)

The app is decoupled: Django API on **:8000**, Next.js UI on **:3000**.
The base URL for testing is **the Next.js frontend** unless noted otherwise.

```bash
# Free our two ports (kill any holders — these ports must be ours)
lsof -ti :8000 -sTCP:LISTEN 2>/dev/null | xargs -r kill -9
lsof -ti :3000 -sTCP:LISTEN 2>/dev/null | xargs -r kill -9

# --- Terminal 1: backend -------------------------------------------------
cd backend
source venv/bin/activate
python manage.py migrate                         # idempotent
python manage.py seed_demo                       # resets demo users + skills
python manage.py runserver 127.0.0.1:8000

# --- Terminal 2: frontend ------------------------------------------------
cd frontend
npm run dev                                      # default port 3000
```

Base URL: `http://localhost:3000/`
API URL:  `http://localhost:8000/`

Demo accounts (all with password `SkSwap!2025`):

| User    | Skills owned                                                |
|---------|-------------------------------------------------------------|
| alice   | "Python tutoring" ($20, **coding**), "Algebra basics" (free, **tutoring**) |
| bob     | "Spanish conversation" ($15, **other**)                     |
| charlie | none — pure stranger                                        |

## Scope

In-scope: US1 (browse), US2 (auth + post), US3 (search), US6 (manage).
Out-of-scope this round: US4 (booking), US5 (reviews).

## App-specific UX notes

A few things differ from a typical Django-templates app — keep these in
mind when running the steps:

- Forms validate **inline via React Hook Form + Zod** (no full-page reload
  on errors).
- "Success flash" = a **sonner toast** in the top-right.
- Skill delete uses a **JS `confirm()` dialog**, not a confirmation page.
- Search and category filters apply **automatically** on input/change
  (300ms debounce on the keyword box). There is no "Search" submit button.
- Trying to edit a skill you don't own **redirects to the detail page**;
  the underlying API call returns **403**.

## Scenarios

### US1 — Browse and discover (anonymous)

- [X] **S1.** Anonymous visitor opens `/` and sees skill cards from the
      seeded data. Visiting `/skills` shows all 3 cards with title,
      category, price (or "Free"), availability badge, and owner handle.
- [X] **S2.** Clicking a card opens `/skills/<id>` showing description,
      owner username, contact preference, and price/availability. The
      "Request a session" panel shows a sign-in prompt instead of a form
      when anonymous.
- [X] **S3.** Empty-state copy renders when no skills exist. Reproduce by
      logging into Django admin (`/admin/` on :8000) → delete all skills
      → reload `/skills` on :3000. Expect: "No skills match your filters."

### US2 — Register, sign in, post a skill

- [X] **S4.** Visitor clicks **Sign up** → fills valid form (new username
      + email + password ≥ 8 chars) → is auto-logged-in, redirected to
      `/dashboard`, sees a green success toast.
- [X] **S5.** Logged-in user clicks **+ Post a skill** → submits valid
      form (title, description, category, free) → redirected to
      `/skills/<id>` with a success toast. New skill appears on the
      landing page's "Latest skills" section and on `/dashboard` under
      "Your skills".
- [X] **S6.** Submit create-skill form with empty title → form stays on
      page, shows "At least 3 characters" under the title input, no
      skill is created. Verify by checking `GET /api/skills/` count is
      unchanged.
- [X] **S7.** Click **Sign out** → public navbar (Sign in / Sign up only)
      → reload `/skills` works. Sign back in → `/dashboard` "Your skills"
      still lists the skill from S5.

### US3 — Search and filter

- [X] **S8.** On `/skills`, type "python" in the keyword input → after
      ~300ms only "Python tutoring" is shown. The keyword input keeps
      "python" and the URL updates to `?q=python`.
- [X] **S9.** Clear keyword → pick category **Other** → only "Spanish
      conversation" is shown. URL has `?category=other`.
- [X] **S10.** Combine: keyword "spanish" + category "Other" → narrows to
      one card. Both filters reflected in the URL.
- [X] **S11.** Search for "xyznomatch" → empty-state card shown ("No
      skills match your filters. Try clearing some."). Clearing the
      keyword brings the full list back.

### US6 — Manage personal listings (owner only)

- [X] **S12.** Sign in as **alice** → `/dashboard` "Your skills" lists
      both her skills as `SkillCard`s (each links to its detail page,
      where Edit/Delete buttons appear because she's the owner).
- [X] **S13.** Edit "Python tutoring" → change price to **25** → redirected
      to its detail page with a success toast; new price visible on
      detail, on `/skills`, and on alice's `/dashboard`.
- [X] **S14a.** As alice, navigate to `/skills/<bob's-skill-id>/edit` →
      server-side redirect to `/skills/<bob's-skill-id>` (no edit form
      rendered).
- [X] **S14b.** As alice, hit the API directly:
      `PATCH /api/skills/<bob's-skill-id>/` with a logged-in session →
      returns **403 Forbidden**. (Use curl with the session + CSRF cookies
      from the browser, or the Django admin login.)
- [X] **S15.** On the detail page of one of alice's skills, click
      **Delete** → JS confirm dialog → confirm → toast "Skill deleted",
      redirect to `/dashboard`. The skill is gone from `/skills` and
      from `/dashboard`.

## Status legend

- `[ ]` not yet tested
- `[X]` passed
- `[F]` failed — see note below the line
