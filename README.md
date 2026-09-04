# Us, Anyway

A private, two-person webapp for a long-distance couple — presence, daily
rhythm, games, memories, and notes shared across two timezones. Not a public
product: the whole app is built around exactly one couple.

## Stack

- **Framework:** Next.js 14 (App Router), TypeScript strict
- **Styling:** Tailwind, hand-built design system (no component library)
- **Database:** Neon serverless Postgres + Drizzle ORM
- **Auth:** Auth.js (NextAuth) v5, Credentials provider, JWT sessions
- **Media storage:** Cloudflare R2 (S3-compatible), presigned URLs
- **Realtime:** Pusher Channels
- **Motion:** Framer Motion, with a shared reduced-motion-safe primitives layer
- **Deployment:** Vercel

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

Runs at [http://localhost:3000](http://localhost:3000).

### Database

Migrations are managed with Drizzle Kit. These scripts source `.env.local`
automatically:

```bash
npm run db:generate   # generate a migration from schema changes
npm run db:migrate     # apply migrations
npm run db:studio      # browse the database
```

## Environment variables

See `.env.local.example` for the full list with comments. Summary:

| Variable | Source |
|---|---|
| `AUTH_SECRET` | generate with `openssl rand -base64 33` |
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PG*`, `POSTGRES_*` | Neon Postgres, provisioned via the **Vercel Marketplace** integration — run `vercel env pull .env.local` rather than hand-typing these |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cloudflare R2 — created manually in the Cloudflare dashboard (not on the Vercel Marketplace). Create a bucket, a scoped "Object Read & Write" API token, and enable public access via the `r2.dev` subdomain (or a custom domain) |
| `PUSHER_APP_ID`, `PUSHER_KEY`, `PUSHER_SECRET`, `PUSHER_CLUSTER`, `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher Channels — created manually in the Pusher dashboard (not on the Vercel Marketplace). A Channels app on the Sandbox plan is enough for two users |

### Provisioning Neon via Vercel

```bash
vercel link
vercel integration add neon --yes
vercel env pull .env.local --yes
```

### Provisioning R2 and Pusher

Both are manual (no Vercel Marketplace integration for either):

1. **R2** — Cloudflare dashboard → R2 → create a bucket → Manage R2 API
   Tokens → create a token scoped to that bucket with Object Read & Write →
   enable the bucket's public `r2.dev` URL (or attach a custom domain).
2. **Pusher** — [dashboard.pusher.com](https://dashboard.pusher.com) → create
   a Channels app → copy the app id/key/secret/cluster from the app's "App
   Keys" tab.

After provisioning either manually, add the values to the Vercel project's
environment variables (`vercel env add <NAME>`) so they're present in
Preview/Production, then `vercel env pull .env.local` again to sync locally.

## Deployment

Deployed on Vercel. Push to `main` for production, or open a PR for a
preview deployment. Required environment variables must be set on the
Vercel project (Settings → Environment Variables) for all three
environments (Development/Preview/Production) before a build will succeed.

## Access

Signup requires `SIGNUP_INVITE_CODE` (see above) — anyone who doesn't have
it can't create an account, regardless of the deployed URL being public.
Share the code with your partner out of band (not over email/SMS in plain
text if you can help it) so they can create their account and pair with
your invite code from the home page afterward. These are two different
codes: `SIGNUP_INVITE_CODE` gates account creation; the couple pairing
code (shown on the home page once signed in) links two existing accounts
together.
