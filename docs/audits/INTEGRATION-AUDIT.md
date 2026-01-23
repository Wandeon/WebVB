# INTEGRATION-AUDIT.md - Integration Point Analysis

> Comprehensive audit of all integration points in the Veliki Bukovec municipality website.
> Integration boundaries are where failures happen most often.
> Last updated: 2026-01-23

## Table of Contents

1. [Integration Map](#integration-map)
2. [Integration Points Inventory](#integration-points-inventory)
3. [Detailed Integration Analysis](#detailed-integration-analysis)
4. [Critical Paths](#critical-paths)
5. [Recommendations](#recommendations)

---

## Integration Map

```
                                    EXTERNAL SERVICES
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                                                                         │
    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
    │  │ Ollama Cloud │  │ Google Search│  │ Facebook API │  │ SMTP Server │ │
    │  │ (Llama 3.1)  │  │     API      │  │  (Page Post) │  │ (Siteground)│ │
    │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
    │         │                 │                 │                 │        │
    └─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
              │                 │                 │                 │
              │    ┌────────────┴─────────────────┴─────────────────┘
              │    │
              ▼    ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                         NETCUP VPS 1000 G12                             │
    │  ┌────────────────────────────────────────────────────────────────────┐ │
    │  │                    ADMIN APP (Next.js 16 SSR)                      │ │
    │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │ │
    │  │  │ Better Auth  │  │  API Routes  │  │     AI Queue Worker      │  │ │
    │  │  │  (Sessions)  │  │   (REST)     │  │  (Content Generation)    │  │ │
    │  │  └──────────────┘  └──────────────┘  └──────────────────────────┘  │ │
    │  └─────────┬────────────────┬─────────────────────┬───────────────────┘ │
    │            │                │                     │                     │
    │            ▼                ▼                     ▼                     │
    │  ┌──────────────────────────────────────────────────────────────────┐   │
    │  │                    PostgreSQL + pgvector                         │   │
    │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
    │  │  │ Content  │  │  Auth    │  │  Search  │  │   Embeddings     │  │   │
    │  │  │  Tables  │  │  Tables  │  │  Index   │  │   (RAG/Chat)     │  │   │
    │  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘  │   │
    │  └──────────────────────────────────────────────────────────────────┘   │
    │            │                                                            │
    │            │         ┌──────────────────────────────────────────────┐   │
    │            │         │           Local Ollama (Embeddings)          │   │
    │            │         │              nomic-embed-text                │   │
    │            └─────────┤           127.0.0.1:11434                    │   │
    │                      └──────────────────────────────────────────────┘   │
    └──────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ R2 API
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           CLOUDFLARE                                    │
    │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────┐  │
    │  │   Cloudflare R2  │  │  Cloudflare Pages│  │   CDN / WAF / DNS     │  │
    │  │  (Images/Backup) │  │   (Public Site)  │  │   (Analytics)         │  │
    │  └────────┬─────────┘  └────────┬─────────┘  └───────────────────────┘  │
    └───────────┼─────────────────────┼───────────────────────────────────────┘
                │                     │
                │                     │ Build-time fetch
                │                     ▼
    ┌───────────┼─────────────────────────────────────────────────────────────┐
    │           │            PUBLIC SITE (Static HTML)                        │
    │           │     ┌───────────────────────────────────────────────────┐   │
    │           │     │  - Pre-rendered pages (news, docs, events)        │   │
    │           │     │  - Search UI (client-side hybrid search)          │   │
    │           │     │  - Chatbot widget (connects to Admin API)         │   │
    │           └────►│  - Images served from R2 via CDN                  │   │
    │                 └───────────────────────────────────────────────────┘   │
    └─────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           VISITORS                                      │
    └─────────────────────────────────────────────────────────────────────────┘


    CI/CD FLOW (GitHub Actions)
    ┌─────────────────────────────────────────────────────────────────────────┐
    │  GitHub                                                                 │
    │  ┌─────────┐    ┌─────────────────┐    ┌─────────────────────────────┐  │
    │  │  Push   │───►│  GitHub Actions │───►│  Deploy Admin (SSH/Tailscale)│ │
    │  │ to main │    │  (CI Pipeline)  │    │  Trigger Pages Build (API)  │  │
    │  └─────────┘    └─────────────────┘    └─────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────────────┘
```

---

## Integration Points Inventory

| # | Integration | Direction | Protocol | Auth Method | Critical? |
|---|-------------|-----------|----------|-------------|-----------|
| 1 | Admin App <-> PostgreSQL | Bidirectional | TCP (Prisma) | Connection string | YES |
| 2 | Admin App <-> Cloudflare R2 | Outbound | HTTPS (S3 API) | API Key + Secret | YES |
| 3 | Admin App <-> Ollama Cloud | Outbound | HTTPS | API Key | NO |
| 4 | Admin App <-> Local Ollama | Outbound | HTTP | None (localhost) | NO |
| 5 | Admin App <-> Google Search API | Outbound | HTTPS | API Key | NO |
| 6 | Admin App <-> Facebook API | Outbound | HTTPS | Page Access Token | NO |
| 7 | Admin App <-> SMTP Server | Outbound | SMTP/TLS | Username/Password | PARTIAL |
| 8 | Public Site <-> Database | Build-time | TCP (Prisma) | Connection string | YES |
| 9 | Public Site <-> R2 | Runtime (CDN) | HTTPS | None (public bucket) | YES |
| 10 | Chatbot <-> pgvector | Runtime | TCP | Via Admin API | NO |
| 11 | Chatbot <-> Ollama Cloud | Runtime | HTTPS | API Key | NO |
| 12 | Search <-> PostgreSQL FTS | Runtime | TCP | Via Admin API | NO |
| 13 | Search <-> pgvector | Runtime | TCP | Via Admin API | NO |
| 14 | CI/CD <-> Cloudflare Pages | Outbound | HTTPS | API Token | YES |
| 15 | CI/CD <-> VPS (SSH) | Outbound | SSH | Tailscale + SSH Key | YES |
| 16 | Backup <-> R2 | Outbound | HTTPS (S3 API) | API Key + Secret | PARTIAL |
| 17 | Admin <-> Cloudflare Analytics | Inbound | HTTPS | API Token | NO |

---

## Detailed Integration Analysis

### 1. Admin App <-> PostgreSQL

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin App <-> PostgreSQL                          │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Bidirectional                                       │
│  Protocol: TCP via Prisma ORM                                   │
│  Port: 5432 (localhost only)                                    │
│  Authentication: DATABASE_URL connection string                 │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Connection refused (DB down)                                 │
│  • Authentication error (wrong credentials)                     │
│  • Connection timeout (slow startup, high load)                 │
│  • Pool exhaustion (too many concurrent connections)            │
│  • Migration mismatch (schema drift)                            │
│  • Disk full (no writes possible)                               │
│  • OOM kill (PostgreSQL killed by OS)                           │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Prisma handles connection pooling automatically              │
│  • Wrap all queries in try/catch                                │
│  • Return meaningful error codes (DB_CONNECTION_ERROR)          │
│  • Log errors with context (query type, user ID if available)   │
│  • Health check endpoint: GET /api/health (checks DB)           │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES                                               │
│  • Prisma has built-in connection retry                         │
│  • Add app-level retry for transient failures (max 3 attempts)  │
│  • Exponential backoff: 100ms, 500ms, 2000ms                    │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • Database is local, circuit breaker adds complexity           │
│  • If DB is down, nothing works anyway                          │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Health check endpoint for UptimeRobot                        │
│  • Sentry for error tracking                                    │
│  • Log connection errors with severity: ERROR                   │
│  • Alert: Any DB connection failure                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Admin App <-> Cloudflare R2

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin App <-> Cloudflare R2                       │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Outbound (uploads, deletes)                         │
│  Protocol: HTTPS (S3-compatible API)                            │
│  Endpoint: <account-id>.r2.cloudflarestorage.com                │
│  Authentication: R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY        │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Authentication error (invalid/expired keys)                  │
│  • Network timeout (large file uploads)                         │
│  • Rate limiting (unlikely at our scale)                        │
│  • Invalid bucket name or permissions                           │
│  • File too large (R2 limit: 5GB per object)                    │
│  • Cloudflare outage (rare, but possible)                       │
│  • CORS issues (if direct browser upload attempted)             │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Validate file size/type BEFORE processing                    │
│  • Process images on VPS (Sharp) before upload                  │
│  • Return user-friendly error: "Upload failed, try again"       │
│  • Store upload state in DB (pending/complete/failed)           │
│  • Cleanup: Delete orphaned local files after upload            │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES                                               │
│  • Retry on network errors (max 3 attempts)                     │
│  • Exponential backoff: 1s, 3s, 10s                             │
│  • Do NOT retry on auth errors (fail fast)                      │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • R2 is highly reliable                                        │
│  • Individual upload failures don't warrant circuit breaker     │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Log all upload operations (success/failure)                  │
│  • Track upload latency (P95 should be < 10s for images)        │
│  • Alert: 5+ consecutive upload failures                        │
│  • Sentry capture for all R2 errors                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Admin App <-> Ollama Cloud

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin App <-> Ollama Cloud (LLM)                  │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Outbound (prompts -> completions)                   │
│  Protocol: HTTPS                                                │
│  Endpoint: https://api.ollama.ai                                │
│  Authentication: OLLAMA_CLOUD_API_KEY                           │
│  Model: Llama 3.1 70B                                           │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Rate limiting (Pro plan has hourly/weekly limits)            │
│  • Request timeout (LLM generation can be slow)                 │
│  • Authentication error (invalid/expired API key)               │
│  • Model unavailable (maintenance, capacity issues)             │
│  • Malformed response (API version changes)                     │
│  • Context length exceeded                                      │
│  • Service degradation (slow but not down)                      │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • ALL requests go through ai_queue table                       │
│  • Queue Status: pending -> processing -> completed/failed      │
│  • User sees: "Generating..." with progress indicator           │
│  • On failure: "Generation failed. Try again?"                  │
│  • Never auto-publish AI content                                │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES (Queue-based)                                 │
│  • Store in ai_queue with max_attempts = 3                      │
│  • Retry on: rate limit (429), timeout, 5xx errors              │
│  • Backoff: 30s, 60s, 120s (rate limit aware)                   │
│  • Do NOT retry on: auth error (401), bad request (400)         │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: YES (Recommended)                             │
│  • Open circuit after 5 consecutive failures in 5 minutes       │
│  • Half-open: Try one request after 2 minutes                   │
│  • Show users: "AI temporarily unavailable"                     │
│  • Continue accepting queue items (will process when restored)  │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Track queue depth (alert if > 10 pending for > 10 min)       │
│  • Track success/failure rate                                   │
│  • Track latency per request                                    │
│  • Alert: Circuit breaker opens                                 │
│  • Alert: Queue depth > 20                                      │
│  • Daily summary: AI usage stats, cost estimate                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Admin App <-> Local Ollama (Embeddings)

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin App <-> Local Ollama (Embeddings)           │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Outbound (text -> embeddings)                       │
│  Protocol: HTTP (localhost)                                     │
│  Endpoint: http://127.0.0.1:11434                               │
│  Authentication: None (localhost only)                          │
│  Model: nomic-embed-text (768 dimensions)                       │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Ollama service not running                                   │
│  • Model not loaded (first request cold start)                  │
│  • OOM (model doesn't fit in RAM)                               │
│  • VPS under heavy load (slow response)                         │
│  • Disk full (can't load model)                                 │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Embeddings are generated in background jobs                  │
│  • If embedding fails, content is still saved (search degraded) │
│  • Queue failed embeddings for retry                            │
│  • Log clearly: "Embedding generation failed for [source_id]"   │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES                                               │
│  • Retry on connection refused (service might be restarting)    │
│  • Max 3 attempts with 5s, 15s, 60s backoff                     │
│  • After max attempts, mark as "embedding_failed" in DB         │
│  • Background job to retry failed embeddings hourly             │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • Local service, failures should be rare                       │
│  • If consistently failing, systemd should restart it           │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Health check includes Ollama connectivity                    │
│  • Alert: Ollama unreachable for > 5 minutes                    │
│  • Track: embedding_failed count (should be 0 normally)         │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Admin App <-> Google Search API

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin App <-> Google Search API                   │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Outbound (query -> search results)                  │
│  Protocol: HTTPS                                                │
│  Endpoint: customsearch.googleapis.com                          │
│  Authentication: GOOGLE_SEARCH_API_KEY + Custom Search Engine   │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Daily quota exceeded (100 free queries/day)                  │
│  • Rate limiting (10 queries/second)                            │
│  • Invalid API key                                              │
│  • Invalid Search Engine ID (cx parameter)                      │
│  • Network timeout                                              │
│  • No results found (not an error, but affects AI)              │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Used ONLY for AI content research (optional enhancement)     │
│  • If search fails, AI still generates (without context)        │
│  • Log: "Search context unavailable, proceeding without"        │
│  • User never sees search-related errors                        │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: MINIMAL                                           │
│  • Single retry on network timeout                              │
│  • No retry on quota/auth errors                                │
│  • Fail fast - search is enhancement, not critical              │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • Fails gracefully (AI works without it)                       │
│  • Low volume (few AI generations per day)                      │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Track daily usage vs quota                                   │
│  • Alert: Quota > 80% (approaching limit)                       │
│  • Alert: Auth errors (immediate attention needed)              │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Admin App <-> Facebook API

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin App <-> Facebook Graph API                  │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Outbound (post content -> Facebook page)            │
│  Protocol: HTTPS                                                │
│  Endpoint: graph.facebook.com                                   │
│  Authentication: FACEBOOK_ACCESS_TOKEN (long-lived page token)  │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Token expired (even long-lived tokens expire)                │
│  • Insufficient permissions (page permissions changed)          │
│  • Rate limiting (unlikely for our volume)                      │
│  • Content rejected (spam detection, policy violation)          │
│  • API version deprecated                                       │
│  • Network timeout                                              │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Facebook posting is OPTIONAL (checkbox in publish)           │
│  • Post is published to website regardless of FB success        │
│  • On FB failure: "Post published. Facebook sharing failed."    │
│  • Store FB post ID in DB for tracking                          │
│  • Admin can retry FB post separately                           │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: LIMITED                                           │
│  • Single retry on network timeout                              │
│  • No retry on auth/permission errors (needs manual fix)        │
│  • No retry on content rejection                                │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • Low volume, optional feature                                 │
│  • Each failure is independent                                  │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Track success/failure rate                                   │
│  • Alert: Token expiry approaching (if detectable)              │
│  • Alert: 3 consecutive failures (likely token issue)           │
│  • Document: Token refresh procedure                            │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Admin App <-> SMTP Server

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin App <-> SMTP Server (Siteground)            │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Outbound (emails)                                   │
│  Protocol: SMTP over TLS (port 587)                             │
│  Endpoint: SMTP_HOST (mail.velikibukovec.hr)                    │
│  Authentication: SMTP_USER + SMTP_PASSWORD                      │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Connection refused (SMTP server down)                        │
│  • Authentication failure (wrong credentials)                   │
│  • TLS handshake failure                                        │
│  • Rate limiting (Siteground limits: ~500/hour)                 │
│  • Recipient rejection (invalid email)                          │
│  • Email marked as spam (reputation issues)                     │
│  • Network timeout                                              │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Queue emails in DB for sending                               │
│  • Track status: pending, sent, failed                          │
│  • On failure: Log and retry later                              │
│  • Critical emails (password reset): Show fallback option       │
│  • Newsletter: Continue with other recipients on single failure │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES                                               │
│  • Retry on: connection timeout, temporary SMTP errors (4xx)    │
│  • Max 5 attempts over 24 hours                                 │
│  • Backoff: 5min, 30min, 2hr, 6hr, 12hr                         │
│  • Do NOT retry: permanent failures (5xx), invalid recipient    │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: YES (Recommended for newsletter)              │
│  • Open after 10 failures in 1 minute                           │
│  • Prevents burning through rate limit during outage            │
│  • Half-open: Try after 10 minutes                              │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Track delivery rate (should be > 95%)                        │
│  • Track bounce rate (should be < 2%)                           │
│  • Alert: Delivery rate drops below 90%                         │
│  • Alert: Auth failure (immediate)                              │
│  • Weekly report: Email stats                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 8. Public Site <-> Database (Build Time)

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Public Site <-> Database (Build Time Only)        │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Read-only (during static generation)                │
│  Protocol: TCP via Prisma                                       │
│  When: Cloudflare Pages build process                           │
│  Authentication: DATABASE_URL (via CI environment)              │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Database unreachable from Cloudflare build environment       │
│  • Connection timeout (VPS firewall blocking)                   │
│  • Credentials incorrect in CI environment                      │
│  • Build timeout (too much content to generate)                 │
│  • Memory limit exceeded during build                           │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • VPS must allow connections from Cloudflare IPs during build  │
│  • Alternative: Build on VPS, push artifacts to Pages           │
│  • Build failures = Cloudflare keeps previous deployment        │
│  • Notify admin on build failure                                │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES (Cloudflare handles)                          │
│  • Cloudflare Pages has built-in build retry                    │
│  • Admin can manually trigger rebuild                           │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: N/A                                           │
│  • Build is atomic - succeeds or fails completely               │
│  • Previous deployment remains if build fails                   │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Webhook notification on build success/failure                │
│  • Admin dashboard shows build status                           │
│  • Alert: Build failure (immediate email)                       │
└─────────────────────────────────────────────────────────────────┘
```

### 9. Public Site <-> R2 (Images)

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Public Site <-> Cloudflare R2 (Runtime)           │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Read-only (image requests)                          │
│  Protocol: HTTPS (via Cloudflare CDN)                           │
│  Endpoint: images.velikibukovec.hr or <bucket>.r2.dev           │
│  Authentication: None (public bucket, CDN caching)              │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Image not found (deleted or never uploaded)                  │
│  • R2 outage (extremely rare)                                   │
│  • CORS issues (misconfigured bucket)                           │
│  • CDN cache issues (stale or missing)                          │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Use placeholder image for 404s                               │
│  • next/image handles loading states                            │
│  • Alt text always present for accessibility                    │
│  • Images are non-blocking (page loads without them)            │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: Browser handles                                   │
│  • Browser retry on network failure                             │
│  • CDN handles origin retries                                   │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: N/A                                           │
│  • CDN serves from cache even if origin is down                 │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Cloudflare Analytics shows error rates                       │
│  • Alert: 4xx rate > 5% (broken image links)                    │
│  • Alert: 5xx rate > 1% (R2 issues)                             │
└─────────────────────────────────────────────────────────────────┘
```

### 10. Chatbot <-> pgvector

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Chatbot <-> pgvector (Semantic Search)            │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Query (vector similarity search)                    │
│  Protocol: TCP (via Prisma, pgvector extension)                 │
│  When: User asks chatbot a question                             │
│  Authentication: Via Admin API (session or public endpoint)     │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • No embeddings in database (empty knowledge base)             │
│  • Query embedding generation failed (Ollama down)              │
│  • Vector search timeout (index not optimized)                  │
│  • Low similarity scores (question out of scope)                │
│  • pgvector extension not installed                             │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • If vector search fails, fall back to keyword search          │
│  • If no relevant results, respond: "I don't have info on that" │
│  • Always cite sources when answering                           │
│  • Log questions with low/no results for content gap analysis   │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: LIMITED                                           │
│  • Single retry if embedding generation failed                  │
│  • No retry on empty results (not an error)                     │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • Shared with general DB circuit (if implemented)              │
│  • Graceful degradation to keyword search                       │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Track: Avg similarity score                                  │
│  • Track: Questions with no results                             │
│  • Weekly report: Top unanswered questions                      │
└─────────────────────────────────────────────────────────────────┘
```

### 11. Chatbot <-> Ollama Cloud

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Chatbot <-> Ollama Cloud (Response Generation)    │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: (question + context) -> answer                      │
│  Protocol: HTTPS                                                │
│  Authentication: OLLAMA_CLOUD_API_KEY                           │
│  Model: Llama 3.1 70B                                           │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Same as Integration #3 (Admin App <-> Ollama Cloud)          │
│  • Additional: Response latency affects UX (user waiting)       │
│  • Context window exceeded (too many retrieved chunks)          │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Show typing indicator while waiting                          │
│  • Set reasonable timeout (30s max)                             │
│  • On failure: "Unable to answer right now. Try again later."   │
│  • Provide fallback: "Contact us at..." with link               │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: LIMITED                                           │
│  • Single automatic retry on timeout                            │
│  • User can manually retry (button in UI)                       │
│  • Don't queue chatbot requests (real-time expectation)         │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: SHARE with Integration #3                     │
│  • Use same circuit breaker as content generation               │
│  • When open: "Chatbot temporarily unavailable"                 │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Track: Response latency (P50, P95, P99)                      │
│  • Track: Success rate                                          │
│  • Alert: P95 latency > 15 seconds                              │
└─────────────────────────────────────────────────────────────────┘
```

### 12 & 13. Search <-> PostgreSQL FTS & pgvector

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Hybrid Search                                     │
│  PostgreSQL Full-Text Search + pgvector Semantic Search         │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Query -> combined results                           │
│  Protocol: TCP (via Prisma)                                     │
│  Indexes: GIN (tsvector) + HNSW (vector)                        │
│  Authentication: Via Admin API                                  │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Query timeout (unoptimized query/index)                      │
│  • Index not built (new content not indexed)                    │
│  • Croatian stemming issues (language-specific)                 │
│  • Embedding generation failed for query                        │
│  • Memory pressure (HNSW index in memory)                       │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • FTS is primary, semantic is enhancement                      │
│  • If semantic fails, return FTS results only                   │
│  • If FTS fails, return empty with error message                │
│  • Always show search latency to user (< 200ms target)          │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: NO                                                │
│  • Search should be fast - retry adds latency                   │
│  • User can refine and search again                             │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • Core database functionality                                  │
│  • Graceful degradation (FTS-only mode)                         │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Track: Search latency (P50, P95)                             │
│  • Track: Zero-result rate                                      │
│  • Alert: P95 > 500ms                                           │
│  • Weekly: Popular search terms, failed searches                │
└─────────────────────────────────────────────────────────────────┘
```

### 14 & 15. CI/CD Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: CI/CD <-> Cloudflare Pages + VPS                  │
├─────────────────────────────────────────────────────────────────┤
│  14. GitHub Actions -> Cloudflare Pages                         │
│      Protocol: HTTPS (Cloudflare API)                           │
│      Auth: CLOUDFLARE_API_TOKEN                                 │
│      Trigger: Push to main, or manual API call                  │
│                                                                 │
│  15. GitHub Actions -> VPS (Admin deploy)                       │
│      Protocol: SSH over Tailscale                               │
│      Auth: SSH key (GitHub secret)                              │
│      Trigger: Push to main                                      │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • Cloudflare API: Auth error, rate limit, timeout              │
│  • SSH: Key invalid, Tailscale disconnected, VPS unreachable    │
│  • Build: Test failure, lint error, type error                  │
│  • Deploy: Migration failed, PM2 restart failed                 │
│  • Health check: New version is broken                          │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Build failure = deployment cancelled                         │
│  • VPS deploy has rollback step (git revert if health fails)    │
│  • Cloudflare Pages: Previous deployment remains live           │
│  • Notify team on any CI/CD failure                             │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES (GitHub Actions built-in)                     │
│  • Workflow can be re-run manually                              │
│  • Auto-retry on flaky network issues (1 retry)                 │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • GitHub: Email on workflow failure                            │
│  • Slack/Discord webhook for deploy notifications               │
│  • Post-deploy health check (automated)                         │
└─────────────────────────────────────────────────────────────────┘
```

### 16. Backup <-> R2

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Daily Backup -> Cloudflare R2                     │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Outbound (database dump + documents)                │
│  Protocol: HTTPS (S3 API)                                       │
│  Frequency: Daily cron (4:00 AM)                                │
│  Retention: 90 days                                             │
│  Authentication: R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY        │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • pg_dump failure (database locked, disk full)                 │
│  • Encryption failure (key issues)                              │
│  • R2 upload failure (auth, network, quota)                     │
│  • Cron not running (systemd issue)                             │
│  • Backup too large (upload timeout)                            │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Script exits with error code on any failure                  │
│  • Email notification on backup failure                         │
│  • Log backup size and duration                                 │
│  • Separate backups for DB and documents                        │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: YES                                               │
│  • Retry upload 3 times with 1-minute backoff                   │
│  • If all retries fail, alert and keep local backup             │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Alert: Backup failed (immediate)                             │
│  • Alert: No backup in 36 hours                                 │
│  • Weekly: Backup size trend                                    │
│  • Monthly: Test restore procedure                              │
└─────────────────────────────────────────────────────────────────┘
```

### 17. Admin <-> Cloudflare Analytics

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION: Admin Dashboard <-> Cloudflare Analytics          │
├─────────────────────────────────────────────────────────────────┤
│  Data Flow: Inbound (fetch analytics data)                      │
│  Protocol: HTTPS (Cloudflare GraphQL API)                       │
│  Endpoint: api.cloudflare.com/client/v4/graphql                 │
│  Authentication: CLOUDFLARE_ANALYTICS_TOKEN                     │
├─────────────────────────────────────────────────────────────────┤
│  WHAT CAN FAIL                                                  │
│  ─────────────────                                              │
│  • API rate limiting                                            │
│  • Token expired or insufficient permissions                    │
│  • Query timeout (large date ranges)                            │
│  • API response format changes                                  │
├─────────────────────────────────────────────────────────────────┤
│  ERROR HANDLING STRATEGY                                        │
│  ─────────────────────────                                      │
│  • Analytics is non-critical - show "unavailable" on failure    │
│  • Cache results for 5 minutes (reduce API calls)               │
│  • Show cached data with "Updated X minutes ago"                │
│  • Graceful degradation: Dashboard works without analytics      │
├─────────────────────────────────────────────────────────────────┤
│  RETRY LOGIC: MINIMAL                                           │
│  • Single retry on timeout                                      │
│  • No retry on auth errors                                      │
├─────────────────────────────────────────────────────────────────┤
│  CIRCUIT BREAKER: NO                                            │
│  • Non-critical feature                                         │
│  • Just show "Analytics unavailable" message                    │
├─────────────────────────────────────────────────────────────────┤
│  MONITORING/ALERTING                                            │
│  ─────────────────────                                          │
│  • Log API errors                                               │
│  • Alert: Auth failure (token needs refresh)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Critical Paths

### Tier 1: System-Breaking (No Graceful Degradation)

These integrations, if broken, stop the entire system:

| Integration | Impact | Mitigation |
|-------------|--------|------------|
| **Admin App <-> PostgreSQL** | All admin functions fail, no content management | Health monitoring, immediate alerts, regular backups |
| **Public Site <-> Database (build)** | Cannot deploy new content | Keep previous deployment, build locally if needed |
| **CI/CD <-> VPS** | Cannot deploy admin updates | Manual deploy procedure documented |
| **CI/CD <-> Cloudflare Pages** | Cannot deploy public site updates | Manual upload via Cloudflare dashboard |

### Tier 2: Significant Degradation

These integrations affect major features but system remains usable:

| Integration | Impact | Graceful Degradation |
|-------------|--------|----------------------|
| **Admin <-> R2** | Cannot upload images/documents | Store locally, upload later, show pending status |
| **Admin <-> SMTP** | Emails not sent | Queue emails, show "pending" in admin |
| **Public <-> R2 (images)** | Broken images on site | Placeholder images, CDN serves cached versions |
| **Backup <-> R2** | Backups not offsite | Keep local backups, alert immediately |

### Tier 3: Feature Degradation (Non-Critical)

These can fail without major user impact:

| Integration | Impact | Graceful Degradation |
|-------------|--------|----------------------|
| **Admin <-> Ollama Cloud** | No AI content generation | Manual content creation (core workflow) |
| **Admin <-> Local Ollama** | No embeddings | Search degrades to keyword-only |
| **Admin <-> Google Search** | No AI research context | AI generates without context |
| **Admin <-> Facebook** | No auto-posting to FB | Manual FB posting |
| **Chatbot <-> Ollama** | Chatbot unavailable | Show contact info instead |
| **Admin <-> Analytics** | No visitor stats | Dashboard shows cached data or "unavailable" |

---

## Recommendations

### 1. Error Handling Patterns to Implement

```typescript
// 1. UNIFIED ERROR WRAPPER
// /packages/shared/src/utils/integration-error.ts

export class IntegrationError extends Error {
  constructor(
    public integration: string,
    public operation: string,
    public isRetryable: boolean,
    public originalError: Error,
    public context?: Record<string, unknown>
  ) {
    super(`[${integration}] ${operation} failed: ${originalError.message}`);
  }
}

// Usage
try {
  await r2Client.upload(file);
} catch (err) {
  throw new IntegrationError(
    'R2',
    'upload',
    isNetworkError(err),
    err,
    { fileSize: file.size }
  );
}
```

```typescript
// 2. CIRCUIT BREAKER (for Ollama Cloud)
// /packages/shared/src/utils/circuit-breaker.ts

interface CircuitBreakerConfig {
  failureThreshold: number;    // Failures before opening
  recoveryTimeout: number;     // Ms before half-open
  monitorWindow: number;       // Window to count failures
}

// Implementation recommendation: Use opossum library
// npm install opossum

import CircuitBreaker from 'opossum';

const ollamaBreaker = new CircuitBreaker(callOllamaCloud, {
  timeout: 30000,              // 30s timeout per request
  errorThresholdPercentage: 50, // Open at 50% errors
  resetTimeout: 120000          // Try again after 2 min
});

ollamaBreaker.fallback(() => ({
  status: 'unavailable',
  message: 'AI temporarily unavailable. Please try again later.'
}));
```

```typescript
// 3. RETRY WITH EXPONENTIAL BACKOFF
// /packages/shared/src/utils/retry.ts

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: (error: Error) => boolean;
}

async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (!config.retryableErrors(error) || attempt === config.maxAttempts) {
        throw error;
      }

      const delay = Math.min(
        config.baseDelay * Math.pow(2, attempt - 1),
        config.maxDelay
      );

      await sleep(delay);
    }
  }

  throw lastError!;
}
```

### 2. Monitoring to Add

```yaml
# MONITORING DASHBOARD METRICS

Health Checks (UptimeRobot):
  - GET /api/health              # Overall system health
  - GET /api/health/db           # PostgreSQL connectivity
  - GET /api/health/ollama       # Local Ollama status
  - GET https://velikibukovec.hr # Public site availability

Sentry Error Tracking:
  - Tag errors by integration: { integration: 'r2' | 'ollama' | 'smtp' | ... }
  - Create alerts for spike in integration errors
  - Track error rate per integration

Custom Metrics (log-based or Prometheus):
  - integration.{name}.latency    # P50, P95, P99
  - integration.{name}.success    # Success count
  - integration.{name}.failure    # Failure count
  - integration.{name}.retry      # Retry count
  - ai_queue.depth                # Pending AI requests
  - ai_queue.oldest_pending       # Age of oldest pending request
  - email_queue.depth             # Pending emails
  - backup.last_success           # Timestamp of last successful backup
```

```typescript
// HEALTH CHECK ENDPOINT EXAMPLE
// /apps/admin/app/api/health/route.ts

export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkLocalOllama(),
    checkR2Connectivity(),
    checkSMTPConnectivity(),
  ]);

  const results = {
    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: {
      database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
      ollama_local: checks[1].status === 'fulfilled' ? 'ok' : 'error',
      r2: checks[2].status === 'fulfilled' ? 'ok' : 'error',
      smtp: checks[3].status === 'fulfilled' ? 'ok' : 'error',
    }
  };

  return Response.json(results, {
    status: results.status === 'healthy' ? 200 : 503
  });
}
```

### 3. Testing Strategies for Integrations

```
┌─────────────────────────────────────────────────────────────────┐
│  INTEGRATION TESTING STRATEGY                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  UNIT TESTS (Vitest - mocked integrations)                      │
│  ─────────────────────────────────────────                      │
│  • Test error handling for each failure mode                    │
│  • Test retry logic with mocked failures                        │
│  • Test circuit breaker state transitions                       │
│  • Test graceful degradation paths                              │
│                                                                 │
│  INTEGRATION TESTS (Vitest - real services in Docker)           │
│  ──────────────────────────────────────────────                 │
│  • PostgreSQL: Test connection, queries, transactions           │
│  • Local Ollama: Test embedding generation (small model)        │
│  • R2: Use Minio as S3-compatible mock                          │
│  • SMTP: Use Mailhog for email testing                          │
│                                                                 │
│  CONTRACT TESTS                                                 │
│  ─────────────────                                              │
│  • Validate API response schemas (Ollama Cloud)                 │
│  • Validate Facebook Graph API responses                        │
│  • Validate Cloudflare API responses                            │
│  • Run periodically (weekly) to catch API changes               │
│                                                                 │
│  E2E TESTS (Playwright)                                         │
│  ───────────────────────                                        │
│  • Test full flows including integrations                       │
│  • Image upload -> R2 -> display on public site                 │
│  • AI content generation flow (with mocked Ollama)              │
│  • Newsletter send flow (with Mailhog)                          │
│                                                                 │
│  CHAOS TESTING (Manual/Periodic)                                │
│  ─────────────────────────────────                              │
│  • Kill Ollama service, verify graceful degradation             │
│  • Block R2 access, verify upload queuing                       │
│  • Slow down database, verify timeout handling                  │
│  • Run monthly as part of operational review                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Priority Implementation Order

Based on risk and impact:

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| **P0** | Implement health check endpoint | Low | Critical for monitoring |
| **P0** | Add Sentry error tracking with integration tags | Low | Essential for debugging |
| **P1** | Implement retry logic for R2 uploads | Medium | Prevents data loss |
| **P1** | Implement AI queue with retry | Medium | Already planned, critical for AI features |
| **P1** | Implement email queue with retry | Medium | Prevents lost emails |
| **P2** | Add circuit breaker for Ollama Cloud | Medium | Prevents cascade failures |
| **P2** | Implement backup monitoring | Low | Early warning for backup issues |
| **P3** | Add integration latency tracking | Medium | Performance visibility |
| **P3** | Contract tests for external APIs | Medium | Catch breaking changes |

### 5. Runbook Entries to Create

Each integration should have a runbook entry:

```markdown
## RUNBOOK: Ollama Cloud Integration Failure

### Symptoms
- AI content generation shows "failed" status
- Circuit breaker status: OPEN
- Sentry errors tagged `integration:ollama_cloud`

### Immediate Actions
1. Check Ollama Cloud status page: status.ollama.ai
2. Check API key validity in environment
3. Check rate limit status in admin dashboard

### Resolution Steps
1. If rate limited: Wait for limit reset (check plan limits)
2. If auth error: Refresh API key in .env
3. If service down: Monitor status page, queue accumulates requests

### Escalation
- If down > 2 hours: Contact Ollama support
- If persistent auth issues: Check billing status

### Post-Incident
- Review queue depth
- Process accumulated queue items
- Update incident log
```

---

## Summary

This integration audit identified **17 distinct integration points** in the Veliki Bukovec municipality website system. The most critical integrations are:

1. **Database connectivity** - Foundation of entire system
2. **R2 storage** - Images and backups depend on it
3. **CI/CD pipeline** - All deployments flow through it

The recommended approach is:

- **Accept that failures will happen** at integration boundaries
- **Implement retry logic** for transient failures (network, rate limits)
- **Use circuit breakers** for unreliable external APIs (Ollama Cloud)
- **Design for graceful degradation** where possible
- **Monitor aggressively** with clear alerting thresholds
- **Document runbooks** for each integration failure scenario

The AI features (Ollama Cloud integration) are intentionally placed last in the roadmap, allowing time to build robust error handling patterns before they're needed.
