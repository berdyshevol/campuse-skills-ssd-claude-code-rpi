# Campus SkillSwap

A student marketplace for trading skills and services. Built as a learning
project to practice Django REST + Next.js together.

- **Backend:** Django 5 + DRF, session-cookie auth, PostgreSQL in prod / SQLite in dev
- **Frontend:** Next.js 16 (App Router) + Tailwind v4, React Hook Form + Zod, sonner toasts
- **Media:** Cloudinary (only in prod; local disk in dev)
- **Deployment:** Render (Blueprint at `render.yaml` — one-click deploy)

## Features

- Sign up, sign in, sign out
- Post skills with title, description, category, pricing, contact preference, availability
- Browse + search skills (text query, filter by category and pricing)
- Skill detail page with owner info
- Edit / delete your own skills
- Star ratings + written reviews (one per user per skill)
- Booking requests with accept / reject / complete flow
- Personal dashboard with your skills + incoming/outgoing bookings
- Django admin at `/admin/` for inspecting data

## Local development

You need:

- Python 3.11+
- Node 20+
- An IDE with TypeScript support (helpful but not required)

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # tweak if you want
python manage.py migrate
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver 8001
```

Backend runs at <http://127.0.0.1:8001>.

### 2. Frontend

In a separate terminal:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev -- -p 3001
```

Frontend runs at <http://localhost:3001>.

> **Heads up:** The backend's CORS allowlist is read from `FRONTEND_ORIGIN`
> in `backend/.env`. If you change the frontend port, change this too and
> restart Django.

### 3. Try it

1. Visit <http://localhost:3001>
2. Click **Sign up**, create an account
3. Click **Post a skill**, fill in the form
4. Open the skill, leave a review (with a second account), book a session
5. Check **Dashboard** to see your bookings

## Deployment to Render

This repo includes a `render.yaml` Blueprint that creates:

- `skillswap-api` — Django web service (free)
- `skillswap-web` — Next.js web service (free)
- `skillswap-db` — PostgreSQL database (free, 90-day expiry)

### One-time setup

1. Push this repo to GitHub.
2. Go to **render.com → New → Blueprint**, point it at the repo.
3. Render creates all three services. Note the assigned URLs:
   - API: `https://skillswap-api.onrender.com`
   - Web: `https://skillswap-web.onrender.com`
4. In the Render dashboard, set the env vars marked `sync: false`:

   On **skillswap-api**:
   - `FRONTEND_ORIGIN` = `https://skillswap-web.onrender.com`
   - `CLOUDINARY_URL` = `cloudinary://<key>:<secret>@<cloud>` (from your
     Cloudinary dashboard → "API Environment variable")

   On **skillswap-web**:
   - `NEXT_PUBLIC_API_URL` = `https://skillswap-api.onrender.com`

5. Trigger a redeploy on both services. Done.

### Heads-up about the free tier

- Free web services **spin down after 15 min of inactivity** → first hit
  takes ~30s to wake up. Bump each service to "Starter" ($7/mo) when you
  want it always-on.
- The free Postgres database **expires after 90 days**. Either recreate
  it, switch to "Basic-256mb" ($6/mo), or move the database to
  [Neon](https://neon.tech) (free, no expiry).

### Cookie & CORS gotcha

Cross-site session cookies require `SameSite=None; Secure` in production,
which is set automatically when `DJANGO_DEBUG=False`. The frontend already
sends `credentials: "include"` on every request and echoes the CSRF token
on writes. Both behaviors live in [`frontend/src/lib/api.ts`](frontend/src/lib/api.ts)
and [`backend/skillswap/settings.py`](backend/skillswap/settings.py).

## Project layout

```
backend/
  skillswap/         Django project (settings, root urls)
  accounts/          register/login/logout/me API
  skills/            Skill model + DRF viewset + search
  ratings/           star ratings + reviews
  bookings/          booking request lifecycle
frontend/
  src/app/           App Router pages
  src/components/    UI components (SkillCard, RatingsSection, …)
  src/lib/           api client, auth context, types
render.yaml          one-click Render deploy
```
