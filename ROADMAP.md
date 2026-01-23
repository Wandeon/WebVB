# ROADMAP.md - Development Roadmap

> Track progress and upcoming work for the Veliki Bukovec project.
> Update this file as tasks are completed.
> **Note:** AI features (generation, chatbot) moved to final phases per project decision.

## Current Status

**Phase:** Not Started
**Overall Progress:** 0%
**Target Launch:** TBD

---

## Phase 0: Foundation
**Status:** Not Started | **Progress:** 0/6

| Task | Status | Notes |
|------|--------|-------|
| Project setup (Turborepo, pnpm, configs) | ⬜ Pending | Next.js 16, TypeScript strict |
| CI/CD pipeline (GitHub Actions) | ⬜ Pending | Lint, type check, test, deploy |
| Database schema implementation (Prisma) | ⬜ Pending | PostgreSQL + pgvector |
| Authentication system (Better Auth) | ⬜ Pending | Email, Google OAuth, Passkeys, 2FA |
| Shared UI components (shadcn/ui setup) | ⬜ Pending | |
| Design tokens & Tailwind v4 config | ⬜ Pending | |

**Deliverable:** Empty but working apps with auth

---

## Phase 1: Admin Core
**Status:** Not Started | **Progress:** 0/10

| Task | Status | Notes |
|------|--------|-------|
| Admin layout (sidebar, header, responsive) | ⬜ Pending | |
| Dashboard page (Cloudflare Analytics) | ⬜ Pending | Stats, recent activity |
| Posts CRUD (list, create, edit, delete) | ⬜ Pending | |
| Rich text editor (TipTap) integration | ⬜ Pending | |
| Image upload to Cloudflare R2 | ⬜ Pending | Sharp processing, variants |
| Documents management | ⬜ Pending | PDF upload to R2 |
| Static pages management | ⬜ Pending | |
| Events calendar management | ⬜ Pending | |
| Gallery management | ⬜ Pending | Album-based with reordering |
| Settings page (profile, site basics) | ⬜ Pending | |

**Deliverable:** Functional admin panel (no AI)

---

## Phase 2: Public Website
**Status:** Not Started | **Progress:** 0/11

| Task | Status | Notes |
|------|--------|-------|
| Homepage with all sections | ⬜ Pending | Hero, news, events, quick links |
| News listing & detail pages | ⬜ Pending | Pagination, categories |
| Documents section with categories | ⬜ Pending | Filterable by year |
| Events calendar view | ⬜ Pending | Monthly calendar |
| Gallery with lightbox | ⬜ Pending | Album-based |
| All static pages | ⬜ Pending | Organization, landmarks, info |
| Contact page with forms | ⬜ Pending | Contact + problem reports |
| Premium search (Stripe-like) | ⬜ Pending | Cmd+K, instant results |
| Newsletter signup widget | ⬜ Pending | Double opt-in |
| Responsive design & animations | ⬜ Pending | Mobile-first |
| SEO implementation | ⬜ Pending | Meta, OG, JSON-LD, sitemap |

**Deliverable:** Complete public website (static export)

---

## Phase 3: Deployment & Infrastructure
**Status:** Not Started | **Progress:** 0/9

| Task | Status | Notes |
|------|--------|-------|
| VPS setup (Netcup) | ⬜ Pending | Ubuntu 24.04, hardening |
| PostgreSQL + pgvector installation | ⬜ Pending | |
| Ollama local (embeddings) installation | ⬜ Pending | nomic-embed-text |
| Tailscale VPN setup | ⬜ Pending | SSH access only via VPN |
| Admin deployment to VPS (PM2) | ⬜ Pending | |
| Cloudflare Pages setup | ⬜ Pending | Git-based deploy |
| Cloudflare R2 buckets | ⬜ Pending | Images + backups |
| Cloudflare DNS + WAF | ⬜ Pending | |
| Backup automation | ⬜ Pending | Daily to R2 |

**Deliverable:** Live, deployable system

---

## Phase 4: Content Migration
**Status:** Not Started | **Progress:** 0/7

| Task | Status | Notes |
|------|--------|-------|
| Export content from WordPress | ⬜ Pending | Posts, pages, documents |
| Content mapping to new structure | ⬜ Pending | Categories, slugs |
| Automated migration scripts | ⬜ Pending | |
| Image migration to R2 | ⬜ Pending | With optimization |
| Email migration to Siteground | ⬜ Pending | Existing accounts |
| Content review & cleanup | ⬜ Pending | |
| Redirect setup (old URLs → new) | ⬜ Pending | |

**Deliverable:** All content migrated

---

## Phase 5: Communication Features
**Status:** Not Started | **Progress:** 0/6

| Task | Status | Notes |
|------|--------|-------|
| Contact form backend | ⬜ Pending | Status workflow |
| Problem reports backend | ⬜ Pending | Tracking, images, resolution |
| Newsletter system | ⬜ Pending | Weekly automated + manual |
| Email templates | ⬜ Pending | Croatian, branded |
| Admin notification system | ⬜ Pending | New messages, reports |
| User management interface | ⬜ Pending | Admin/Staff CRUD |

**Deliverable:** Full communication features

---

## Phase 6: AI Integration
**Status:** Not Started | **Progress:** 0/7

| Task | Status | Notes |
|------|--------|-------|
| Ollama Cloud connection | ⬜ Pending | Llama 3.1 70B Pro plan |
| AI queue system | ⬜ Pending | Queue + retry on rate limit |
| AI content generation pipeline | ⬜ Pending | 5-step review flow |
| Google Search integration | ⬜ Pending | Context gathering |
| Multi-step human review flow | ⬜ Pending | Never auto-publish |
| Facebook preview & posting | ⬜ Pending | |
| Image handling in AI flow | ⬜ Pending | |

**Deliverable:** AI-powered post creation

---

## Phase 7: Chatbot & Polish
**Status:** Not Started | **Progress:** 0/8

| Task | Status | Notes |
|------|--------|-------|
| RAG system setup | ⬜ Pending | pgvector embeddings |
| Document processing pipeline | ⬜ Pending | Chunk + embed PDFs |
| Chatbot UI widget | ⬜ Pending | Floating button |
| Chatbot testing & training | ⬜ Pending | |
| Performance optimization | ⬜ Pending | Lighthouse > 90 |
| Accessibility audit (WCAG AA) | ⬜ Pending | |
| Security audit (NIS2) | ⬜ Pending | |
| Final animations & polish | ⬜ Pending | |

**Deliverable:** Complete chatbot + polished product

---

## Phase 8: Testing & Launch
**Status:** Not Started | **Progress:** 0/7

| Task | Status | Notes |
|------|--------|-------|
| End-to-end testing (Playwright) | ⬜ Pending | Critical flows |
| User acceptance testing | ⬜ Pending | With client |
| Staff training | ⬜ Pending | Admin usage |
| Documentation finalization | ⬜ Pending | |
| DNS switch | ⬜ Pending | Go live |
| Launch! | ⬜ Pending | |
| Post-launch monitoring | ⬜ Pending | Sentry, UptimeRobot |

**Deliverable:** LIVE WEBSITE

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ⬜ | Pending |
| 🔄 | In Progress |
| ✅ | Completed |
| ⏸️ | Blocked |
| ❌ | Cancelled |

---

## Phase Summary

| Phase | Focus | Key Tech |
|-------|-------|----------|
| 0 | Foundation | Next.js 16, Better Auth, Prisma |
| 1 | Admin Core | TipTap, R2 uploads, CRUD |
| 2 | Public Website | Static export, Search, Newsletter |
| 3 | Deployment | VPS, Cloudflare Pages, R2 |
| 4 | Migration | WordPress → New system |
| 5 | Communication | Contact, Problems, Newsletter |
| 6 | AI Integration | Ollama Cloud, Generation flow |
| 7 | Chatbot & Polish | RAG, Accessibility, Security |
| 8 | Testing & Launch | E2E, Training, Go Live |

---

## Change Log

| Date | Phase | Change |
|------|-------|--------|
| 2026-01-23 | - | Initial roadmap created |
| 2026-01-23 | - | Tech stack audit: Next.js 16, Better Auth, Cloudflare Pages |
| 2026-01-23 | - | Reorganized: AI features moved to Phase 6-7 (last) |

---

## Notes

- Each phase should be completed before moving to the next
- AI features intentionally placed last per project decision
- Blockers should be escalated immediately
- Update this file daily during active development
