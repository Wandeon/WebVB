# Veliki Bukovec Municipality Website

Modern website with AI features for Općina Veliki Bukovec, a Croatian municipality.

## Project Status

**Phase:** 4-8 remaining (Phases 0-3 complete)
**Progress:** 39/71 sprints (55%)
**Status:** Core development complete, staging deployed

### Completed Phases
- ✅ **Phase 0:** Foundation (6/6 sprints)
- ✅ **Phase 1:** Admin Core (12/12 sprints)
- ✅ **Phase 2:** Public Website (12/12 sprints)
- ✅ **Phase 3:** Infrastructure (9/9 sprints)

### Staging Environment
- **Frontend:** http://100.120.125.83/ (via Tailscale)
- **Admin:** http://100.120.125.83:3001/ (via Tailscale)
- **Auto-deploy:** Push to main triggers GitHub Actions → VPS

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (LTS) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL + pgvector |
| Auth | Better Auth |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Editor | TipTap |
| AI | Ollama Cloud (Llama 3.1 70B) |
| Hosting (Public) | Cloudflare Pages |
| Hosting (Admin) | Netcup VPS |
| Storage | Cloudflare R2 |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE                              │
│  ┌─────────────────────┐         ┌─────────────────────────┐   │
│  │  Cloudflare Pages   │         │    Cloudflare R2        │   │
│  │  (Public Site)      │         │    (Images, Backups)    │   │
│  │  Static HTML/CSS/JS │         │                         │   │
│  └─────────────────────┘         └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                │                              │
                │         ┌────────────────────┘
                │         │
┌───────────────▼─────────▼───────────────────────────────────────┐
│                      NETCUP VPS                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Admin App (Next.js)                                     │   │
│  │  PostgreSQL + pgvector                                   │   │
│  │  Ollama (embeddings)                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Documentation

| Document | Description |
|----------|-------------|
| [DECISIONS.md](DECISIONS.md) | Master index, key architectural decisions |
| [ROADMAP.md](ROADMAP.md) | Sprint-ready development roadmap (71 sprints) |
| [PROJECT-GOVERNANCE.md](PROJECT-GOVERNANCE.md) | Communication, approvals, payments |
| [HUMAN-TODO.md](HUMAN-TODO.md) | Manual tasks requiring human action |
| [CLAUDE.md](CLAUDE.md) | AI coding assistant instructions |
| [AGENTS.md](AGENTS.md) | Agent definitions and workflows |

### Technical Docs (`/docs`)

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, deployment, code organization |
| [DATABASE.md](docs/DATABASE.md) | Schema, API endpoints |
| [FEATURES.md](docs/FEATURES.md) | Product specification |
| [SECURITY.md](docs/SECURITY.md) | Auth, hardening, compliance |
| [DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) | UI/UX, components, animations |
| [OPERATIONS.md](docs/OPERATIONS.md) | Testing, performance, monitoring |
| [MIGRATION.md](docs/MIGRATION.md) | WordPress migration guide |

### Audits (`/docs/audits`)

| Audit | Focus |
|-------|-------|
| [PREMORTEM-AUDIT.md](docs/audits/PREMORTEM-AUDIT.md) | Failure scenario analysis |
| [DEPENDENCY-AUDIT.md](docs/audits/DEPENDENCY-AUDIT.md) | External service risks |
| [INTEGRATION-AUDIT.md](docs/audits/INTEGRATION-AUDIT.md) | System boundary analysis |
| [ASSUMPTION-AUDIT.md](docs/audits/ASSUMPTION-AUDIT.md) | Assumption validation |

## Development Phases

| Phase | Focus | Sprints | Status |
|-------|-------|---------|--------|
| 0 | Foundation | 6/6 | ✅ Complete |
| 1 | Admin Core | 12/12 | ✅ Complete |
| 2 | Public Website | 12/12 | ✅ Complete |
| 3 | Infrastructure | 9/9 | ✅ Complete |
| 4 | Content Migration | 0/7 | ⬜ Pending |
| 5 | Communication | 0/6 | ⬜ Pending |
| 6 | AI Integration | 0/7 | ⬜ Pending |
| 7 | Chatbot & Polish | 0/8 | ⬜ Pending |
| 8 | Testing & Launch | 0/8 | ⬜ Pending |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+ with pgvector
- Cloudflare account (R2, Pages)
- Google Cloud account (OAuth, Search API)

### Setup

```bash
# Clone repository
git clone https://github.com/Wandeon/WebVB.git
cd WebVB

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
pnpm db:push
pnpm db:seed

# Start development
pnpm dev
```

## Project Structure

```
.
├── apps/
│   ├── web/          # Public website (static export)
│   └── admin/        # Admin panel (server-side)
├── packages/
│   ├── ui/           # Shared UI components
│   ├── database/     # Prisma schema & repositories
│   └── shared/       # Types, schemas, utilities
└── docs/             # Documentation
```

## License

Private project for Općina Veliki Bukovec.

---

Built with AI assistance by [Your Name]
