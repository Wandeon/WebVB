# DECISIONS.md - Project Decision Log & Index

> Master index for Veliki Bukovec municipality website project.
> For detailed specifications, see domain-specific documents in `docs/` folder.
> Last updated: 2026-01-23

## Quick Links

| Document | Contents |
|----------|----------|
| [FEATURES.md](docs/FEATURES.md) | Product specification, site structure, admin features, search, newsletter |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Infrastructure, deployment, code organization, tech stack |
| [DATABASE.md](docs/DATABASE.md) | Schema, API endpoints, response formats |
| [SECURITY.md](docs/SECURITY.md) | Authentication, VPS hardening, compliance, env variables |
| [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Design tokens, components, animations, responsive behavior |
| [OPERATIONS.md](docs/OPERATIONS.md) | Testing, performance, monitoring, development process |
| [ROADMAP.md](ROADMAP.md) | 8-phase implementation plan (AI features last) |
| [CLAUDE.md](CLAUDE.md) | AI assistant instructions |
| [AGENTS.md](AGENTS.md) | Agent definitions and Definition of Done |

---

## Project Overview

**Client:** Općina Veliki Bukovec (Croatian municipality)
**Goal:** Digital transformation - modern website with AI features, custom CMS, email migration
**Contract Value:** €5,250 (incl. PDV)
**Deadline:** 60 days from contract signing
**Importance:** Showcase project - must be flawless

---

## Key Decisions Summary

### Architecture Decisions (Updated 2026-01-23)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Framework** | Next.js 16 (LTS) | Current stable, Turbopack default, React 19.2, Cache Components |
| **Auth** | Better Auth | OSS, TypeScript-first, built-in MFA/rate-limiting, no vendor lock-in |
| CMS | Custom (dropped WordPress) | Simpler UX for non-tech staff, single tech stack, lighter |
| Public Site | Next.js 16 static export | Pre-rendered, deployed to Cloudflare Pages |
| Admin Panel | Next.js 16 SSR on VPS | Server-side rendering for dynamic admin functionality |
| Database | PostgreSQL + pgvector | Robust, vector search for RAG chatbot |
| ORM | Prisma | Type-safe, good DX, improved cold starts (no Rust engine) |
| **Hosting (Public)** | Cloudflare Pages | Git-based deploy, global CDN, free |
| Hosting (Admin) | Netcup VPS 1000 G12 | EU-based, good price/performance |
| **Hosting (Email)** | Siteground | Email hosting + backup static site |
| **Images** | Cloudflare R2 | Zero egress, $0.015/GB, served via CDN |
| LLM | Ollama Cloud (Pro/Max plan) | Validate limits, queue + retry on rate limit |
| Embeddings | Local Ollama (nomic-embed-text) | Frequent calls, small model fits VPS RAM |
| Monorepo | Turborepo | Shared packages, optimized builds |
| Rich Text | TipTap | Mature ecosystem, works with shadcn/ui |

### Feature Decisions

| Feature | Decision | Details |
|---------|----------|---------|
| Language | Croatian only | No i18n needed |
| Dashboard | Full analytics from Cloudflare | Visitor stats, pages, traffic |
| Gallery | Album-based organization | Albums with drag-drop ordering |
| Search | Premium "Stripe-like" UX | Hybrid PostgreSQL FTS + semantic |
| Newsletter | Weekly automated summary | Double opt-in, news + events digest |
| Contact Form | Email + Admin inbox | Tracked with status workflow |
| Problem Reports | Full tracking in admin | Status, resolution notes, images |
| Events | Calendar view | Monthly calendar with event details |
| Document Migration | Yes, migrate all | From existing WordPress site |
| Email Migration | Yes, migrate accounts | Move existing emails to Siteground |
| AI Content | Human review required | Never auto-publish AI-generated |
| **Feature Flags** | None | Ship everything, AI features last in roadmap |

### External Links (Not Built In-App)

| Service | External URL |
|---------|--------------|
| e-Savjetovanja | Link to official government portal |
| e-Nabava (Tenders) | Link to official government portal |
| MOBES | Link to MOBES system |
| Budget Visualization | Link to external budget site |

---

## Cost Structure (Updated)

| Service | Monthly Cost |
|---------|--------------|
| Cloudflare Pages | Free |
| Cloudflare R2 (images + backups) | ~€5-15 |
| Cloudflare (CDN, DNS, Analytics) | Free tier |
| Netcup VPS 1000 G12 | ~€8 |
| Ollama Cloud (Pro plan) | ~€20-30 (validate limits) |
| Siteground (email only) | Already paid |
| **Total recurring** | **~€33-53/month** |

---

## Discussion Log

### Session 1 - 2026-01-23

#### Hosting Architecture
- **Discussed:** Siteground limitations for Next.js
- **Initial decision:** Keep Siteground, front with Cloudflare CDN
- **Revised (Session 3):** Move public site to Cloudflare Pages

#### WordPress vs Custom CMS
- **Discussed:** WordPress complexity for non-tech staff
- **Decided:** Drop WordPress, build custom admin
- **Why:** 70 tables vs ~19 needed, complete UX control, single stack

#### VPS & AI Services
- **Decided:** Netcup VPS + Ollama Cloud
- **Why:** EU-based, local embeddings on VPS

#### API Architecture
- **Initial plan:** Cloudflare Workers for API
- **Revised:** Direct API routes in admin app
- **Why:** Simpler architecture, all server logic in one place

### Session 2 - 2026-01-23

#### Authentication System
- **Initial decision:** NextAuth.js with multiple methods
- **Revised (Session 3):** Better Auth (NextAuth v5 never reached stable)
- **Methods:** Email/password, Google OAuth, Passkeys/WebAuthn, TOTP 2FA
- **Details:** See [SECURITY.md](docs/SECURITY.md)

#### Definition of Done System
- **Problem:** Half-finished features with TODOs reported as "done"
- **Solution:** Comprehensive DoD checklist with CI enforcement
- **Details:** See [AGENTS.md](AGENTS.md)

#### Feature Specifications
Resolved all open questions:
- Dashboard, Gallery, Search, Newsletter, Contact, Events, etc.
- **Details:** See [FEATURES.md](docs/FEATURES.md)

#### Document Reorganization
- **Problem:** DECISIONS.md grew to 3000+ lines
- **Solution:** Split into 6 domain-specific files in `docs/`

### Session 3 - 2026-01-23 (Tech Stack Audit)

External reviews identified critical issues. Decisions updated:

#### Framework Update
- **Old:** Next.js 14
- **New:** Next.js 16 (LTS, released Oct 2025)
- **Why:** Turbopack default, React 19.2, Cache Components, proxy.ts

#### Auth Update
- **Old:** NextAuth.js
- **New:** Better Auth
- **Why:** NextAuth v5 never reached stable, main contributor quit Jan 2025. Better Auth is OSS, TypeScript-first, has built-in MFA, rate limiting, audit logging.

#### Image Hosting Update
- **Old:** Sharp on VPS → SFTP to Siteground
- **New:** Sharp on VPS → Upload to Cloudflare R2
- **Why:** Zero egress fees, faster, no SFTP brittleness, CDN delivery

#### Public Site Hosting Update
- **Old:** Siteground + Cloudflare CDN
- **New:** Cloudflare Pages (Git-based deploy)
- **Why:** Faster builds, no SFTP, global edge deployment
- **Siteground:** Kept for email hosting + backup static site

#### Ollama Pricing Clarification
- **Old:** "€20/mo flat rate"
- **New:** Tiered plans (Free/Pro/Max) with hourly/weekly limits
- **Fallback:** Queue + retry when rate limited

#### Code Limits Update
- **Rule:** 300-line max per component
- **Exception:** Orchestrator components (e.g., Post Editor with AI) can exceed with documented justification

#### Feature Flags
- **Decision:** No feature flags - ship everything
- **Strategy:** AI features (generation, chatbot) implemented last in roadmap

---

## Architecture Diagram (Updated)

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

---

## Project Readiness Checklist

### Documentation Complete
- [x] Architecture documented
- [x] Database schema defined
- [x] API endpoints specified
- [x] Security requirements defined
- [x] Design system specified
- [x] Feature requirements complete
- [x] Development roadmap created
- [x] Definition of Done established
- [x] Tech stack audit completed

### Ready to Implement
- [x] Tech stack decided (Next.js 16, Better Auth, Prisma)
- [x] Hosting providers selected (Cloudflare Pages, VPS, R2)
- [x] Budget confirmed (~€33-53/mo)
- [x] All feature questions resolved
- [x] External vs internal features clarified
- [x] AI fallback strategy defined

### Before Development Starts
- [ ] VPS provisioned and hardened
- [ ] Cloudflare Pages project created
- [ ] Cloudflare R2 bucket created
- [ ] Domain DNS configured
- [ ] Database created
- [ ] CI/CD pipeline configured
- [ ] Development environment ready
- [ ] Email migration planned

---

## Document History

| Date | Changes |
|------|---------|
| 2026-01-23 | Initial decisions, architecture, feature specs |
| 2026-01-23 | Added authentication system, Definition of Done |
| 2026-01-23 | Split into domain-specific documents |
| 2026-01-23 | Tech stack audit: Next.js 16, Better Auth, Cloudflare Pages, R2 |
