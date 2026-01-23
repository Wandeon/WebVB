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

## Current Architecture

```
┌─────────────────────────────────────────────────┐
│                  CLOUDFLARE                      │
│  ┌─────────────┐       ┌─────────────────────┐  │
│  │   Workers   │       │        CDN          │  │
│  │   (APIs)    │       │   (Static site)     │  │
│  │   /api/*    │       │   /* → Siteground   │  │
│  └─────────────┘       └─────────────────────┘  │
└─────────────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
      ┌───────────────┐     ┌───────────────┐
      │     VPS       │     │  AI Services  │
      │  (WordPress   │     │  (OpenAI/     │
      │   Headless)   │     │   Anthropic)  │
      └───────────────┘     └───────────────┘
```

---

## Open Questions
- [ ] VPS budget and specs?
- [ ] Which AI provider for chatbot/content generation?
- [ ] Self-hosted AI or API-based?
- [ ] CI/CD pipeline setup (GitHub Actions → Siteground)
- [ ] WordPress rebuild trigger webhook

---

## Tech Stack (Tentative)
| Component | Technology | Status |
|-----------|------------|--------|
| Frontend | Next.js + React (static export) | Decided |
| Hosting (static) | Siteground + Cloudflare CDN | Decided |
| APIs | Cloudflare Workers | Decided |
| CMS | WordPress (headless) | From proposal |
| CMS Hosting | Small VPS | Decided |
| AI Services | TBD | Open |
| Email | @velikibukovec.hr | From proposal |

---

*Last updated: 2026-01-23*
