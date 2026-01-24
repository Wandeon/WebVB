# CI/CD Pipeline Documentation

This document describes the continuous integration and deployment setup for the Veliki Bukovec website monorepo.

## GitHub Actions

### Workflow Location

`.github/workflows/ci.yml`

### Triggers

| Event | Branch | Jobs Run | Runner |
|-------|--------|----------|--------|
| Pull Request | `main` | Lint, Type Check, Test | GitHub-hosted |
| Push | `main` | Lint, Type Check, Test, then Build | GitHub-hosted (self-hosted when ready) |

### Pipeline Behavior

**On Pull Request to main:**
- Runs lint, type-check, and test jobs
- Validates code quality before merge
- Blocks TODO/FIXME comments, console.log, and `any` types in changed TypeScript files
- Uses concurrency groups to cancel outdated runs
- **Always runs on GitHub-hosted runners** (safe for untrusted code)

**On Push to main:**
- Runs the same CI checks (lint, type-check, test)
- Applies the same guardrails against TODO/FIXME comments, console.log, and `any` types in changed TypeScript files
- If CI passes, runs the build job
- Build job only executes on push events to main
- **Can run on self-hosted runner** (trusted code only)

### Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│  SECURITY: Runner Selection                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PR from anyone ──► GitHub-hosted runner (safe sandbox)          │
│                     - No access to secrets                       │
│                     - Isolated VM destroyed after run            │
│                                                                  │
│  Merge to main ───► Self-hosted runner OK (trusted code)         │
│                     - Code has been reviewed                     │
│                     - Warm caches = faster builds                │
│                     - Can access deploy secrets                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Why this matters:** A self-hosted runner executes arbitrary code from the repo. A malicious PR could steal secrets or compromise your infrastructure. Only run trusted (merged) code on self-hosted runners.

## Caching Strategy

The workflow uses multiple caches for faster builds:

| Cache | Purpose | Key Strategy |
|-------|---------|--------------|
| pnpm store | Node modules | Built into `actions/setup-node` with `cache: pnpm` |
| Turborepo | Build artifacts | `.turbo/` directory, keyed by lockfile + commit SHA |
| Prisma client | Generated client | `node_modules/.prisma`, keyed by schema hash |
| Next.js cache | Build cache | `.next/cache/`, keyed by lockfile + source hash |

**Expected speedups after first run:**
- Install: ~30s → ~5s (pnpm store cached)
- Lint/Type-check: Uses Turborepo cache
- Build: Incremental (Next.js cache)

## GitHub Repository Configuration

### Optional Secrets

| Secret | Purpose | Required |
|--------|---------|----------|
| `TURBO_TOKEN` | Turborepo remote cache authentication | No (speeds up CI) |

### Optional Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `TURBO_TEAM` | Turborepo team name for remote cache | No (speeds up CI) |

> **Note:** Turborepo remote caching is optional but recommended for faster CI runs. Without these, the pipeline still works but won't benefit from cached build artifacts across runs.

## Build Environment Variables

The build job sets these environment variables for build-time only. These are **not runtime secrets** - they are placeholders that allow the build process to complete successfully.

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `postgresql://localhost:5432/placeholder` | Placeholder for Prisma schema generation |
| `BETTER_AUTH_SECRET` | `build-time-placeholder-secret-32chars` | Placeholder for Better Auth configuration |
| `BETTER_AUTH_URL` | `http://localhost:3001` | Placeholder for Better Auth URL |

### Why Placeholders?

- **Prisma** requires a valid `DATABASE_URL` format to generate the client during build
- **Better Auth** validates its configuration at build time
- These values are never used at runtime - production apps use real environment variables from their hosting environment

---

## Self-Hosted Runner Setup (VPS)

When the Netcup VPS is ready, follow these steps to set up a self-hosted runner for faster builds.

### Prerequisites

- VPS with SSH access via Tailscale
- Non-root user (e.g., `runner`)
- Node.js 20+ installed
- pnpm installed globally

### Step 1: Create Runner User

```bash
# On VPS
sudo adduser runner --disabled-password
sudo usermod -aG docker runner  # Only if Docker needed
```

### Step 2: Register Runner

1. Go to GitHub repo → Settings → Actions → Runners → New self-hosted runner
2. Select **Linux** and **x64**
3. Follow the download and configure instructions
4. Use these labels: `self-hosted`, `vb-prod`

```bash
# On VPS as runner user
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux-x64-2.xxx.x.tar.gz -L https://github.com/...
tar xzf ./actions-runner-linux-x64-2.xxx.x.tar.gz
./config.sh --url https://github.com/Wandeon/WebVB --token YOUR_TOKEN --labels self-hosted,vb-prod
```

### Step 3: Install as Service

```bash
sudo ./svc.sh install
sudo ./svc.sh start
```

### Step 4: Enable in Workflow

Edit `.github/workflows/ci.yml` and change the build job:

```yaml
build:
  # Change from:
  # runs-on: ubuntu-latest
  # To:
  runs-on: [self-hosted, vb-prod]
```

### Runner Security Checklist

- [ ] Runner user is non-root
- [ ] No sudo access for runner user
- [ ] Runner only processes `main` branch (PR checks stay on GitHub-hosted)
- [ ] UFW blocks unnecessary ports
- [ ] Consider network egress restrictions

---

## Cloudflare Pages

> **Note:** The web app is a static export (no server runtime). Environment variables are only needed for the build process and are not used at runtime. No runtime secrets are required.

### Setup Instructions

1. Log in to Cloudflare Dashboard
2. Navigate to **Workers & Pages** > **Create application** > **Pages**
3. Connect to Git and select the repository
4. Configure build settings as described below

### Build Settings

| Setting | Value |
|---------|-------|
| Framework preset | Next.js (Static HTML Export) |
| Build command | `pnpm build --filter @repo/web` |
| Build output directory | `apps/web/.next` |
| Root directory | `/` (repository root) |

### Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_VERSION` | `20` | Node.js version for build |
| `PNPM_VERSION` | `9` | pnpm version for package management |

### Preview Deployments

Cloudflare Pages automatically creates preview deployments for pull requests:

- Each PR gets a unique preview URL
- Preview URLs follow the pattern: `feature-branch.my-project.pages.dev`
- Previews update automatically on new commits to the PR
- Preview deployments are useful for testing changes before merging

---

## Local Development

To run the same checks locally before pushing:

```bash
pnpm lint && pnpm type-check && pnpm test && pnpm build
```

### Individual Commands

```bash
# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Run tests
pnpm test

# Build all apps
pnpm build
```

### Turborepo Caching

Local builds benefit from Turborepo's local cache by default. To connect to remote cache for shared caching:

```bash
npx turbo login
npx turbo link
```

---

## Branch Protection (Recommended)

After CI is working, enable branch protection on `main`:

1. Go to GitHub repo > Settings > Branches
2. Add rule for `main`:
   - [x] Require a pull request before merging
   - [x] Require status checks to pass before merging
     - Select: `Lint, Type Check, Test`
   - [x] Require branches to be up to date before merging
   - [x] Do not allow bypassing the above settings

This ensures all code merged to main passes CI checks.
