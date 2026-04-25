# Campus SkillSwap

A small student marketplace where classmates can post skills they offer
(tutoring, design, coding, music…) and other students can browse, leave
reviews, and request a session. Built as a learning project to practice
Django REST + Next.js together.

> **Status:** local-dev complete, all 15 e2e scenarios in
> [`e2e/scenarios.md`](e2e/scenarios.md) passing. Deploy config for Render
> ships in [`render.yaml`](render.yaml).

## What it does

- **Sign up, sign in, sign out** — classic username + password auth, with
  the session stored in a cookie.
- **Post a skill** — title, description, category (tutoring, design,
  coding, music, sports, writing, other), pricing (free or a USD amount),
  preferred contact method, availability.
- **Browse and search** — full list with debounced keyword search and
  category / pricing filters; URL is shareable so a search is bookmarkable.
- **Skill detail page** — owner's username, full description, average
  rating, reviews, and a "Request a session" panel.
- **Reviews** — star rating + optional written review, one per user per
  skill (you can't review your own).
- **Booking requests** — propose a date, send a message; the owner can
  accept, reject, or mark complete.
- **Dashboard** — your own skills plus incoming and outgoing bookings.
- **Django admin** at `/admin/` for inspecting data during dev.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Django 5 + Django REST Framework |
| Auth | Django session cookies (Next.js sends `credentials: include`) |
| Database | SQLite locally, PostgreSQL on Render |
| Image storage | Cloudinary (when `CLOUDINARY_URL` is set; local disk otherwise) |
| Frontend | Next.js 16 (App Router) + Tailwind v4 |
| Forms / validation | React Hook Form + Zod |
| Notifications | sonner (toast messages) |
| Deployment | Render (one-click Blueprint at `render.yaml`) |

## Run it locally

You'll need:

- **Python 3.11+**
- **Node 20+**

The app is two services. You'll run each in its own terminal.

### 1. Start the backend (Django + API)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                       # tweak only if you want to
python manage.py migrate                   # create tables
python manage.py seed_demo                 # OPTIONAL: alice/bob/charlie + 3 skills
python manage.py createsuperuser           # OPTIONAL: for /admin/
python manage.py runserver 127.0.0.1:8001
```

The API is now at <http://127.0.0.1:8001>.

> **Why port 8001?** The default 8000 is sometimes already in use by
> other Django projects. The frontend's `.env.local` and `backend/.env`
> are both pre-configured for `8001` and `3001` so things "just work."

### 2. Start the frontend (Next.js)

In a separate terminal:

```bash
cd frontend
cp .env.example .env.local                 # already points at :8001
npm install
npm run dev -- -p 3001
```

Open <http://localhost:3001> in your browser.

### Demo accounts

If you ran `seed_demo`, three users are ready to go (password `SkSwap!2025` for all):

| User    | What they own                                       |
|---------|-----------------------------------------------------|
| alice   | "Python tutoring" ($20) and "Algebra basics" (free) |
| bob     | "Spanish conversation" ($15)                        |
| charlie | nothing — sign in to test "stranger" flows          |

Re-run `python manage.py seed_demo` any time to reset the demo data
back to a clean baseline.

## A guided walkthrough

To see all the features in two minutes:

1. **Open the home page.** You'll see the hero section and a "Latest
   skills" grid populated from the demo data.
2. **Click "Browse"** in the navbar (or any skill card). The list page
   has a search box and category / pricing filters. Try typing
   `python` — only Python tutoring should remain. Clear it, pick
   category **Other** — only Spanish conversation. Combine both.
3. **Click a skill card.** The detail page shows the description, price,
   availability, owner, and a "Request a session" panel. As an
   anonymous visitor, the panel asks you to sign in.
4. **Sign in as `alice`** (or anyone). The navbar swaps to your username
   plus **Sign out**, **Post a skill**, and **Dashboard**.
5. **Click "Post a skill."** Fill the form. If you pick "Paid" it'll
   require a price > 0; "Free" hides the price field. Submit — you
   land on your new skill's detail page with a green toast.
6. **Sign in as `bob`** in another browser (or use a private window).
   On alice's "Python tutoring" page, click stars, write a review, post.
   The average rating and review count update.
7. **Request a session** from bob's account: write a message, pick a
   time, send. You're redirected to your dashboard, where the request
   appears under "Your booking requests."
8. **Switch back to alice.** Her dashboard shows the booking under
   "Incoming requests." She can **Accept**, **Reject**, or — once
   accepted — **Mark completed**. Each action updates both sides.
9. **Edit or delete a skill** from its detail page (only owners see
   those buttons). Delete pops a JS confirm dialog before destroying.

That covers the full happy path. The Django admin at
<http://127.0.0.1:8001/admin/> lets you inspect rows directly if you
ever want to check what got persisted.

## Project structure

```
backend/                  Django side
  skillswap/              project (settings, root urls)
  accounts/               register / login / logout / me  + seed_demo command
  skills/                 Skill model + DRF viewset + search/filters
  ratings/                Rating model + nested API
  bookings/               Booking model + status state machine
  manage.py
  requirements.txt
frontend/                 Next.js side
  src/app/                App Router pages (server + client components)
  src/components/         UI: SkillCard, RatingsSection, BookingPanel, …
  src/lib/                api client (browser + server), auth context, types
  package.json
e2e/scenarios.md          15 manual e2e scenarios, last run 15/15 passing
render.yaml               one-click Render deploy (api + web + Postgres)
```

## How auth works (the trickiest piece)

Backend uses **Django's built-in session cookie** auth. Because the
frontend lives on a different origin (`localhost:3001` vs
`localhost:8001` in dev, two `*.onrender.com` subdomains in prod), every
request from Next.js does three things:

1. Sends `credentials: "include"` so the browser attaches the
   `sessionid` cookie.
2. On first load, calls `GET /api/auth/csrf/` once. Django sets a
   `csrftoken` cookie that is **not** HttpOnly so JS can read it.
3. On any write (POST/PUT/PATCH/DELETE), echoes that token back as the
   `X-CSRFToken` header.

In production (`DJANGO_DEBUG=False`) the cookies become
`SameSite=None; Secure` so the browser is willing to send them
cross-site over HTTPS. All of this lives in
[`backend/skillswap/settings.py`](backend/skillswap/settings.py) and
[`frontend/src/lib/api.ts`](frontend/src/lib/api.ts) — no third-party
auth library needed.

## Deploy to Render

A `render.yaml` Blueprint provisions everything in one click:

- `skillswap-api` — Django (free tier)
- `skillswap-web` — Next.js (free tier)
- `skillswap-db` — PostgreSQL (free, 90-day expiry)

### Steps

1. Push this repo to GitHub.
2. **render.com → New → Blueprint**, pick the repo.
3. Render creates all three services. Note the URLs it assigns
   (typically `https://skillswap-api.onrender.com` and
   `https://skillswap-web.onrender.com`).
4. In the Render dashboard, fill in the env vars marked `sync: false`:

   On **skillswap-api**:
   - `FRONTEND_ORIGIN` = your `skillswap-web` URL
   - `CLOUDINARY_URL` = `cloudinary://<key>:<secret>@<cloud>` (from
     your Cloudinary dashboard → "API Environment variable")

   On **skillswap-web**:
   - `NEXT_PUBLIC_API_URL` = your `skillswap-api` URL

5. Trigger a redeploy on both web services. Done.

### Things to know about the free tier

- Free web services **spin down after 15 minutes of inactivity**, so
  the first hit after a quiet period takes ~30 seconds to wake up.
  Upgrade each to "Starter" ($7/mo) when you want them always-on.
- The free Postgres database **deletes itself after 90 days**. Either
  recreate it, upgrade to "Basic-256mb" (~$6/mo), or move the DB to
  [Neon](https://neon.tech) (free, no expiry) and just point
  `DATABASE_URL` at it.

## Tests

Manual e2e scenarios live in [`e2e/scenarios.md`](e2e/scenarios.md).
The seeder makes them repeatable:

```bash
cd backend
source venv/bin/activate
python manage.py seed_demo                  # reset to known state
python manage.py runserver 127.0.0.1:8001   # plus npm run dev in /frontend
# walk through e2e/scenarios.md in your browser, marking [X] / [F]
```

## License

Personal/learning project — no license attached. Use the code however
you like for your own learning.
