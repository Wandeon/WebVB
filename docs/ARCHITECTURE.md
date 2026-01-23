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
│  CLOUDFLARE (CDN + Security)                                    │
│  ├── DDoS Protection                                            │
│  ├── WAF (Web Application Firewall)                             │
│  ├── SSL Termination                                            │
│  ├── Caching (static assets, HTML pages)                        │
│  ├── Analytics                                                  │
│  └── Workers (API edge functions if needed)                     │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────────┐
│  SITEGROUND (Static)      │   │  NETCUP VPS 1000 G12            │
│  ├── Public website       │   │  ├── Admin Panel (Next.js SSR)  │
│  │   (static HTML/CSS/JS) │   │  ├── PostgreSQL + pgvector      │
│  └── Image assets         │   │  ├── Ollama (embeddings)        │
│                           │   │  └── Backup jobs                │
│  velikibukovec.hr         │   │  admin.velikibukovec.hr         │
└───────────────────────────┘   └─────────────────────────────────┘
```

### Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| Security first | All internal services localhost-only, Tailscale VPN |
| Static where possible | Public site pre-rendered, cached at edge |
| Simple over clever | REST API, PostgreSQL, no microservices |
| Mobile first | Design for 375px first, then scale up |

---

## Infrastructure

### Services

| Service | Provider | Purpose | Cost |
|---------|----------|---------|------|
| CDN & Security | Cloudflare (Free) | Caching, DDoS, WAF, Analytics | Free |
| Public Site | Siteground | Static HTML hosting | Already paid |
| Admin + API | Netcup VPS 1000 G12 | Next.js SSR, PostgreSQL | ~€8/mo |
| LLM API | Ollama Cloud | Content generation (Llama 3.1 70B) | €20/mo |
| Backups | Cloudflare R2 | Database + file backups | ~€5-10/mo |
| **Total** | | | **~€33-38/mo** |

### VPS Specifications (Netcup VPS 1000 G12)

- vCPU: 4 cores
- RAM: 8 GB
- Storage: 256 GB NVMe SSD
- Bandwidth: Unmetered
- OS: Ubuntu 22.04 LTS

### Storage Strategy

```
┌─────────────────────────────────────────────────┐
│  FILE STORAGE                                   │
│  Phase 1: VPS local (256GB NVMe available)      │
│  Phase 2: Migrate to Cloudflare R2 (if needed)  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  BACKUP STRATEGY                                │
│  Frequency: Daily (automated cron)              │
│  Retention: 3 months (90 days)                  │
│  Storage: Cloudflare R2                         │
│  Contents:                                      │
│    • PostgreSQL database dump                   │
│    • Uploaded files (documents, images)         │
└─────────────────────────────────────────────────┘
```

---

## Domain Structure

| Domain | Purpose | Hosting |
|--------|---------|---------|
| `velikibukovec.hr` | Public website | Siteground + Cloudflare |
| `admin.velikibukovec.hr` | Admin panel | VPS + Cloudflare |

### Why Subdomain for Admin

- Separate deployment (VPS vs Siteground)
- Different caching rules
- Better security isolation
- Cleaner separation of concerns

### SSL Certificates

- Both domains proxied through Cloudflare
- Cloudflare provides free SSL (edge certificates)
- Origin connection: Cloudflare → Siteground/VPS (flexible or full mode)
- No manual cert management needed

---

## Deployment Strategy

### Publish Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  PUBLISH FLOW (instant-feeling for user)                        │
├─────────────────────────────────────────────────────────────────┤
│  1. User clicks "Publish" in admin                              │
│  2. Content saved to database                                   │
│  3. Build triggered (only changed/new pages)                    │
│  4. Changed files synced to Siteground (SFTP)                   │
│  5. Cloudflare cache purged for affected URLs                   │
│  6. Success notification to user                                │
│                                                                 │
│  Target: < 30 seconds from click to live                        │
└─────────────────────────────────────────────────────────────────┘
```

### Rollback Protection

```
┌─────────────────────────────────────────────────────────────────┐
│  ROLLBACK PROTECTION (Coolify-style)                            │
├─────────────────────────────────────────────────────────────────┤
│  • Keep last 5 successful builds                                │
│  • If build fails → don't deploy, notify admin                  │
│  • If deploy fails → auto-rollback to previous build            │
│  • Health check after deploy (verify site responds)             │
│  • Manual rollback available in admin UI                        │
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
  → Deploy to VPS (admin)
  → Deploy to Siteground (public)
  → Purge Cloudflare cache
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
│   ├── web/                          # Public website (Next.js static)
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
│   │   ├── hooks/
│   │   ├── public/
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   └── package.json
│   │
│   └── admin/                        # Admin panel (Next.js SSR)
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
│       ├── tailwind.config.js
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
│   ├── deploy-web.sh
│   ├── deploy-admin.sh
│   ├── backup-db.sh
│   └── seed-db.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-web.yml
│       └── deploy-admin.yml
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
| Env variables | SCREAMING_SNAKE | `DATABASE_URL`, `OLLAMA_API_KEY` |

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
| Framework | Next.js 14 (App Router) | Both public (static) and admin (SSR) |
| Language | TypeScript (strict) | No `any` types |
| Database | PostgreSQL + pgvector | Vector search for chatbot |
| ORM | Prisma | Type-safe database access |
| Styling | Tailwind CSS | Utility-first |
| Components | shadcn/ui | Customizable primitives |
| Animations | Framer Motion | Smooth, performant |

### Authentication

| Component | Technology |
|-----------|------------|
| Framework | NextAuth.js |
| OAuth | Google provider |
| Passkeys | @simplewebauthn/server |
| 2FA | otplib (TOTP) |
| Password | bcrypt/argon2 |

### AI & Search

| Component | Technology |
|-----------|------------|
| LLM | Llama 3.1 70B (Ollama Cloud) |
| Embeddings | nomic-embed-text (local Ollama) |
| Vector DB | pgvector (PostgreSQL extension) |
| Search | Hybrid (PostgreSQL FTS + semantic) |

### State Management

| Type | Technology |
|------|------------|
| Server state | React Query (TanStack Query) |
| UI state | React Context |
| Forms | React Hook Form + Zod |

### Infrastructure

| Component | Technology |
|-----------|------------|
| CDN | Cloudflare |
| Hosting (public) | Siteground |
| Hosting (admin) | Netcup VPS |
| CI/CD | GitHub Actions |
| Backups | Cloudflare R2 |
| Monitoring | Sentry, UptimeRobot |
