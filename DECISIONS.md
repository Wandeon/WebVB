# WebVB Project - Decision Log

## Project Overview
**Client:** Općina Veliki Bukovec (Croatian municipality)
**Goal:** Digital transformation - modern website with AI features, headless CMS, email migration
**Contract Value:** €5,250 (incl. PDV)
**Deadline:** 60 days from contract signing
**Importance:** Showcase project - must be flawless

---

## Discussion Log

### Session 1 - 2026-01-23

#### Topic 1: Hosting Architecture

**Discussed:**
- Initial idea: Small VPS + Siteground for static site + Next.js/React
- Concern raised: Siteground is shared hosting, not optimal for Next.js
- Alternatives suggested: Vercel, Cloudflare Pages, Netlify

**Decided:**
- Keep Siteground (already paid for)
- Front with Cloudflare CDN for caching and performance
- Static export from Next.js

**Why:**
- Cost-effective (no additional hosting costs)
- Cloudflare caching means origin (Siteground) rarely hit
- For a mostly-static municipal site, this is sufficient
- 95%+ requests served from Cloudflare edge

---

#### Topic 2: API Routes Limitation

**Discussed:**
- Static Next.js export loses API routes capability
- User concerned about not having APIs on the site

**Decided:**
- Use Cloudflare Workers for API routes instead of Next.js API routes

**Why:**
- Already using Cloudflare (no extra vendor)
- APIs run at the edge (faster than origin-based APIs)
- Serverless - no server management overhead
- Protects sensitive API keys (AI services)
- Free tier: 100k requests/day
- Same domain routing, no CORS issues
- Cleaner separation of concerns

**API responsibilities (Cloudflare Workers):**
- Contact form submissions
- Chatbot proxy (hides OpenAI/Anthropic keys)
- WordPress content fetching (with caching)
- Facebook posting triggers

---

#### Topic 3: VPS Provider & AI Services

**Discussed:**
- VPS provider selection
- AI service for chatbot and content generation

**Decided:**
- VPS: Netcup (German provider)
- AI: Ollama Cloud at €20/month

**Why:**
- Netcup: Good price/performance ratio, EU-based (GDPR friendly for Croatian municipality), reliable
- Ollama Cloud:
  - Predictable monthly cost (€20 flat)
  - No need to self-host GPU infrastructure
  - Access to open-source models (Llama, Mistral, etc.)
  - API-based = simpler integration via Cloudflare Workers
  - Can switch models without infrastructure changes

**Cost structure so far:**
| Service | Monthly Cost |
|---------|--------------|
| Siteground | Already paid |
| Cloudflare | Free tier |
| Netcup VPS | TBD (depends on tier) |
| Ollama Cloud | €20 |
| **Total recurring** | ~€20 + VPS |

---

## Current Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLOUDFLARE                      │
│  ┌─────────────┐       ┌─────────────────────┐  │
│  │   Workers   │       │        CDN          │  │
│  │   (APIs)    │       │   (Static site)     │  │
│  │   /api/*    │       │   /* → Siteground   │  │
│  └──────┬──────┘       └─────────────────────┘  │
└─────────│───────────────────────────────────────┘
          │
          ├──────────────────┬────────────────────┐
          ▼                  ▼                    ▼
  ┌───────────────┐  ┌───────────────┐   ┌──────────────┐
  │  Netcup VPS   │  │ Ollama Cloud  │   │  Siteground  │
  │  (WordPress   │  │   (€20/mo)    │   │   (Origin)   │
  │   Headless)   │  │  LLM APIs     │   │ Static files │
  └───────────────┘  └───────────────┘   └──────────────┘
```

---

## Open Questions
- [x] VPS budget and specs? → Netcup VPS
- [x] Which AI provider for chatbot/content generation? → Ollama Cloud
- [x] Self-hosted AI or API-based? → API-based (Ollama Cloud)
- [ ] CI/CD pipeline setup (GitHub Actions → Siteground)
- [ ] WordPress rebuild trigger webhook
- [ ] Which Netcup VPS tier for WordPress?
- [ ] Ollama Cloud model selection (Llama 3, Mistral, etc.)?

---

## Tech Stack (Tentative)
| Component | Technology | Status |
|-----------|------------|--------|
| Frontend | Next.js + React (static export) | Decided |
| Hosting (static) | Siteground + Cloudflare CDN | Decided |
| APIs | Cloudflare Workers | Decided |
| CMS | WordPress (headless) | From proposal |
| CMS Hosting | Netcup VPS | Decided |
| AI Services | Ollama Cloud (€20/month) | Decided |
| Email | @velikibukovec.hr | From proposal |

---

*Last updated: 2026-01-23*
