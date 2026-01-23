# ARCHITECTURE.md - System Architecture

> Infrastructure, deployment, and code organization documentation.
> Last updated: 2026-01-23

## Table of Contents

1. [System Overview](#system-overview)
2. [Infrastructure](#infrastructure)
3. [Domain Structure](#domain-structure)
4. [Deployment Strategy](#deployment-strategy)
5. [Code Organization](#code-organization)
6. [Tech Stack](#tech-stack)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  VISITORS (Public Internet)                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE                                                     │
│  ├── Pages (public site)    ├── R2 (images, backups)           │
│  ├── CDN + WAF + DDoS       ├── Analytics                       │
│  └── DNS                    └── SSL                             │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────────┐
│  CLOUDFLARE PAGES         │   │  NETCUP VPS 1000 G12            │
│  ├── Public website       │   │  ├── Admin Panel (Next.js 16)   │
│  │   (static HTML/CSS/JS) │   │  ├── PostgreSQL + pgvector      │
│  └── Git-based deploy     │   │  ├── Ollama (embeddings)        │
│                           │   │  └── Better Auth                │
│  velikibukovec.hr         │   │  admin.velikibukovec.hr         │
└───────────────────────────┘   └─────────────────────────────────┘
                                              │
                ┌─────────────────────────────┼─────────────────┐
                ▼                             ▼                 ▼
       ┌──────────────┐              ┌──────────────┐   ┌──────────────┐
       │ Ollama Cloud │              │  Cloudflare  │   │  Siteground  │
       │ Llama 3.1 70B│              │      R2      │   │   (Email)    │
       │  (Pro plan)  │              │   (Images)   │   │              │
       └──────────────┘              └──────────────┘   └──────────────┘
```

### Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| Security first | All internal services localhost-only, Tailscale VPN |
| Static where possible | Public site pre-rendered, deployed to Cloudflare Pages |
| Simple over clever | REST API, PostgreSQL, no microservices |
| Mobile first | Design for 375px first, then scale up |
| Export-safe | Public app has no runtime Route Handlers, all params resolvable at build |

---

## Infrastructure

### Services

| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| Public Site | Cloudflare Pages | Static HTML hosting, Git deploy | Free |
| CDN & Security | Cloudflare | DDoS, WAF, Analytics, DNS | Free |
| Images & Backups | Cloudflare R2 | Zero-egress storage | ~€5-15/mo |
| Admin + API | Netcup VPS 1000 G12 | Next.js 16 SSR, PostgreSQL | ~€8/mo |
| LLM API | Ollama Cloud (Pro) | Content generation (Llama 3.1 70B) | ~€20-30/mo |
| Email | Siteground | Email hosting, backup static | Already paid |
| **Total** | | | **~€33-53/mo** |

### VPS Specifications (Netcup VPS 1000 G12)

- vCPU: 4 cores
- RAM: 8 GB
- Storage: 256 GB NVMe SSD
- Bandwidth: Unmetered
- OS: Ubuntu 24.04 LTS

### Storage Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  IMAGE STORAGE (Cloudflare R2)                                  │
├─────────────────────────────────────────────────────────────────┤
│  Upload Flow:                                                   │
│  1. User uploads image in admin                                 │
│  2. Sharp processes on VPS (resize, WebP, strip metadata)       │
│  3. Variants uploaded to R2 (thumbnail, medium, large)          │
│  4. Public site loads from R2 via Cloudflare CDN                │
│                                                                 │
│  Bucket: velikibukovec-images                                   │
│  Public access: Yes (via custom domain or r2.dev)               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  BACKUP STRATEGY                                                │
├─────────────────────────────────────────────────────────────────┤
│  Frequency: Daily (automated cron)                              │
│  Retention: 3 months (90 days)                                  │
│  Storage: Cloudflare R2                                         │
│  Bucket: velikibukovec-backups                                  │
│  Contents:                                                      │
│    • PostgreSQL database dump (encrypted)                       │
│    • Uploaded documents (PDFs)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Domain Structure

| Domain | Purpose | Hosting |
|--------|---------|---------|
| `velikibukovec.hr` | Public website | Cloudflare Pages |
| `admin.velikibukovec.hr` | Admin panel | VPS + Cloudflare proxy |
| `images.velikibukovec.hr` | Image CDN (optional) | Cloudflare R2 custom domain |

### Why Subdomain for Admin

- Separate deployment (VPS vs Cloudflare Pages)
- Different caching rules
- Better security isolation
- Cleaner separation of concerns

### SSL Certificates

- Both domains proxied through Cloudflare
- Cloudflare provides free SSL (edge certificates)
- Origin connection: Cloudflare → VPS (Full Strict mode)
- No manual cert management needed

---

## Deployment Strategy

### Public Site (Cloudflare Pages)

```
┌─────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE PAGES DEPLOY                                        │
├─────────────────────────────────────────────────────────────────┤
│  Trigger: Push to main branch OR manual from admin              │
│                                                                 │
│  1. GitHub webhook triggers Cloudflare Pages build              │
│  2. Next.js 16 static export runs                               │
│  3. Output deployed to Cloudflare edge (300+ locations)         │
│  4. Automatic cache invalidation                                │
│  5. Preview URLs for PRs                                        │
│                                                                 │
│  Build time: ~1-3 minutes depending on content volume           │
│  Rollback: Instant via Cloudflare dashboard                     │
└─────────────────────────────────────────────────────────────────┘
```

### Admin Panel (VPS)

```
┌─────────────────────────────────────────────────────────────────┐
│  VPS DEPLOY (GitHub Actions)                                    │
├─────────────────────────────────────────────────────────────────┤
│  1. Push to main triggers GitHub Actions                        │
│  2. Build and test in CI                                        │
│  3. SSH to VPS via Tailscale                                    │
│  4. Pull latest code, run migrations                            │
│  5. Restart PM2 process                                         │
│  6. Health check                                                │
│                                                                 │
│  Zero-downtime: PM2 cluster mode with graceful reload           │
└─────────────────────────────────────────────────────────────────┘
```

### Content Publish Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  PUBLISH FLOW                                                   │
├─────────────────────────────────────────────────────────────────┤
│  1. User clicks "Publish" in admin                              │
│  2. Content saved to database                                   │
│  3. Trigger Cloudflare Pages rebuild via API                    │
│  4. Build runs (~1-3 minutes)                                   │
│  5. Success notification to user                                │
│                                                                 │
│  Note: User can continue working while build runs               │
│  Status shown in admin dashboard                                │
└─────────────────────────────────────────────────────────────────┘
```

### Rollback Protection

```
┌─────────────────────────────────────────────────────────────────┐
│  ROLLBACK PROTECTION                                            │
├─────────────────────────────────────────────────────────────────┤
│  Cloudflare Pages:                                              │
│  • Automatic rollback to previous deploy if build fails         │
│  • Keep all deploy history (instant rollback in dashboard)      │
│  • Preview deploys for testing before production                │
│                                                                 │
│  VPS Admin:                                                     │
│  • Git-based rollback (revert commit)                           │
│  • Database migrations are forward-only                         │
│  • Health check after deploy                                    │
└─────────────────────────────────────────────────────────────────┘
```

### CI/CD Pipeline (GitHub Actions)

```yaml
On Pull Request:
  → Lint (ESLint)
  → Type check (TypeScript)
  → Unit tests (Vitest)
  → Build check

On Merge to Main:
  → All above +
  → E2E tests (Playwright)
  → Build production
  → Deploy admin to VPS (SSH via Tailscale)
  → Trigger Cloudflare Pages rebuild
  → Health check
  → Notify on failure
```

---

## Code Organization

### Monorepo Structure (Turborepo)

```
velikibukovec/
│
├── apps/
│   │
│   ├── web/                          # Public website (Next.js 16 static)
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (public)/             # Public routes group
│   │   │   │   ├── vijesti/          # News pages
│   │   │   │   ├── dokumenti/        # Documents
│   │   │   │   ├── dogadanja/        # Events
│   │   │   │   ├── galerija/         # Gallery
│   │   │   │   ├── kontakt/          # Contact
│   │   │   │   └── ...
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Homepage
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layouts/
│   │   │   ├── sections/
│   │   │   └── features/
│   │   ├── lib/
│   │   │   └── r2-loader.ts          # Custom image loader for R2
│   │   ├── hooks/
│   │   ├── public/
│   │   ├── next.config.ts            # Static export config
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── admin/                        # Admin panel (Next.js 16 SSR)
│       ├── app/
│       │   ├── (auth)/               # Auth routes (no sidebar)
│       │   │   ├── login/
│       │   │   └── layout.tsx
│       │   ├── (dashboard)/          # Dashboard routes (with sidebar)
│       │   │   ├── page.tsx          # Dashboard home
│       │   │   ├── posts/
│       │   │   ├── documents/
│       │   │   ├── events/
│       │   │   ├── galleries/
│       │   │   ├── settings/
│       │   │   └── layout.tsx
│       │   └── api/                  # API routes
│       │       ├── auth/
│       │       ├── posts/
│       │       ├── documents/
│       │       ├── ai/
│       │       ├── build/
│       │       └── analytics/
│       ├── components/
│       │   ├── layouts/
│       │   └── features/
│       ├── lib/
│       │   ├── auth.ts               # Better Auth config
│       │   └── r2.ts                 # R2 upload utilities
│       ├── hooks/
│       └── package.json
│
├── packages/
│   │
│   ├── database/                     # Prisma + Database
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── repositories/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared/                       # Shared utilities & types
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── schemas/              # Zod validation
│   │   │   ├── utils/
│   │   │   ├── constants/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── ui/                           # Shared UI components
│       ├── src/
│       │   ├── primitives/
│       │   ├── components/
│       │   ├── animations/
│       │   ├── hooks/
│       │   └── index.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── tooling/                          # Shared tooling configs
│   ├── eslint/
│   ├── typescript/
│   └── prettier/
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── FEATURES.md
│   ├── SECURITY.md
│   ├── DESIGN-SYSTEM.md
│   └── OPERATIONS.md
│
├── scripts/                          # Build & deploy scripts
│   ├── deploy-admin.sh
│   ├── backup-db.sh
│   ├── upload-to-r2.ts
│   └── seed-db.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-admin.yml
│       └── trigger-pages-build.yml
│
├── CLAUDE.md                         # Claude Code instructions
├── AGENTS.md                         # Agent definitions
├── DECISIONS.md                      # Architecture decisions
├── ROADMAP.md                        # Development roadmap
├── CHANGELOG.md
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
└── .gitignore
```

### Static Export Constraint

```
┌─────────────────────────────────────────────────────────────────┐
│  STATIC EXPORT RULES (apps/web)                                 │
├─────────────────────────────────────────────────────────────────┤
│  The public site MUST be export-safe:                           │
│                                                                 │
│  ✓ All dynamic params resolvable from DB at build time          │
│  ✓ generateStaticParams() for all dynamic routes                │
│  ✓ No runtime Route Handlers in public app                      │
│  ✓ No server-only imports in page components                    │
│  ✓ Custom R2 image loader (not default next/image optimizer)    │
│                                                                 │
│  next.config.ts:                                                │
│    output: 'export'                                             │
│    images: { loader: 'custom', loaderFile: './lib/r2-loader' }  │
└─────────────────────────────────────────────────────────────────┘
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `post-editor.tsx`, `use-posts.ts` |
| Components | PascalCase | `PostEditor`, `AdminLayout` |
| Functions | camelCase | `formatDate()`, `generateSlug()` |
| Constants | SCREAMING_SNAKE | `MAX_FILE_SIZE`, `API_URL` |
| Types | PascalCase | `Post`, `UserRole`, `ApiResponse` |
| CSS classes | kebab-case (Tailwind) | `bg-primary-500`, `text-lg` |
| Database tables | snake_case | `posts`, `gallery_images` |
| API routes | kebab-case | `/api/posts`, `/api/ai/generate` |
| Env variables | SCREAMING_SNAKE | `DATABASE_URL`, `R2_ACCESS_KEY` |

### Import Order (enforced by ESLint)

```typescript
// 1. React/Next.js
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External packages
import { motion } from 'framer-motion';
import { z } from 'zod';

// 3. Internal packages (@repo/*)
import { Button } from '@repo/ui';
import { PostSchema } from '@repo/shared';
import { db } from '@repo/database';

// 4. Local imports (relative)
import { PostCard } from '@/components/features';
import { formatDate } from '@/lib/utils';

// 5. Types (if separate)
import type { Post } from '@repo/shared';

// 6. Styles (if any)
import './styles.css';
```

---

## Tech Stack

### Core

| Category | Technology | Notes |
|----------|------------|-------|
| Framework | Next.js 16 (App Router) | LTS, Turbopack default, React 19.2 |
| Language | TypeScript (strict) | No `any` types |
| Database | PostgreSQL + pgvector | Vector search for chatbot |
| ORM | Prisma | Type-safe database access |
| Styling | Tailwind CSS v4 | Utility-first |
| Components | shadcn/ui | Customizable primitives |
| Animations | Framer Motion | Smooth, performant |

### Authentication (Better Auth)

| Component | Technology |
|-----------|------------|
| Framework | Better Auth |
| OAuth | Google provider (built-in) |
| Passkeys | WebAuthn (built-in plugin) |
| 2FA | TOTP (built-in plugin) |
| Rate Limiting | Built-in plugin |
| Audit Logging | Built-in plugin |

### AI & Search

| Component | Technology |
|-----------|------------|
| LLM | Llama 3.1 70B (Ollama Cloud Pro) |
| Embeddings | nomic-embed-text (local Ollama) |
| Vector DB | pgvector (PostgreSQL extension) |
| Search | Hybrid (PostgreSQL FTS + semantic) |
| Fallback | Queue + retry on rate limit |

### State Management

| Type | Technology |
|------|------------|
| Server state | TanStack Query v5 |
| UI state | React Context |
| Forms | React Hook Form + Zod |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Public hosting | Cloudflare Pages |
| Admin hosting | Netcup VPS |
| Images | Cloudflare R2 |
| Backups | Cloudflare R2 |
| Email | Siteground |
| CDN | Cloudflare |
| CI/CD | GitHub Actions |
| Monitoring | Sentry, UptimeRobot |
