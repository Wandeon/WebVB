# DEPENDENCY-AUDIT.md - External Dependency Risk Assessment

> Comprehensive audit of all external services, libraries, and dependencies.
> Assesses vendor lock-in, failure scenarios, and mitigation strategies.
> Last updated: 2026-01-23

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [External Services Inventory](#external-services-inventory)
3. [NPM Package Dependencies](#npm-package-dependencies)
4. [Single Points of Failure](#single-points-of-failure)
5. [Risk Matrix](#risk-matrix)
6. [Recommendations](#recommendations)

---

## Executive Summary

### Dependency Count

| Category | Count | Critical | Medium Risk | Low Risk |
|----------|-------|----------|-------------|----------|
| External Services | 9 | 2 | 4 | 3 |
| Core NPM Packages | 12 | 4 | 5 | 3 |
| **Total** | **21** | **6** | **9** | **6** |

### Critical Dependencies (Immediate Attention Required)

1. **Cloudflare** - Hosts public site, images, DNS - no quick fallback
2. **Better Auth** - Entire auth system depends on single library
3. **PostgreSQL** - All data, single VPS instance
4. **Ollama Cloud** - AI features completely dependent

### Overall Risk Assessment: MEDIUM

The architecture is well-designed with sensible choices, but has concentration risk with Cloudflare and limited redundancy for critical systems.

---

## External Services Inventory

### 1. Cloudflare (Pages, R2, CDN, DNS, WAF, Analytics)

| Aspect | Assessment |
|--------|------------|
| **What it does** | Hosts public site (Pages), stores images/backups (R2), provides DNS, CDN caching, DDoS protection, WAF, SSL, and analytics |
| **Vendor lock-in** | **HIGH** |
| **Monthly cost** | ~EUR5-15 (R2 storage) + Free tier services |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | Public site completely down. Images unavailable. DNS resolution fails. | Siteground backup site exists but requires DNS change (propagation delay). No automatic failover. |
| **1 day** | Severe - municipality website inaccessible. Admin panel still works (VPS) but cannot update public site. Reputational damage. | Manual DNS switch to Siteground (15-60 min propagation). Would need to sync content. |
| **Permanent** | Would require complete migration. 2-4 weeks to rebuild on alternative. | See migration plan below. |

#### Fallback Options

| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| Vercel (Pages) | Medium - 1-2 days | Similar (free tier available) |
| Netlify (Pages) | Medium - 1-2 days | Similar (free tier available) |
| AWS S3 + CloudFront | High - 3-5 days | Higher (~EUR20-40/mo) |
| Siteground (current backup) | Low - DNS change only | Already paid |

**For R2 specifically:**
| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| AWS S3 | Medium - 2-3 days | Higher (egress fees) |
| Backblaze B2 | Medium - 2-3 days | Similar pricing |
| Bunny.net Storage | Medium - 2-3 days | Slightly higher |

#### Cost Risk

- Cloudflare has maintained stable pricing for years
- Free tier is generous and unlikely to change drastically
- R2 pricing is competitive; even 2x increase would be ~EUR30/mo
- **Risk: LOW**

#### Migration Difficulty: MEDIUM-HIGH

- Pages: Standard Next.js static export, portable
- R2: Would need to migrate all images (scripted, but time-consuming)
- DNS: Easy to change, but propagation takes time
- Analytics: Would lose historical data
- WAF rules: Would need to recreate

---

### 2. Netcup VPS 1000 G12

| Aspect | Assessment |
|--------|------------|
| **What it does** | Hosts admin panel, PostgreSQL database, local Ollama (embeddings), Better Auth |
| **Vendor lock-in** | **LOW** |
| **Monthly cost** | ~EUR8 |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | Admin panel down. No content updates. Chatbot unavailable. Public site still serves (static). | Wait. Consider standby VPS for critical deployments. |
| **1 day** | Severe operational impact. Cannot update content, respond to contact forms, manage problems. | Restore from backup to new VPS (2-4 hours with preparation). |
| **Permanent** | Full migration to new provider. | Documented setup scripts should enable 4-8 hour recovery. |

#### Fallback Options

| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| Hetzner VPS | Low - same setup | Similar (~EUR8-10) |
| DigitalOcean | Low - same setup | Higher (~EUR12-15) |
| Vultr | Low - same setup | Similar |
| AWS EC2/Lightsail | Medium | Higher |

#### Cost Risk

- VPS pricing is stable across industry
- **Risk: VERY LOW**

#### Migration Difficulty: LOW

- Standard Ubuntu server
- Docker or PM2 deployment is portable
- Database backup/restore is straightforward
- Main effort: DNS update + SSL configuration

---

### 3. Ollama Cloud (Pro/Max Plan)

| Aspect | Assessment |
|--------|------------|
| **What it does** | Provides Llama 3.1 70B for AI content generation, chatbot responses |
| **Vendor lock-in** | **MEDIUM** |
| **Monthly cost** | ~EUR20-30 |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | AI generation queued. Staff cannot generate AI-assisted content. Chatbot degraded (can show "unavailable" message). | Queue system handles gracefully with retry. User sees "generating..." |
| **1 day** | AI features unavailable. Staff must write content manually. Chatbot shows fallback message with links to relevant pages. | Acceptable degradation - core site functions fine. |
| **Permanent** | Would need to switch LLM providers. | 1-2 week migration to alternative. |

#### Fallback Options

| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| OpenAI API | Low - API change | Higher (~EUR50-100/mo at similar usage) |
| Anthropic Claude API | Low - API change | Similar to OpenAI |
| Together AI | Low - API change | Similar pricing |
| Self-hosted Ollama (larger VPS) | High - infrastructure change | Higher VPS cost (~EUR40-60/mo for 70B model) |
| Smaller local model | Medium | Included in VPS cost but quality degradation |

#### Cost Risk

- Ollama Cloud is relatively new (pricing may change)
- LLM API pricing has been trending downward industry-wide
- Rate limits may become more restrictive
- **Risk: MEDIUM**

#### Migration Difficulty: LOW-MEDIUM

- API interface is similar across providers
- Prompt engineering may need adjustment
- Main challenge: testing quality of alternative models

---

### 4. Google OAuth

| Aspect | Assessment |
|--------|------------|
| **What it does** | One-click login for admin users via Google account |
| **Vendor lock-in** | **LOW** |
| **Monthly cost** | Free |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | Google OAuth login unavailable. Users can still login with email/password or passkeys. | Multiple auth methods exist - minimal impact. |
| **1 day** | Same as above. Minor inconvenience. | Encourage users to set up passkeys/password as backup. |
| **Permanent** | Would need to remove Google OAuth option. | Straightforward - other auth methods remain. |

#### Fallback Options

- Email/password authentication (always available)
- Passkeys/WebAuthn (always available)
- TOTP 2FA (always available)
- Microsoft OAuth (easy to add if needed)

#### Cost Risk

- Google OAuth API is free and stable
- **Risk: VERY LOW**

#### Migration Difficulty: VERY LOW

- OAuth is optional convenience, not critical path

---

### 5. Google Search API (Custom Search)

| Aspect | Assessment |
|--------|------------|
| **What it does** | Provides context for AI content generation (research step) |
| **Vendor lock-in** | **LOW** |
| **Monthly cost** | ~EUR0-5 (low volume) |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | AI generation skips research step or uses cached context. Slightly lower quality content. | Graceful degradation - AI still generates content. |
| **1 day** | Same as above. Acceptable. | Could implement caching of common searches. |
| **Permanent** | Would need alternative search API. | Easy migration. |

#### Fallback Options

| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| Bing Search API | Low | Free tier available |
| DuckDuckGo API | Low | Free |
| SerpAPI | Low | Similar |
| Skip research step | None | Free (quality trade-off) |

#### Cost Risk

- Google has changed API pricing before
- Low volume makes this low-impact
- **Risk: LOW**

#### Migration Difficulty: VERY LOW

---

### 6. Facebook API (Page Posting)

| Aspect | Assessment |
|--------|------------|
| **What it does** | Posts news to municipality Facebook page from admin |
| **Vendor lock-in** | **LOW** |
| **Monthly cost** | Free |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | Cannot auto-post to Facebook. Staff can manually post. | Acceptable - convenience feature. |
| **1 day** | Same. | Staff posts manually. |
| **Permanent** | Lose auto-posting capability. | Manual posting is viable fallback. |

#### Fallback Options

- Manual Facebook posting (always available)
- Buffer/Hootsuite integration
- IFTTT automation

#### Cost Risk

- Facebook API is free for page posting
- API changes frequently (may break integration)
- **Risk: LOW** (financial), **MEDIUM** (stability)

#### Migration Difficulty: LOW

- Feature is nice-to-have, not critical

---

### 7. Siteground (Email Hosting)

| Aspect | Assessment |
|--------|------------|
| **What it does** | Hosts @velikibukovec.hr email accounts, SMTP for transactional emails |
| **Vendor lock-in** | **MEDIUM** |
| **Monthly cost** | Already paid (existing contract) |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | Email delivery delayed. Contact form confirmations delayed. Newsletter queued. | Acceptable - email is inherently async. |
| **1 day** | Email disruption affects communication. Password resets delayed. | Significant but survivable. Staff can use personal email for urgent matters. |
| **Permanent** | Full email migration required. | 1-2 weeks effort, affects all staff email. |

#### Fallback Options

| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| Google Workspace | High (MX records, mailbox migration) | ~EUR6/user/mo |
| Microsoft 365 | High | ~EUR5/user/mo |
| Zoho Mail | Medium | Free tier or ~EUR1/user/mo |
| Fastmail | Medium | ~EUR5/user/mo |

#### Cost Risk

- Siteground pricing is stable
- Already paid, so low incremental cost
- **Risk: LOW**

#### Migration Difficulty: MEDIUM-HIGH

- Email migration is always disruptive
- MX record changes needed
- Historical emails need migration
- Staff retraining on new interface

---

### 8. Sentry (Error Tracking)

| Aspect | Assessment |
|--------|------------|
| **What it does** | Captures and tracks application errors |
| **Vendor lock-in** | **LOW** |
| **Monthly cost** | Free (10k events/mo) |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **1 hour** | Errors not tracked. | Application logs still available on VPS. |
| **1 day** | May miss errors. | Check VPS logs manually. |
| **Permanent** | No error tracking. | Migrate to alternative. |

#### Fallback Options

| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| Self-hosted Sentry | Medium | VPS resources |
| Bugsnag | Low | Similar pricing |
| Rollbar | Low | Similar pricing |
| Console logs only | None | Free (reduced visibility) |

#### Cost Risk

- Free tier is generous
- **Risk: VERY LOW**

#### Migration Difficulty: VERY LOW

---

### 9. UptimeRobot (Monitoring)

| Aspect | Assessment |
|--------|------------|
| **What it does** | Monitors site uptime, alerts on downtime |
| **Vendor lock-in** | **VERY LOW** |
| **Monthly cost** | Free |

#### Failure Scenarios

| Duration | Impact | Mitigation |
|----------|--------|------------|
| **Any duration** | Won't know if site is down until users report. | Many free alternatives available. |

#### Fallback Options

| Alternative | Migration Effort | Cost Impact |
|-------------|------------------|-------------|
| Pingdom | Very Low | Free tier or paid |
| Better Stack | Very Low | Free tier |
| Cloudflare built-in | None | Already included |
| Self-hosted (cron + curl) | Low | Free |

#### Cost Risk

- **Risk: NONE**

#### Migration Difficulty: TRIVIAL

---

## NPM Package Dependencies

### Critical Packages

#### 1. Next.js 16

| Aspect | Assessment |
|--------|------------|
| **What it does** | Core framework for both apps |
| **Maintainer** | Vercel (well-funded company) |
| **Abandonment risk** | **VERY LOW** |
| **Security responsiveness** | Excellent (CVEs patched quickly) |
| **Lock-in level** | **HIGH** |

**Migration difficulty if needed:** HIGH (6-12 months for major rewrite)
**Alternatives:** Remix, Nuxt (Vue), SvelteKit, Astro

---

#### 2. Better Auth

| Aspect | Assessment |
|--------|------------|
| **What it does** | Complete authentication system |
| **Maintainer** | Open source community, multiple contributors |
| **Abandonment risk** | **MEDIUM** |
| **Security responsiveness** | Good (active development) |
| **Lock-in level** | **HIGH** |

**Risk factors:**
- Relatively new library (2024/2025)
- Main competitors (NextAuth/Auth.js) had stability issues, hence this choice
- Schema is well-documented, data is portable

**Migration difficulty if needed:** MEDIUM-HIGH (2-4 weeks)
**Alternatives:** Auth.js (if stabilized), Lucia Auth, Clerk (paid), custom implementation

**Recommendation:** Monitor project health monthly. Have migration plan ready.

---

#### 3. Prisma

| Aspect | Assessment |
|--------|------------|
| **What it does** | Database ORM, migrations, type safety |
| **Maintainer** | Prisma (VC-funded company) |
| **Abandonment risk** | **LOW** |
| **Security responsiveness** | Good |
| **Lock-in level** | **MEDIUM** |

**Risk factors:**
- VC-funded company (could pivot or monetize aggressively)
- Schema is standard PostgreSQL (portable)
- Generated client is specific to Prisma

**Migration difficulty if needed:** MEDIUM (2-3 weeks)
**Alternatives:** Drizzle ORM, Kysely, TypeORM, raw SQL with type generation

---

#### 4. TipTap

| Aspect | Assessment |
|--------|------------|
| **What it does** | Rich text editor for content creation |
| **Maintainer** | Tiptap GmbH (company behind it) |
| **Abandonment risk** | **LOW** |
| **Security responsiveness** | Good |
| **Lock-in level** | **MEDIUM** |

**Risk factors:**
- Content stored as TipTap JSON (proprietary format)
- Can be converted to HTML for portability

**Migration difficulty if needed:** MEDIUM (content format conversion needed)
**Alternatives:** Slate, Lexical (Meta), Quill, ProseMirror (TipTap's base)

---

### Medium-Risk Packages

#### 5. TanStack Query v5

| Aspect | Assessment |
|--------|------------|
| **What it does** | Server state management |
| **Maintainer** | Tanner Linsley (individual + sponsors) |
| **Abandonment risk** | **LOW** |
| **Lock-in level** | **LOW** |

**Alternatives:** SWR, native React Server Components, custom hooks

---

#### 6. Framer Motion

| Aspect | Assessment |
|--------|------------|
| **What it does** | Animations |
| **Maintainer** | Framer B.V. (company) |
| **Abandonment risk** | **LOW** |
| **Lock-in level** | **LOW** |

**Alternatives:** CSS animations, Motion One, GSAP, React Spring

---

#### 7. shadcn/ui

| Aspect | Assessment |
|--------|------------|
| **What it does** | UI component library |
| **Maintainer** | Vercel employee (Shadcn) |
| **Abandonment risk** | **VERY LOW** |
| **Lock-in level** | **VERY LOW** (components are copied, not installed) |

**Notes:** Components are vendored into codebase. No runtime dependency.

---

#### 8. Tailwind CSS v4

| Aspect | Assessment |
|--------|------------|
| **What it does** | Utility-first CSS framework |
| **Maintainer** | Tailwind Labs (well-funded) |
| **Abandonment risk** | **VERY LOW** |
| **Lock-in level** | **MEDIUM** (styles embedded in components) |

**Alternatives:** Vanilla CSS, UnoCSS, StyleX

---

#### 9. Zod

| Aspect | Assessment |
|--------|------------|
| **What it does** | Schema validation |
| **Maintainer** | Colin McDonnell (individual + sponsors) |
| **Abandonment risk** | **LOW** |
| **Lock-in level** | **LOW** |

**Alternatives:** Yup, Valibot, ArkType, io-ts

---

#### 10. React Hook Form

| Aspect | Assessment |
|--------|------------|
| **What it does** | Form state management |
| **Maintainer** | BlueBill (company) |
| **Abandonment risk** | **LOW** |
| **Lock-in level** | **LOW** |

**Alternatives:** Formik, native React forms, TanStack Form

---

### Low-Risk Packages

#### 11. Sharp

| Aspect | Assessment |
|--------|------------|
| **What it does** | Image processing |
| **Maintainer** | Lovell Fuller (individual + sponsors) |
| **Abandonment risk** | **VERY LOW** |
| **Lock-in level** | **VERY LOW** |

**Alternatives:** Jimp, ImageMagick, Cloudflare Image Resizing

---

#### 12. Pino

| Aspect | Assessment |
|--------|------------|
| **What it does** | Structured logging |
| **Maintainer** | Platformatic (company) |
| **Abandonment risk** | **VERY LOW** |
| **Lock-in level** | **VERY LOW** |

**Alternatives:** Winston, Bunyan, console.log

---

### Package Dependency Summary Table

| Package | Role | Lock-in | Abandon Risk | Migration Time |
|---------|------|---------|--------------|----------------|
| Next.js 16 | Framework | HIGH | Very Low | 6-12 months |
| Better Auth | Auth | HIGH | Medium | 2-4 weeks |
| Prisma | ORM | MEDIUM | Low | 2-3 weeks |
| TipTap | Editor | MEDIUM | Low | 2-3 weeks |
| TanStack Query | State | LOW | Low | 1 week |
| Framer Motion | Animation | LOW | Low | 1 week |
| shadcn/ui | Components | VERY LOW | Very Low | N/A (vendored) |
| Tailwind v4 | Styling | MEDIUM | Very Low | 2-4 weeks |
| Zod | Validation | LOW | Low | 1 week |
| React Hook Form | Forms | LOW | Low | 1 week |
| Sharp | Images | VERY LOW | Very Low | 1-2 days |
| Pino | Logging | VERY LOW | Very Low | 1 day |

---

## Single Points of Failure

### Critical SPOFs (Must Address)

#### 1. PostgreSQL Database (Single Instance)

| Issue | Risk Level | Impact |
|-------|------------|--------|
| No replication | **HIGH** | All data loss if VPS fails before backup |
| No automatic failover | **HIGH** | Extended downtime on DB crash |

**Current mitigation:**
- Daily backups to R2

**Recommended additional mitigations:**
- [ ] Enable PostgreSQL streaming replication to standby (adds ~EUR8/mo for second VPS)
- [ ] Implement WAL archiving to R2 for point-in-time recovery
- [ ] Test backup restoration quarterly

---

#### 2. VPS (Single Server)

| Issue | Risk Level | Impact |
|-------|------------|--------|
| No redundancy | **MEDIUM** | Admin panel down if VPS fails |
| Single region | **LOW** | EU users fine, but no geo-redundancy |

**Current mitigation:**
- Public site on Cloudflare (separate)
- Documented setup for rapid re-deployment

**Recommended additional mitigations:**
- [ ] Create deployment automation scripts (Ansible/Docker)
- [ ] Keep VPS snapshot updated weekly
- [ ] Consider cold standby VPS on different provider

---

#### 3. DNS at Cloudflare

| Issue | Risk Level | Impact |
|-------|------------|--------|
| Single DNS provider | **MEDIUM** | Total outage if Cloudflare DNS fails |

**Current mitigation:**
- Siteground can serve as backup site

**Recommended additional mitigations:**
- [ ] Register secondary nameservers (Route53 or similar) - keep dormant
- [ ] Document DNS records for quick recreation

---

### Medium SPOFs (Monitor)

#### 4. R2 Storage (Images & Backups)

| Issue | Risk Level | Impact |
|-------|------------|--------|
| Single storage provider | **MEDIUM** | Images unavailable, backups inaccessible |

**Recommended mitigations:**
- [ ] Secondary backup to different provider (e.g., monthly to Backblaze B2)
- [ ] Keep local copy of most recent backup on VPS

---

#### 5. Ollama Cloud (AI Features)

| Issue | Risk Level | Impact |
|-------|------------|--------|
| Single AI provider | **LOW** | AI features degraded (core site works) |

**Current mitigation:**
- Queue system handles rate limits
- Chatbot can show fallback message

**Status:** Acceptable - AI is enhancement, not core functionality

---

### Non-SPOF (Already Redundant)

| Component | Why It's Not SPOF |
|-----------|-------------------|
| Authentication | Multiple methods (email, Google, passkeys) |
| Public site hosting | Can fail over to Siteground backup |
| Error tracking | Application logs available on VPS |
| Uptime monitoring | Many free alternatives |

---

## Risk Matrix

### Service Risk Summary

| Service | Lock-in | Failure Impact | Cost Risk | Overall Risk |
|---------|---------|----------------|-----------|--------------|
| Cloudflare | HIGH | CRITICAL | LOW | **HIGH** |
| Netcup VPS | LOW | HIGH | VERY LOW | **MEDIUM** |
| Ollama Cloud | MEDIUM | MEDIUM | MEDIUM | **MEDIUM** |
| Google OAuth | LOW | LOW | VERY LOW | **LOW** |
| Google Search | LOW | LOW | LOW | **LOW** |
| Facebook API | LOW | LOW | LOW | **LOW** |
| Siteground | MEDIUM | MEDIUM | LOW | **MEDIUM** |
| Sentry | LOW | LOW | VERY LOW | **LOW** |
| UptimeRobot | VERY LOW | LOW | NONE | **VERY LOW** |

### Package Risk Summary

| Category | High Risk | Medium Risk | Low Risk |
|----------|-----------|-------------|----------|
| Framework | Next.js | - | - |
| Auth | Better Auth | - | - |
| Data | - | Prisma, TipTap | Zod, RHF |
| UI | - | Tailwind | shadcn, Framer |
| Infra | - | - | Sharp, Pino, TanStack |

---

## Recommendations

### Immediate Actions (Before Launch)

#### 1. Database Redundancy

**Priority: CRITICAL**

```
Current: Single PostgreSQL instance, daily backups
Target: Streaming replication + WAL archiving
```

Actions:
- [ ] Set up PostgreSQL streaming replication to standby VPS
- [ ] Enable WAL archiving to R2
- [ ] Document and test failover procedure
- [ ] Test backup restoration (actually restore to new DB)

**Estimated cost:** +EUR8-10/mo for standby VPS

---

#### 2. Deployment Automation

**Priority: HIGH**

Actions:
- [ ] Create Docker Compose file for entire admin stack
- [ ] Create Ansible playbook for VPS setup
- [ ] Document step-by-step recovery procedure
- [ ] Store infrastructure-as-code in separate repo

**Estimated time:** 2-3 days

---

#### 3. Secondary Backup Location

**Priority: HIGH**

Actions:
- [ ] Set up monthly backup sync to Backblaze B2 (different provider than R2)
- [ ] Verify backup integrity monthly
- [ ] Keep one backup on VPS local storage

**Estimated cost:** ~EUR1-2/mo

---

### Medium-Term Actions (Within 3 Months)

#### 4. Better Auth Monitoring

**Priority: MEDIUM**

The auth library is the highest-risk package due to relative newness.

Actions:
- [ ] Subscribe to Better Auth GitHub releases
- [ ] Review changelog monthly for breaking changes
- [ ] Document data export procedure from auth tables
- [ ] Evaluate Auth.js stability every 6 months

---

#### 5. DNS Redundancy

**Priority: MEDIUM**

Actions:
- [ ] Document all DNS records
- [ ] Create dormant secondary DNS zone (Route53)
- [ ] Test DNS propagation procedure

---

#### 6. Content Export Capability

**Priority: MEDIUM**

Actions:
- [ ] Implement TipTap JSON to HTML converter
- [ ] Create content export API (all posts, pages, documents metadata)
- [ ] Test full site export quarterly

---

### Long-Term Considerations (6+ Months)

#### 7. Multi-Provider AI Strategy

If AI usage grows significantly:
- [ ] Abstract AI provider behind interface
- [ ] Implement provider fallback (Ollama Cloud -> OpenAI -> Local model)
- [ ] Consider dedicated GPU VPS for high-volume AI

---

#### 8. Regional Redundancy

If site becomes critical infrastructure:
- [ ] Consider VPS in second region
- [ ] Implement database cross-region replication
- [ ] Use Cloudflare Load Balancing

**Note:** Likely overkill for municipality website, but documented for future reference.

---

### Vendor Diversification Strategy

#### Current State

```
                    Cloudflare (80% of infrastructure)
                    ├── Pages (public site)
                    ├── R2 (images)
                    ├── R2 (backups)
                    ├── DNS
                    ├── CDN
                    ├── WAF
                    └── Analytics

Concentration Risk: HIGH
```

#### Target State

```
                    Cloudflare (60%)          Others (40%)
                    ├── Pages (public site)   ├── Netcup VPS (admin)
                    ├── R2 (images)           ├── Backblaze B2 (backup mirror)
                    ├── DNS (primary)         ├── Route53 (DNS secondary)
                    ├── CDN                   ├── Sentry (errors)
                    └── WAF                   └── Siteground (email)

Concentration Risk: MEDIUM
```

### What to Self-Host vs External

| Component | Recommendation | Rationale |
|-----------|---------------|-----------|
| **Public site** | External (Cloudflare) | Global CDN essential, cost-effective |
| **Admin panel** | Self-host (VPS) | Control, security, already required for DB |
| **Database** | Self-host (VPS) | Data sovereignty, cost, performance |
| **Images** | External (R2) | CDN delivery, no egress costs |
| **Backups** | External (R2 + B2) | Geographic redundancy |
| **Email** | External (Siteground) | Complexity of self-hosting not worth it |
| **LLM inference** | External (Ollama Cloud) | Hardware requirements exceed budget |
| **Embeddings** | Self-host (VPS Ollama) | Small model, frequent calls, already on VPS |
| **Error tracking** | External (Sentry) | Not worth self-hosting complexity |
| **Monitoring** | External (UptimeRobot) | Must be external to detect outages |

---

## Appendix: Emergency Procedures

### A. Cloudflare Outage

1. Access Siteground hosting panel
2. Verify backup site is current (should be synced)
3. Update DNS A record to point to Siteground IP
4. Wait for propagation (15-60 minutes)
5. Images will be broken until R2 is back or images migrated

### B. VPS Failure

1. Provision new VPS (Netcup or alternative)
2. Run deployment automation scripts
3. Restore database from most recent R2 backup
4. Update Cloudflare DNS for admin subdomain
5. Verify Better Auth sessions (users will need to re-login)

### C. Better Auth Library Abandoned

1. Fork library if security fix needed urgently
2. Begin evaluation of alternatives
3. Export all user data (email, OAuth connections, passkey public keys)
4. Plan 2-4 week migration to new auth system
5. Notify users of potential re-registration need

---

## Document History

| Date | Change |
|------|--------|
| 2026-01-23 | Initial dependency audit created |
