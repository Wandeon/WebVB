# OPERATIONS.md - DevOps & Processes

> Testing, performance, monitoring, and development processes.
> Last updated: 2026-01-23

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Performance](#performance)
3. [Monitoring & Logging](#monitoring--logging)
4. [SEO](#seo)
5. [Development Process](#development-process)
6. [Development Roadmap](#development-roadmap)

---

## Testing Strategy

### Test Pyramid

```
┌─────────────────────────────────────────────────────────────────┐
│  TEST PYRAMID                                                   │
├─────────────────────────────────────────────────────────────────┤
│  E2E Tests (Playwright)           - Critical flows only         │
│    • Login flow                   - ~5 tests                    │
│    • Create & publish post                                      │
│    • Upload document                                            │
│    • AI content generation                                      │
│                                                                 │
│  Integration Tests (Vitest)       - API endpoints               │
│    • Auth endpoints               - ~20 tests                   │
│    • CRUD operations                                            │
│    • Validation errors                                          │
│                                                                 │
│  Unit Tests (Vitest)              - Business logic              │
│    • Utility functions            - ~30 tests                   │
│    • Validation schemas                                         │
│    • Data transformations                                       │
└─────────────────────────────────────────────────────────────────┘

Coverage target: 60-70% (focus on critical paths, not vanity metrics)
```

### What to Test

| Category | What to Test | Tool |
|----------|--------------|------|
| API endpoints | All CRUD operations | Vitest |
| Validation | All Zod schemas | Vitest |
| Business logic | Complex transformations | Vitest |
| Critical flows | Login, publish, upload | Playwright |

### Test File Location

- Same directory as source: `post-editor.test.tsx`
- Or in `__tests__` folder for larger modules

---

## Performance

### Performance Budgets

| Metric | Target | Tool |
|--------|--------|------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.0s | Lighthouse |
| Initial JS Bundle | < 150KB | Bundlewatch |
| Lighthouse Score | > 90 | CI check |

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│  CLOUDFLARE                                                     │
│  • Static assets (JS, CSS, images): 1 year                      │
│  • HTML pages: Until purged on publish                          │
│  • API responses: No cache (dynamic)                            │
├─────────────────────────────────────────────────────────────────┤
│  BROWSER                                                        │
│  • Static assets: Immutable (hashed filenames)                  │
│  • HTML: No cache (always fresh from CF)                        │
├─────────────────────────────────────────────────────────────────┤
│  DATABASE                                                       │
│  • PostgreSQL query cache (built-in)                            │
│  • No Redis needed at this scale                                │
└─────────────────────────────────────────────────────────────────┘
```

### Image Optimization

```
Upload → Sharp processing on VPS:
  1. Convert to WebP
  2. Generate sizes: thumbnail (150px), medium (600px), large (1200px)
  3. Strip metadata
  4. Store all variants

Public site: Next.js <Image> component for automatic optimization
```

---

## Monitoring & Logging

### Monitoring Stack

| Service | Purpose | Cost |
|---------|---------|------|
| UptimeRobot | Uptime monitoring | Free |
| Sentry | Error tracking | Free (10k events/mo) |
| Cloudflare Analytics | Visitor stats | Free |

### Alerting

- **Downtime:** Email on site unavailable
- **Error spike:** Email on 5x normal error rate
- **Failed deploy:** Email immediately

### Logging

```
Application Logs:
  • Format: Structured JSON (pino)
  • Storage: VPS filesystem
  • Rotation: Daily, 14 files kept
  • Retention: 30 days

Audit Logs (in database):
  • All user actions
  • Retention: Forever (compliance)
```

### Application Logging

```typescript
// Use pino with rotation
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-roll',
    options: {
      file: '/var/log/velikibukovec/app',
      frequency: 'daily',
      maxFiles: 14,
      maxSize: '50m',
    }
  }
});

// Log levels
logger.error({ err }, 'Database connection failed');
logger.warn({ userId }, 'Rate limit approaching');
logger.info({ action: 'post_created' }, 'User created post');
// DEBUG only in development, never in prod
```

---

## SEO

### Implementation

- Meta title & description on all pages
- Open Graph tags (for Facebook/social sharing)
- JSON-LD structured data:
  - Organization (municipality info)
  - Article (for news posts)
  - Event (for events)
- Auto-generated `sitemap.xml`
- `robots.txt` allowing all
- Canonical URLs

---

## Development Process

### Git Workflow

```
main (production)
  └── feature/xyz (feature branches)
  └── fix/xyz (bug fixes)

• Feature branches merge to main via Pull Request
• All PRs require passing CI
• No complex GitFlow (overkill for this project)
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/description` | `feat/ai-content-generation` |
| Bug fix | `fix/description` | `fix/login-timeout` |
| Refactor | `refactor/description` | `refactor/auth-module` |
| Docs | `docs/description` | `docs/api-reference` |

### Commit Messages (Conventional Commits)

```
type(scope): description

feat(posts): add AI content generation
fix(auth): resolve session timeout issue
chore(deps): update dependencies
docs(api): add endpoint documentation
test(posts): add integration tests for CRUD
refactor(ui): simplify button variants
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `style`, `perf`

### Releases

- Semantic versioning: v1.0.0, v1.0.1, v1.1.0
- CHANGELOG.md maintained
- Git tags for each release
- Deploy main = deploy to production

### Dependency Updates

- GitHub Dependabot enabled
- Weekly review of updates
- Always run tests before merging updates
- Security updates: Immediate

### Database Migrations

- Prisma Migrate
- Auto-run on deploy
- Forward-only (no rollback migrations - too risky)
- Test migrations on local DB copy first

---

## Development Roadmap

### Phase Overview

| Phase | Focus | Deliverable |
|-------|-------|-------------|
| 0 | Foundation | Working apps with auth |
| 1 | Admin Core | Functional admin without AI |
| 2 | AI Integration | AI-powered post creation |
| 3 | Public Website | Complete public site |
| 4 | Deployment | Live, deployable system |
| 5 | Content Migration | All content migrated |
| 6 | Chatbot & Polish | Complete chatbot |
| 7 | Testing & Launch | LIVE WEBSITE |

### Phase Details

**Phase 0: Foundation**
- Project setup (Turborepo, configs, CI/CD)
- Database schema implementation (Prisma)
- Authentication system (NextAuth)
- Shared UI components (shadcn/ui setup)
- Design tokens & Tailwind config

**Phase 1: Admin Core**
- Admin layout (sidebar, header, responsive)
- Dashboard page (stats, recent activity)
- Posts CRUD (list, create, edit, delete)
- Rich text editor (TipTap) integration
- Image upload system
- Documents management
- Events calendar

**Phase 2: AI Integration**
- Ollama Cloud connection
- AI content generation pipeline
- Google Search integration for context
- Multi-step review flow
- Facebook preview & posting
- Image handling in AI flow

**Phase 3: Public Website**
- Homepage with all sections
- News listing & detail pages
- Documents section with categories
- Events calendar display
- Gallery with lightbox
- All static pages
- Contact page with forms
- Premium search experience
- Responsive design & animations
- SEO implementation

**Phase 4: Deployment & Build System**
- VPS setup (Netcup)
- PostgreSQL + Ollama installation
- Admin deployment to VPS
- Static site build pipeline
- Siteground deployment (SFTP)
- Cloudflare configuration
- Instant publish system with rollback
- Backup automation (R2)

**Phase 5: Content Migration**
- Export content from current WordPress
- Content mapping to new structure
- Automated migration scripts
- Image migration & optimization
- Content review & cleanup
- Redirect setup (old URLs → new)

**Phase 6: Chatbot & Polish**
- RAG system setup (pgvector)
- Document processing pipeline
- Chatbot UI widget
- Chatbot testing & training
- Newsletter system
- Performance optimization
- Accessibility audit (WCAG AA)
- Security audit (NIS2)
- Final animations & polish

**Phase 7: Testing & Launch**
- End-to-end testing
- User acceptance testing with client
- Staff training
- Documentation finalization
- DNS switch
- Launch!
- Post-launch monitoring
