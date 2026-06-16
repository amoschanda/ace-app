# Ace App — Pastor Ken's Ministry & Learning Portal

[![Deployment status](https://github.com/amoschanda/ace-app/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/amoschanda/ace-app/actions/workflows/ci.yml)

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amoschanda/ace-app)

Live design replicating **pastor-ken.vercel.app** with Clerk authentication, Resend broadcaster, and a unified Vite + Express deployable.

## Stack
- React 19 + Vite 6 (Tailwind v4 inline theme)
- Express + TypeScript (single-server: serves both `/api/*` and the SPA)
- File-based JSON store at `src/db/db.json`
- **Clerk** for auth (modal sign-in, UserButton, email-based admin gate)
- **Resend** for live newsletter dispatch

## Local Development
```bash
yarn install
cp .env.example .env   # fill in your secrets (see below)
yarn dev               # runs tsx server.ts on PORT (default 3000)
```

## Production Build
```bash
yarn build             # builds Vite -> dist/ and bundles server -> dist/server.cjs
PORT=3000 NODE_ENV=production node dist/server.cjs
```

## Environment Variables (`.env`)
| Key | Purpose |
| --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Exposed to React, initialises `<ClerkProvider>` |
| `CLERK_PUBLISHABLE_KEY` | Mirror of above on the server (Clerk Express middleware) |
| `CLERK_SECRET_KEY` | Server-only; verifies session tokens & fetches user |
| `RESEND_API_KEY` | Required for `/api/admin/send-email` to actually dispatch |
| `ADMIN_EMAILS` | Comma-separated list of pastor/admin emails (lowercased compare) |
| `ADMIN_BROADCAST_FROM` | `Name <onboarding@resend.dev>` style FROM |
| `ADMIN_BROADCAST_DEFAULT_TO` | Default recipient when no test email entered |
| `PORT` | Server port (default 3000) |

## Admin / Pastor Console
- Click **Member Sign-In** → Clerk modal → sign in/up.
- The `Pastor Console` tab inside the portal probes `/api/me`. If the signed-in email is in `ADMIN_EMAILS`, the dashboard unlocks; otherwise a polite "Not Authorised" notice is shown.
- All `/api/admin/*` routes are protected by the `requireAdmin` middleware in `server.ts` — even direct API calls without a valid admin session are rejected.

## Vercel Deployment
1. Push this repo to GitHub.
2. Import into Vercel, framework preset = "Other" (or Vite). Build command `yarn build`, output `dist`.
3. Override "Install Command" to `yarn install` and create a `vercel.json` that boots `dist/server.cjs` as a Node serverless function — or use a Render/Fly/Railway Node host if you prefer a long-running server (recommended, because `clerkMiddleware()` keeps a small JWKS cache).
4. Add the **same env vars** in Vercel → Project → Settings → Environment Variables (Production + Preview).
5. In your Clerk dashboard, add your Vercel domain to **Allowed origins** and update the **Redirect URI** if you use OAuth.

## File Layout
```
ace-app/
├── server.ts                 # Express API + Vite middleware (dev) / static (prod)
├── src/
│   ├── main.tsx              # ClerkProvider bootstrap
│   ├── App.tsx               # Landing + Portal layout
│   ├── index.css             # Tailwind v4 + theme tokens (ink/gold)
│   ├── components/
│   │   ├── AdminPanel.tsx    # Clerk-gated pastor console (CRUD + broadcaster)
│   │   ├── SermonHub.tsx
│   │   ├── TheologicalLibrary.tsx
│   │   ├── FaithAcademy.tsx
│   │   ├── EventCalendar.tsx
│   │   ├── ResourceHub.tsx
│   │   └── LiveBroadcast.tsx
│   └── db/store.ts           # JSON file persistence
└── package.json
```
