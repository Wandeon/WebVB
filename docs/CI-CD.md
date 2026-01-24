# CI/CD Pipeline Documentation

This document describes the continuous integration and deployment setup for the Veliki Bukovec website monorepo.

## GitHub Actions

### Workflow Location

`.github/workflows/ci.yml`

### Triggers

| Event | Branch | Jobs Run |
|-------|--------|----------|
| Pull Request | `main` | Lint, Type Check, Test |
| Push | `main` | Lint, Type Check, Test, then Build |

### Pipeline Behavior

**On Pull Request to main:**
- Runs lint, type-check, and test jobs
- Validates code quality before merge
- Uses concurrency groups to cancel outdated runs

**On Push to main:**
- Runs the same CI checks (lint, type-check, test)
- If CI passes, runs the build job
- Build job only executes on push events to main

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
