# Veliki Bukovec Municipality Website

Modern website with AI features for Općina Veliki Bukovec, a Croatian municipality.

## Project Status

**Phase:** 0 - Foundation
**Progress:** 0/71 sprints
**Status:** Pre-development (documentation complete)

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

| Phase | Focus | Sprints |
|-------|-------|---------|
| **0** | **Foundation** | 6 |
| 1 | Admin Core | 12 |
| 2 | Public Website | 12 |
| 3 | Infrastructure | 9 |
| 4 | Content Migration | 7 |
| 5 | Communication | 6 |
| 6 | AI Integration | 7 |
| 7 | Chatbot & Polish | 8 |
| 8 | Testing & Launch | 8 |

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
