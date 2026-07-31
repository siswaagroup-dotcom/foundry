# Railway Deployment Guide — Foundry

## What Was Changed

| File | Change |
|------|--------|
| `next.config.ts` | Added `output: "standalone"`, `serverExternalPackages` for pg/bcryptjs/jsonwebtoken |
| `src/lib/db.ts` | SSL auto-enables in production; configurable via `DATABASE_SSL` |
| `src/lib/cloudinary.ts` | Removed `console.log` that leaked API key on every cold start |
| `src/services/settings.server.ts` | Fixed internal `StoredCredential` type to match DB schema |
| `src/services/social.server.ts` | Removed all 40 `console.log` statements |
| `src/services/social.service.ts` | Removed `console.log` |
| `src/hooks/useSocialManagement.ts` | Removed `console.log` |
| `social-post-detail/hooks/useSocialPostDetail.ts` | Removed `console.log` |
| `src/app/api/social/posts/route.ts` | Removed `console.log` |
| `src/app/api/social/posts/[id]/route.ts` | Removed `console.log` |
| `src/app/api/social/posts/[id]/publish/route.ts` | Removed `console.log` |
| `src/app/api/social/media/upload/route.ts` | Removed `console.log` |
| `src/app/api/health/route.ts` | **New** — healthcheck endpoint for Railway |
| `src/app/api/social/integrations/[id]/credentials/route.ts` | **New** — decrypted credentials endpoint |
| `railway.json` | **New** — Railway build/deploy config |
| `.env.example` | **New** — documents all required env vars |
| `.gitignore` | Added `*.log` patterns and `tsconfig.tsbuildinfo` |
| `package.json` | `start` script respects `PORT` env var from Railway |

---

## Deployment Checklist

### 1. GitHub Ready
- [ ] Commit all changes: `git add -A && git commit -m "chore: prepare for Railway deployment"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify `.env.local` is NOT committed (it's in `.gitignore`)

### 2. Railway Project Setup
- [ ] Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
- [ ] Select the `foundry` repository
- [ ] Railway will auto-detect Next.js via Nixpacks

### 3. PostgreSQL Setup on Railway
- [ ] In your Railway project → Add Service → Database → PostgreSQL
- [ ] Railway automatically sets `DATABASE_URL` in your app service — no manual copy needed
- [ ] The variable is injected as `${{Postgres.DATABASE_URL}}` — Railway resolves this automatically

### 4. Required Environment Variables
Set these in Railway → Your Service → Variables:

```
DATABASE_SSL=true
JWT_ACCESS_SECRET=<generate: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate: openssl rand -hex 64>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
NEXT_PUBLIC_APP_URL=https://<your-railway-domain>.up.railway.app
RESEND_API_KEY=re_xxxxxxxxxxxx
INVITE_FROM_EMAIL=noreply@yourdomain.com
INVITE_FROM_NAME=Foundry
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SOCIAL_MEDIA_PUBLIC_BASE_URL=https://<your-railway-domain>.up.railway.app
ADMIN_CLEANUP_SECRET=change-this-value
```

> `DATABASE_URL` is automatically injected by Railway when you add the PostgreSQL plugin.

### 5. Run Migrations
After first deploy, open Railway → Your Service → Shell (or use Railway CLI):

```bash
npm run migrate
```

Optionally seed initial data:
```bash
npm run seed
```

### 6. Google OAuth — Update Redirect URI
In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
- Add `https://<your-railway-domain>.up.railway.app/api/auth/google/callback`
  to **Authorized redirect URIs**

### 7. Deployment Commands
Railway handles these automatically on push, but for manual trigger:
```bash
# Build (Railway runs this)
npm install
npm run build

# Start (Railway runs this)
npm start
```

### 8. Post-Deployment Verification
- [ ] `GET https://<domain>/api/health` → `{"status":"ok"}`
- [ ] Visit `https://<domain>/auth` → login page loads
- [ ] Sign up with email/password → creates account, redirects to `/dashboard`
- [ ] Google OAuth → redirect works, lands on `/dashboard`
- [ ] Create a task → data persists in PostgreSQL
- [ ] Check Railway logs for any errors: Railway → Logs tab

---

## Local Development (unchanged)
```bash
npm install
npm run dev          # starts on http://localhost:3000
npm run migrate      # run DB migrations
npm run seed         # seed initial data
```
