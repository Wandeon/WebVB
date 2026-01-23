# DECISIONS.md - Project Decision Log & Index

> Master index for Veliki Bukovec municipality website project.
> For detailed specifications, see domain-specific documents in `docs/` folder.
> Last updated: 2026-01-23

## Quick Links

| Document | Contents |
|----------|----------|
| [FEATURES.md](docs/FEATURES.md) | Product specification, site structure, admin features, search, newsletter |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Infrastructure, deployment, code organization, tech stack |
| [DATABASE.md](docs/DATABASE.md) | Schema (19 tables), API endpoints, response formats |
| [SECURITY.md](docs/SECURITY.md) | Authentication, VPS hardening, compliance, env variables |
| [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | Design tokens, components, animations, responsive behavior |
| [OPERATIONS.md](docs/OPERATIONS.md) | Testing, performance, monitoring, development process |
| [ROADMAP.md](ROADMAP.md) | 7-phase implementation plan |
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

### Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CMS | Custom (dropped WordPress) | Simpler UX for non-tech staff, single tech stack, lighter |
| Public Site | Next.js static export | Pre-rendered, cached at edge, minimal attack surface |
| Admin Panel | Next.js SSR on VPS | Server-side rendering for dynamic admin functionality |
| Database | PostgreSQL + pgvector | Robust, vector search for RAG chatbot |
| Hosting (Public) | Siteground + Cloudflare | Already paid, CDN handles 95%+ requests |
| Hosting (Admin) | Netcup VPS 1000 G12 | EU-based, good price/performance |
| LLM | Ollama Cloud (Llama 3.1 70B) | €20/mo flat rate, no GPU infrastructure needed |
| Embeddings | Local Ollama (nomic-embed-text) | Frequent calls, small model fits VPS RAM |
| Monorepo | Turborepo | Shared packages, optimized builds |

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
| AI Content | Human review required | Never auto-publish AI-generated |

### External Links (Not Built In-App)

| Service | External URL |
|---------|--------------|
| e-Savjetovanja | Link to official government portal |
| e-Nabava (Tenders) | Link to official government portal |
| MOBES | Link to MOBES system |
| Budget Visualization | Link to external budget site |

---

## Cost Structure

| Service | Monthly Cost |
|---------|--------------|
| Siteground | Already paid |
| Cloudflare (CDN, DNS, Analytics) | Free tier |
| Cloudflare R2 (backups) | ~€5-10 |
| Netcup VPS 1000 G12 | ~€8 |
| Ollama Cloud | €20 |
| **Total recurring** | **~€33-38/month** |

---

## Discussion Log

### Session 1 - 2026-01-23

#### Hosting Architecture
- **Discussed:** Siteground limitations for Next.js
- **Decided:** Keep Siteground, front with Cloudflare CDN
- **Why:** Cost-effective, 95%+ requests from edge

#### WordPress vs Custom CMS
- **Discussed:** WordPress complexity for non-tech staff
- **Decided:** Drop WordPress, build custom admin
- **Why:** 70 tables vs ~19 needed, complete UX control, single stack

#### VPS & AI Services
- **Decided:** Netcup VPS + Ollama Cloud
- **Why:** EU-based, predictable €20/mo for LLM, local embeddings

#### API Architecture
- **Initial plan:** Cloudflare Workers for API
- **Revised:** Direct API routes in admin app
- **Why:** Simpler architecture, all server logic in one place

### Session 2 - 2026-01-23

#### Authentication System
- **Decided:** Industry-standard auth with multiple methods
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

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  VISITORS (Public Internet)                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE (CDN + Security)                                    │
│  ├── DDoS Protection, WAF, SSL                                  │
│  ├── Caching (static assets, HTML pages)                        │
│  └── Analytics                                                  │
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

---

## Project Readiness Checklist

### Documentation Complete
- [x] Architecture documented
- [x] Database schema defined (19 tables)
- [x] API endpoints specified
- [x] Security requirements defined
- [x] Design system specified
- [x] Feature requirements complete
- [x] Development roadmap created
- [x] Definition of Done established

### Ready to Implement
- [x] Tech stack decided
- [x] Hosting providers selected
- [x] Budget confirmed (~€33-38/mo)
- [x] All feature questions resolved
- [x] External vs internal features clarified

### Before Development Starts
- [ ] VPS provisioned and hardened
- [ ] Domain DNS configured
- [ ] Cloudflare setup complete
- [ ] Database created
- [ ] CI/CD pipeline configured
- [ ] Development environment ready

---

## Document History

| Date | Changes |
|------|---------|
| 2026-01-23 | Initial decisions, architecture, feature specs |
| 2026-01-23 | Added authentication system, Definition of Done |
| 2026-01-23 | Split into domain-specific documents |
