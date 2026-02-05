# Domain Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate from IP-based hosting to proper domains: `n.velikibukovec.hr` (public site) and `admin.velikibukovec.hr` (admin/API).

**Architecture:** Update all config files, CORS origins, env files, GitHub secrets references, deployment workflows, and documentation to use domain names instead of raw IPs. Caddy on VPS will handle SSL termination and reverse proxying.

**Tech Stack:** Next.js, Caddy, GitHub Actions, Tailscale (SSH only)

---

### Task 1: Update CORS origins in source code

**Files:**
- Modify: `apps/admin/lib/cors.ts`

**Step 1: Update ALLOWED_ORIGINS and DEFAULT_ORIGIN**

Replace hardcoded Tailscale IP with new domains:

```typescript
const ALLOWED_ORIGINS = [
  'https://velikibukovec.hr',
  'https://www.velikibukovec.hr',
  'https://n.velikibukovec.hr',
  'https://velikibukovec-web.pages.dev',
  // Development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
```

Removes: `http://100.120.125.83` (Tailscale IP no longer needed for CORS - admin is now on its own domain).

**Step 2: Commit**

```bash
git add apps/admin/lib/cors.ts
git commit -m "fix(cors): replace Tailscale IP with domain origins"
```

---

### Task 2: Update environment files

**Files:**
- Modify: `apps/web/.env.local`
- Modify: `apps/admin/.env`
- Modify: `.env.local` (root)

**Step 1: Update apps/web/.env.local**

```env
NEXT_PUBLIC_API_URL=https://admin.velikibukovec.hr
NEXT_PUBLIC_APP_URL=https://admin.velikibukovec.hr
NEXT_PUBLIC_SITE_URL=https://n.velikibukovec.hr
DATABASE_URL="postgresql://velikibukovec:Z2lMBaRPWbNceLOLQMWcwfE0tgdMj6E@100.120.125.83:5432/velikibukovec"
```

Note: DATABASE_URL keeps Tailscale IP - it's only used at build time from dev machine via Tailscale.

**Step 2: Update apps/admin/.env**

```env
DATABASE_URL=postgresql://velikibukovec:Z2lMBaRPWbNceLOLQMWcwfE0tgdMj6E@100.120.125.83:5432/velikibukovec
BETTER_AUTH_SECRET=build-time-placeholder-secret-32chars
BETTER_AUTH_URL=https://admin.velikibukovec.hr
```

**Step 3: Update root .env.local**

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/velikibukovec"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="https://admin.velikibukovec.hr"
NEXT_PUBLIC_APP_URL="https://admin.velikibukovec.hr"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Note: .env files are gitignored, no commit needed.

---

### Task 3: Update .env.example files

**Files:**
- Modify: `.env.example` (root)
- Modify: `apps/admin/.env.example`

**Step 1: Update root .env.example**

Add `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL` examples, update `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` comments.

**Step 2: Update apps/admin/.env.example**

Update production URL examples.

**Step 3: Commit**

```bash
git add .env.example apps/admin/.env.example
git commit -m "docs: update .env.example files with domain URLs"
```

---

### Task 4: Update deployment workflow

**Files:**
- Modify: `.github/workflows/deploy.yml`

**Step 1: Bind admin to localhost (Caddy proxies)**

Change `export HOSTNAME=0.0.0.0` to `export HOSTNAME=127.0.0.1` in the VPS deploy script.

**Step 2: Update deployment summary**

Replace IP-based URLs with domain-based.

**Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "fix(deploy): bind admin to localhost, Caddy handles public access"
```

---

### Task 5: Update deploy-admin.sh script

**Files:**
- Modify: `scripts/deploy-admin.sh`

**Step 1: Update defaults to use localhost (Caddy proxies)**

Keep `ADMIN_HOST=127.0.0.1` (correct for Caddy proxy setup).
Update NEXT_PUBLIC_API_URL logic for domain-based deployment.

**Step 2: Commit**

```bash
git add scripts/deploy-admin.sh
git commit -m "fix(deploy): update deploy script for domain-based setup"
```

---

### Task 6: Update CLAUDE.md documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update VPS Infrastructure section**

- Replace Tailscale IP references with domain names
- Update service descriptions to include Caddy domain routing
- Update deployment instructions to use domains
- Remove hardcoded credentials from examples

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with domain-based infrastructure"
```

---

### Task 7: Update README.md

**Files:**
- Modify: `README.md`

**Step 1: Update Staging Environment section**

Replace Tailscale IP URLs with domain URLs.

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README with production domain URLs"
```

---

### Task 8: Provide Caddyfile and GitHub Secrets (manual steps)

**Output:** Provide the user with:

1. **Caddyfile configuration** for the VPS
2. **GitHub Secrets** that need updating
3. **VPS admin .env** that needs updating

---

### Task 9: Rebuild and deploy

**Step 1: Rebuild web app with new env**

```bash
pnpm build --filter=@repo/web
```

**Step 2: Deploy to VPS**

```bash
rsync -avz --delete apps/web/out/ deploy@100.120.125.83:~/apps/web-static/
```
