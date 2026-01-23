# ASSUMPTION-AUDIT.md - Critical Project Assumptions Analysis

> Systematic audit of assumptions baked into the Veliki Bukovec municipality website project.
> Every assumption is challenged with: What if it's wrong?
> Last updated: 2026-01-23

---

## Confidence Level Legend

| Level | Definition |
|-------|------------|
| **Validated** | Confirmed through testing, documentation, or direct experience |
| **Likely** | High confidence based on industry norms, but not directly tested |
| **Uncertain** | Reasonable expectation with significant unknowns |
| **Risky** | Speculative assumption with material impact if wrong |

---

## 1. Technical Assumptions

### 1.1 Next.js 16 Static Export Will Handle All Public Site Needs

**Confidence:** Likely

**The Assumption:**
The public website can be fully pre-rendered as static HTML/CSS/JS with no server-side runtime requirements.

**What If Wrong?**
- Dynamic features (real-time search, chatbot) may require API calls that break static export
- Client-side data fetching adds complexity and loading states
- generateStaticParams() must enumerate ALL possible routes at build time
- If content volume grows, build times may become prohibitive (1000+ pages = 10+ minute builds)

**How to Validate:**
- Sprint 0: Create proof-of-concept with 5 dynamic routes, verify `next build && next export` succeeds
- Test: Can chatbot work via client-side API calls to admin backend?
- Measure: Build time with 100, 500, 1000 pages of test content

**Pivot Strategy:**
- If static export fails: Switch to ISR (Incremental Static Regeneration) on Cloudflare Workers
- If build times explode: Implement selective static generation (only recent 100 posts static, rest on-demand)

---

### 1.2 Better Auth Will Support All Authentication Methods Needed

**Confidence:** Uncertain

**The Assumption:**
Better Auth provides production-ready support for: email/password, Google OAuth, Passkeys/WebAuthn, TOTP 2FA, rate limiting, and audit logging - all working together.

**What If Wrong?**
- Better Auth is newer than NextAuth.js - fewer battle-tested edge cases
- WebAuthn browser support varies (older browsers, corporate networks)
- Plugin interactions may conflict (rate limiting + 2FA flows)
- Croatian government compliance may require specific audit log formats not supported

**How to Validate:**
- Sprint 0.3: Implement full auth flow with all 4 methods on a test user
- Test: WebAuthn on mobile Chrome/Safari, desktop Chrome/Firefox/Edge
- Verify: Audit log format meets any known Croatian requirements
- Load test: Verify rate limiting actually works under concurrent requests

**Pivot Strategy:**
- If WebAuthn fails: Make it optional, fall back to TOTP-only for 2FA
- If Better Auth fundamentally broken: Clerk or Auth0 are viable alternatives (add cost)
- If audit format wrong: Write custom audit middleware alongside Better Auth

---

### 1.3 pgvector Is Sufficient for RAG at Municipality Scale

**Confidence:** Likely

**The Assumption:**
PostgreSQL with pgvector can handle: embedding storage, vector similarity search, and hybrid search for a municipality with ~1000 documents and ~500 news articles.

**What If Wrong?**
- Query latency may exceed acceptable limits (>500ms) for chatbot responses
- HNSW index tuning may be complex and underdocumented
- Concurrent vector queries may bottleneck the single PostgreSQL instance
- Croatian language tokenization for full-text search may produce poor results

**How to Validate:**
- Sprint 7.1: Load 1000 test documents with embeddings
- Benchmark: Vector search latency at p50, p95, p99
- Test: Hybrid search quality with Croatian queries
- Measure: Memory footprint of pgvector indexes

**Pivot Strategy:**
- If latency too high: Add Redis cache for common queries
- If scale exceeded: Move to dedicated vector DB (Qdrant, Pinecone) - adds cost
- If Croatian FTS poor: Use external search service (Algolia, Typesense)

---

### 1.4 Ollama Cloud Croatian Output Quality Is Production-Ready

**Confidence:** Risky

**The Assumption:**
Llama 3.1 70B via Ollama Cloud will generate fluent, formal Croatian text suitable for official municipality communications without significant human editing.

**What If Wrong?**
- Croatian is a morphologically complex language; LLM may produce grammatical errors
- Formal "municipality voice" may require extensive prompt engineering
- LLM may hallucinate facts about local places, people, or regulations
- "Slop" detection (Step 4 in pipeline) may not catch Croatian-specific issues

**How to Validate:**
- Pre-Sprint 6: Generate 10 sample articles with real municipality topics
- Have native Croatian speaker with official writing experience review
- Test: Can the model correctly use Croatian cases, genders, formal address (Vi vs ti)?
- Measure: What percentage of output requires significant editing vs minor tweaks vs none?

**Pivot Strategy:**
- If quality poor: Switch to GPT-4 or Claude (higher cost, better multilingual)
- If too many edits needed: Reframe AI as "draft assistant" not "content generator"
- If hallucinations: Add mandatory fact-check step with source links

---

### 1.5 TipTap Will Handle All Rich Text Editing Needs

**Confidence:** Likely

**The Assumption:**
TipTap provides sufficient rich text features for municipality content: headings, lists, links, images, tables, and basic formatting.

**What If Wrong?**
- Tables may be required for complex document layouts (budgets, schedules)
- Collaborative editing may be requested (multiple staff editing same document)
- Copy-paste from Word may produce broken formatting
- Image placement and resizing UX may be clunky

**How to Validate:**
- Sprint 1.4: Build editor with all planned features
- User test: Have actual municipality staff try editing a real document
- Test: Copy content from typical WordPress post, verify formatting preserved

**Pivot Strategy:**
- If tables insufficient: Add TipTap Table extension
- If copy-paste broken: Add custom paste handler to clean Word HTML
- If fundamentally limited: Consider Plate.js or custom editor

---

### 1.6 Sharp Can Process Images Fast Enough on VPS

**Confidence:** Likely

**The Assumption:**
Sharp image processing (resize, WebP conversion, 3 variants) on Netcup VPS 1000 G12 (4 vCPU, 8GB RAM) will complete in under 5 seconds per image.

**What If Wrong?**
- Large images (10MB+) may cause memory pressure
- Concurrent uploads during bulk gallery upload may spike CPU/RAM
- VPS may be noisy neighbor throttled
- Processing queue may back up during active content creation periods

**How to Validate:**
- Sprint 1.5: Upload 50 images rapidly, measure processing time and resource usage
- Test with maximum allowed size (10MB) images
- Monitor VPS during stress test: CPU, RAM, I/O wait

**Pivot Strategy:**
- If too slow: Add processing queue with background worker
- If VPS underpowered: Upgrade to VPS 2000 G12 (~+4/month)
- If fundamentally bottlenecked: Move image processing to Cloudflare Images (add cost)

---

### 1.7 Prisma Cold Start Times Are Acceptable

**Confidence:** Uncertain

**The Assumption:**
Prisma has improved cold start times and the admin panel on VPS will have negligible startup latency.

**What If Wrong?**
- VPS may have cold starts after periods of inactivity (PM2 restart, deploy)
- First request after deploy may take 2-5 seconds
- Serverless-style patterns (if ever needed) will suffer

**How to Validate:**
- Sprint 0.6: Deploy admin to VPS, measure cold start time
- Test: Time from PM2 restart to first successful authenticated request

**Pivot Strategy:**
- If cold starts bad: Implement health check endpoint that warms connection pool
- If fundamentally slow: Consider Drizzle ORM as lighter alternative

---

### 1.8 Monorepo with Turborepo Will Not Cause Build Complexity

**Confidence:** Likely

**The Assumption:**
Turborepo can manage the monorepo (2 apps, 3 packages) without significant configuration overhead or CI complexity.

**What If Wrong?**
- Workspace dependency resolution may have edge cases
- CI caching may not work as expected, causing slow builds
- Package versioning within monorepo may cause confusion
- Developer onboarding complexity increases

**How to Validate:**
- Sprint 0.1: Set up full monorepo structure, verify `pnpm build` works
- Sprint 0.5: Verify CI caching works, measure build times with/without cache

**Pivot Strategy:**
- If complexity too high: Simplify to single app with folder-based organization
- If CI issues: Fall back to sequential builds without Turborepo caching

---

### 1.9 Cloudflare Pages Build Times Are Acceptable

**Confidence:** Likely

**The Assumption:**
Cloudflare Pages can build and deploy the static site in under 5 minutes, enabling reasonable publish-to-live workflows.

**What If Wrong?**
- Large static site (many pages, images) may exceed build limits
- Cloudflare free tier has 500 builds/month limit
- Build failures may be hard to debug in Cloudflare environment

**How to Validate:**
- Sprint 3.6: Deploy test site, measure build time
- Calculate: With weekly newsletter + daily posts, how many builds/month?

**Pivot Strategy:**
- If builds slow: Implement smarter rebuild triggers (batch publishes)
- If limit exceeded: Cloudflare Pro ($20/mo) has 5000 builds/month
- If debugging hard: Add verbose logging, consider Vercel as alternative

---

### 1.10 Local Ollama for Embeddings Fits in VPS RAM

**Confidence:** Uncertain

**The Assumption:**
nomic-embed-text model running locally on VPS will use acceptable RAM (~2GB) while PostgreSQL, admin app, and other services also run.

**What If Wrong?**
- VPS has 8GB RAM total; PostgreSQL may need 2-3GB, Node.js 1-2GB
- Embedding model may spike during batch processing (migration, bulk upload)
- OOM killer may terminate processes under memory pressure
- Swap usage will tank performance

**How to Validate:**
- Sprint 3.4: Install Ollama with nomic-embed-text, measure actual RAM usage
- Sprint 7.1: Run embedding pipeline on 100 documents, monitor memory
- Test: Run all services simultaneously under load

**Pivot Strategy:**
- If RAM tight: Upgrade VPS to 16GB model
- If still insufficient: Move embeddings to Ollama Cloud (Pro plan likely includes)
- If critical: Use lighter embedding model (sacrifice quality)

---

## 2. Business/Client Assumptions

### 2.1 Client Will Provide Timely Feedback

**Confidence:** Uncertain

**The Assumption:**
Municipality staff will review and approve deliverables within 2-3 business days, enabling the 60-day timeline.

**What If Wrong?**
- Government processes are notoriously slow; decisions may require committee approval
- Key stakeholders may be unavailable (vacation, other priorities)
- Feedback may be contradictory between different staff members
- Sign-off authority may be unclear

**How to Validate:**
- Before Sprint 0: Establish clear feedback SLA in kickoff meeting
- Identify: Who has final sign-off authority? What's their availability?
- Get: Direct contact (not through intermediaries) for quick questions

**Pivot Strategy:**
- If feedback slow: Build in 2x buffer for client-dependent phases (4, 8)
- If contradictory: Escalate to single decision-maker
- If unavailable: Proceed with documented assumptions, adjust later

---

### 2.2 Staff Will Adopt the New CMS

**Confidence:** Uncertain

**The Assumption:**
Non-technical municipality staff will transition from WordPress to the custom CMS without significant resistance or training burden.

**What If Wrong?**
- Staff may prefer familiar WordPress interface
- Learning curve may be steeper than anticipated
- Staff may have low technology comfort levels
- Adoption may be partial (some staff use new system, others avoid it)

**How to Validate:**
- Phase 1: Share admin UI mockups/prototypes with actual staff for feedback
- Sprint 8.3: Conduct hands-on training session, observe pain points
- Ask: What do they like/dislike about current WordPress?

**Pivot Strategy:**
- If resistance high: Add "WordPress-like" shortcuts or terminology
- If training insufficient: Create video tutorials in Croatian
- If adoption fails: Consider WordPress-compatible API layer (significant work)

---

### 2.3 Current Content Structure Maps Cleanly to New System

**Confidence:** Uncertain

**The Assumption:**
Existing WordPress content can be programmatically migrated with category/structure mapping to the new schema.

**What If Wrong?**
- WordPress content may have inconsistent categorization
- Custom fields or plugins may store data in unpredictable formats
- Historical content may not fit new information architecture
- Embedded media may have broken or hardcoded URLs

**How to Validate:**
- Sprint 4.1: Export WordPress XML, analyze actual content structure
- Sprint 4.2: Create mapping spreadsheet, identify edge cases
- Check: Are there custom post types, ACF fields, or plugin data?

**Pivot Strategy:**
- If structure messy: Plan for manual content review/recategorization
- If data complex: Write custom migration scripts per content type
- If too much work: Migrate only recent content (last 2 years), archive rest

---

### 2.4 60-Day Timeline Is Achievable

**Confidence:** Risky

**The Assumption:**
71 sprints can be completed in 60 days with AI agent assistance and parallel track execution.

**What If Wrong?**
- Unforeseen technical blockers may cause multi-day delays
- Client feedback cycles may extend calendar time
- AI agent development may have variable productivity
- Integration bugs between phases may compound

**How to Validate:**
- Calculate: 71 sprints / 60 days = 1.2 sprints/day average
- Phase 0-2 (30 sprints): Must complete in ~25 days to stay on track
- Weekly: Review velocity, project if timeline is realistic

**Pivot Strategy:**
- If behind: Defer AI features (Phase 6-7) to post-launch enhancement
- If significantly behind: Negotiate scope reduction or deadline extension
- Critical: Never sacrifice quality for speed (showcase project)

---

### 2.5 5,250 Budget Covers All Project Needs

**Confidence:** Likely

**The Assumption:**
Project scope fits within contracted budget with no significant unplanned expenses.

**What If Wrong?**
- Technical pivots may require paid services (Auth0, Algolia, etc.)
- Scope creep from client requests
- Extended timeline increases opportunity cost
- Post-launch support not clearly scoped

**How to Validate:**
- Track: Actual hours vs estimated per phase
- Monitor: Any scope additions from client
- Calculate: If pivot to paid services needed, what's the impact?

**Pivot Strategy:**
- If overrun: Document out-of-scope requests, negotiate change orders
- If paid services needed: Present cost/benefit to client for approval
- Post-launch: Define clear support period in contract

---

### 2.6 Email Migration to Siteground Will Be Straightforward

**Confidence:** Uncertain

**The Assumption:**
Migrating existing municipality email accounts to Siteground hosting will work without disruption.

**What If Wrong?**
- DNS propagation may cause temporary email outages
- Email history migration may fail or be incomplete
- Staff may have email configured on multiple devices
- SPF/DKIM/DMARC configuration may cause deliverability issues

**How to Validate:**
- Before migration: Inventory all email accounts and devices
- Test: Set up test account, verify send/receive from all clients
- Document: Step-by-step reconfiguration guide for each device type

**Pivot Strategy:**
- If problematic: Consider professional email migration service
- If deliverability issues: Engage Siteground support for DNS verification
- If critical: Keep email separate from website timeline

---

## 3. Infrastructure Assumptions

### 3.1 Netcup VPS Has Enough Resources

**Confidence:** Uncertain

**The Assumption:**
VPS 1000 G12 (4 vCPU, 8GB RAM, 256GB NVMe) can run: Next.js admin, PostgreSQL, Ollama embeddings, PM2, all concurrently under normal load.

**What If Wrong?**
- Memory pressure may cause OOM or excessive swapping
- CPU contention during AI operations may slow admin interface
- NVMe may fill with logs, backups, database growth
- Network bandwidth may bottleneck during bulk operations

**How to Validate:**
- Sprint 3.1-3.4: Deploy all services, run synthetic load test
- Monitor: CPU, RAM, disk, network under realistic scenarios
- Calculate: 256GB - OS - PostgreSQL - Logs = available for growth

**Pivot Strategy:**
- If underpowered: Upgrade to VPS 2000 G12 (8 vCPU, 16GB RAM) ~+8/mo
- If disk fills: Archive old backups to R2, add log rotation
- If fundamentally insufficient: Consider dedicated server

---

### 3.2 Cloudflare Free Tier Is Sufficient

**Confidence:** Likely

**The Assumption:**
Cloudflare free tier provides adequate: CDN, WAF, DDoS protection, analytics, and 500 Pages builds/month for this project.

**What If Wrong?**
- 500 builds/month may be exceeded with active content updates
- Free WAF rules may not block all attack patterns
- Analytics may lack detail needed for reporting
- Rate limiting on free tier may be insufficient

**How to Validate:**
- Calculate: Expected publishes/month (news + docs + manual) < 500?
- Review: Cloudflare free tier WAF ruleset, compare to threats
- Test: Analytics data granularity meets dashboard requirements

**Pivot Strategy:**
- If builds exceeded: Batch content updates, reduce rebuild triggers
- If security insufficient: Cloudflare Pro ($20/mo) adds more rules
- If analytics limited: Supplement with Plausible or Simple Analytics

---

### 3.3 R2 Egress-Free Model Will Continue

**Confidence:** Likely

**The Assumption:**
Cloudflare R2's zero egress fee pricing model will remain in effect for the project lifetime.

**What If Wrong?**
- Cloudflare could change pricing (though unlikely near-term)
- If egress fees introduced, cost model changes significantly
- May need to re-evaluate image hosting strategy

**How to Validate:**
- Monitor: Cloudflare pricing announcements
- Read: R2 pricing page terms for any change clauses

**Pivot Strategy:**
- If pricing changes: Evaluate AWS S3 with CloudFront (egress fees apply)
- If costs spike: Implement more aggressive image compression
- Alternative: Cloudflare Images product (paid but predictable)

---

### 3.4 Tailscale for VPS Access Is Reliable

**Confidence:** Likely

**The Assumption:**
Tailscale provides reliable, secure VPN access to VPS for SSH and development without configuration headaches.

**What If Wrong?**
- Tailscale service outage would block deployments
- Free tier device limits may be reached
- Firewall configurations may conflict
- Performance overhead for database connections

**How to Validate:**
- Sprint 3.1: Set up Tailscale, verify reliability over 1 week
- Test: Deploy via Tailscale from multiple networks (home, mobile, etc.)

**Pivot Strategy:**
- If unreliable: Fall back to standard SSH with fail2ban + key-only auth
- If limits hit: Tailscale paid tier ($5/user/mo) or WireGuard manual setup

---

### 3.5 GitHub Actions Has Sufficient CI/CD Capacity

**Confidence:** Likely

**The Assumption:**
GitHub Actions free tier (2000 minutes/month) is sufficient for CI/CD pipeline.

**What If Wrong?**
- Complex builds may use minutes faster than expected
- Multiple PRs per day may exhaust quota
- Build caching may not work effectively

**How to Validate:**
- Sprint 0.5: Measure actual CI time per run
- Calculate: Expected PRs/merges per day x minutes per run

**Pivot Strategy:**
- If exhausted: Optimize build caching, skip redundant checks
- If still insufficient: GitHub Team ($4/user/mo) has 3000 minutes

---

## 4. User Assumptions

### 4.1 Citizens Will Use the Chatbot

**Confidence:** Uncertain

**The Assumption:**
Municipal website visitors will discover and use the AI chatbot for information queries.

**What If Wrong?**
- Users may prefer traditional navigation/search
- Chatbot may not be discoverable (small floating button)
- Trust issues with AI responses for official information
- Users may not understand how to formulate questions

**How to Validate:**
- Post-launch: Track chatbot engagement metrics (opens, messages, completions)
- Survey: Ask users about chatbot awareness and usefulness
- A/B test: Different chatbot placements/prompts

**Pivot Strategy:**
- If unused: Make more prominent, add onboarding tooltip
- If distrusted: Add explicit "Information verified from official sources" messaging
- If fundamentally rejected: De-emphasize, focus on enhanced search

---

### 4.2 Search Will Be Discoverable

**Confidence:** Likely

**The Assumption:**
Users will find and use the Cmd+K/Ctrl+K search shortcut or search icon.

**What If Wrong?**
- Keyboard shortcuts are power-user features; casual users may not know them
- Search icon may be overlooked in header
- Mobile users have no keyboard shortcuts

**How to Validate:**
- Analytics: Track search usage vs total visitors
- Heatmaps: See if users click search elements
- User testing: Watch actual users try to find information

**Pivot Strategy:**
- If undiscovered: Add search to main navigation, not just icon
- If mobile lacking: Add prominent mobile search bar
- If still unused: Surface search suggestions on key pages

---

### 4.3 Mobile Users Are a Significant Audience

**Confidence:** Likely

**The Assumption:**
A significant portion (30-50%+) of visitors will access the site via mobile devices, justifying mobile-first design.

**What If Wrong?**
- Municipal audience may skew older/desktop
- Government business may happen primarily during work hours on desktop
- Resources spent on mobile optimization may be misallocated

**How to Validate:**
- Pre-launch: Get analytics from current WordPress site
- Post-launch: Monitor device breakdown in Cloudflare Analytics

**Pivot Strategy:**
- If desktop dominant: Maintain mobile support but prioritize desktop UX
- If mobile higher than expected: Consider progressive web app features

---

### 4.4 Users Want AI-Generated Content

**Confidence:** Uncertain

**The Assumption:**
Citizens will trust and engage with AI-assisted content as much as human-written content.

**What If Wrong?**
- News of AI content may reduce trust in official communications
- Quality issues may damage municipality reputation
- Legal/compliance concerns about AI-generated official documents

**How to Validate:**
- Research: Any Croatian government guidance on AI in official communications?
- A/B test: Compare engagement on AI-assisted vs human-only content (if ethical)
- Feedback: Solicit citizen feedback post-launch

**Pivot Strategy:**
- If trust issues: Mark AI content clearly, or use AI only for drafts
- If compliance issues: Remove AI content generation entirely
- If quality concerns: Implement stricter human review requirements

---

### 4.5 Newsletter Will Have Meaningful Subscription Rate

**Confidence:** Uncertain

**The Assumption:**
Citizens will subscribe to the weekly newsletter and find it valuable.

**What If Wrong?**
- Email fatigue may lead to low signups
- High unsubscribe rate after first few issues
- Content may not be compelling enough for email

**How to Validate:**
- Post-launch: Track signup rate, open rate, unsubscribe rate
- Baseline: Industry average for government newsletters

**Pivot Strategy:**
- If low signups: More prominent placement, incentivize (exclusive content?)
- If high unsubscribe: Reduce frequency, improve content quality
- If email ineffective: Consider alternative channels (Facebook, Viber groups)

---

## 5. Highest Risk Assumptions

### Top 5 That Could Derail the Project

| Rank | Assumption | Risk | Impact | Validation Priority |
|------|------------|------|--------|---------------------|
| **1** | **60-day timeline is achievable** | High | Project failure, reputation damage | Week 1 - velocity tracking |
| **2** | **Ollama Cloud Croatian quality is production-ready** | High | Unusable AI features, wasted effort | Sprint 0 - sample generation test |
| **3** | **Staff will adopt the new CMS** | Medium-High | Unused system, project failure | Phase 1 - user testing |
| **4** | **VPS has enough resources** | Medium | Performance issues, emergency upgrade | Sprint 3 - load testing |
| **5** | **Client provides timely feedback** | Medium | Timeline slip, blocked phases | Kickoff - SLA agreement |

---

### Validation Plan for Top 5

#### 1. Timeline Achievability

**Validation Actions:**
- Week 1: Complete Phase 0 (6 sprints) - establishes baseline velocity
- Daily: Track sprints completed vs plan
- Weekly: Calculate projected completion date
- Alert threshold: If more than 3 days behind by end of Week 2

**Decision Points:**
- End of Week 2: Can we complete Phases 0-2 by Day 25?
- End of Week 4: Are we on track for Phase 6 start by Day 40?
- Day 45: Go/no-go on full AI features vs reduced scope

---

#### 2. Ollama Cloud Croatian Quality

**Validation Actions:**
- Before Sprint 0: Generate 10 sample municipality announcements
- Native Croatian speaker review with checklist:
  - Grammar correctness (cases, genders)
  - Formal register (Vi form, official tone)
  - No hallucinations about local entities
  - No "AI slop" phrases
- Score: What % usable without editing? With minor edits? Major edits?

**Decision Points:**
- If <30% usable without editing: Consider GPT-4/Claude
- If 30-60% usable: Proceed with strong human review
- If >60% usable: Proceed as planned

---

#### 3. Staff CMS Adoption

**Validation Actions:**
- Sprint 1.3: Demo post creation to 1-2 staff members
- Sprint 1.12: Full hands-on session with all admin users
- Document: Pain points, confusion points, feature requests
- Measure: Time to complete common tasks vs WordPress

**Decision Points:**
- If major resistance: Emergency UX pivot in Phase 5-6 window
- If confusion: Add inline help, tooltips, video guides
- If feature gap: Prioritize missing features

---

#### 4. VPS Resource Sufficiency

**Validation Actions:**
- Sprint 3.4: All services running, baseline resource usage
- Stress test: 10 concurrent admin users, bulk upload, AI generation
- Monitor: Peak CPU, RAM, disk I/O
- Calculate: Headroom for growth

**Decision Points:**
- If RAM >80% baseline: Upgrade before Phase 6
- If CPU >70% sustained: Upgrade before Phase 6
- If disk >60%: Implement aggressive cleanup, plan upgrade

---

#### 5. Client Feedback Timeliness

**Validation Actions:**
- Kickoff meeting: Establish written SLA (48-hour feedback window)
- Identify primary contact with decision authority
- Set up: Slack/Teams channel for quick questions
- Weekly: Scheduled review meeting (30 min)

**Decision Points:**
- If SLA missed twice: Escalate to project sponsor
- If chronic delays: Adjust timeline, document reasons
- If blocking: Proceed with documented assumptions

---

## 6. Recommendations

### Validate in Sprint 0 (First Week)

| Item | How to Validate | Success Criteria |
|------|-----------------|------------------|
| Ollama Croatian quality | Generate 10 samples, native review | >50% usable with minor edits |
| Next.js static export | Build with 5 dynamic routes | `next build` succeeds, all routes render |
| Better Auth multi-method | Implement all 4 auth methods | Login works with each method |
| Monorepo builds | Full turborepo setup | `pnpm build` succeeds for all packages |
| CI/CD pipeline | GitHub Actions workflow | PR triggers all checks, merge deploys |

### Prototype Early (Sprints 1-2)

| Feature | Why Prototype | Risk Mitigated |
|---------|---------------|----------------|
| TipTap editor with images | Content creation is core workflow | Editor unusable for staff |
| R2 image upload pipeline | Critical path for all visual content | Upload failures, slow processing |
| Admin UI layout | Staff interaction surface | Poor adoption, usability issues |
| Basic search (FTS only) | Core user need, complex integration | Search quality, performance |

### Decision Points to Revisit

| When | Decision | Based On |
|------|----------|----------|
| End of Sprint 0.3 | Better Auth vs alternative | Auth implementation difficulty |
| End of Phase 1 | Proceed with AI vs defer | Croatian quality validation |
| End of Phase 2 | Static export vs ISR | Build times, dynamic needs |
| End of Phase 3 | VPS tier decision | Resource monitoring data |
| Day 45 | Full scope vs reduced launch | Timeline progress |
| Day 55 | Launch date firm vs slip | Final testing, client sign-off |

---

## 7. Assumption Tracking Template

Use this format to track assumption status throughout the project:

```markdown
### [Assumption ID]: [Short Name]
- **Original Confidence:** [Validated/Likely/Uncertain/Risky]
- **Current Status:** [Confirmed/Still Uncertain/Invalidated]
- **Validation Date:** YYYY-MM-DD
- **Validation Method:** [How it was tested]
- **Result:** [What was found]
- **Action Taken:** [If any pivot needed]
```

---

## Document History

| Date | Changes |
|------|---------|
| 2026-01-23 | Initial assumption audit created |

---

## Summary

This project carries **moderate-to-high risk** primarily in three areas:

1. **Timeline pressure** - 71 sprints in 60 days is aggressive
2. **Novel technology combinations** - Better Auth + Ollama + pgvector together is untested
3. **Client/user adoption** - New CMS and AI features require behavior change

**Key insight:** The AI features (Phases 6-7) are correctly placed last in the roadmap. If timeline pressure mounts, these are the natural candidates for post-launch enhancement rather than launch blockers.

**Most critical early validation:** Croatian LLM output quality should be validated before Sprint 0 starts. If this assumption fails, the entire AI content generation feature needs redesign or replacement with a more expensive provider.
