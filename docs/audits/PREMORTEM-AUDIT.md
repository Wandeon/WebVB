# PREMORTEM-AUDIT.md - Project Failure Analysis

> **Date:** 2026-01-23
> **Auditor:** Pre-mortem analysis
> **Project:** Veliki Bukovec Municipality Website
> **Contract Value:** EUR 5,250
> **Deadline:** 60 days from contract signing
> **Status:** Not Started (0/71 sprints complete)

---

## Executive Summary

This pre-mortem analysis imagines it is July 2026. The Veliki Bukovec website project has **failed**. Working backwards, this document identifies what went wrong, when warning signs appeared, and what could have been done to prevent failure.

The project faces significant risks across five domains:
1. **Timeline pressure** - 71 sprints in 60 days is aggressive
2. **External dependencies** - Multiple third-party services and human tasks
3. **Technical complexity** - AI features, custom CMS, static export architecture
4. **Client relationship** - Municipality staff adoption and training
5. **Single points of failure** - One developer, one VPS, one domain

---

## Failure Scenarios

### Scenario 1: Deadline Overrun

**What went wrong:**
The 60-day deadline was missed by 3+ weeks. The 71 sprints, even with parallel execution, could not be completed in time. AI features (Phases 6-7) consumed more time than estimated. Client UAT revealed issues requiring rework. The municipality had announced the launch date publicly, causing embarrassment.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **HIGH** |
| Impact | **HIGH** |

**Warning signs:**
- Sprint completion rate below 1.5 per day
- Phase 0-1 taking more than 15 days
- AI rate limiting causing multi-day delays
- Client feedback requiring major rework

**Mitigation strategies:**
- Define hard cutoff: launch without AI features if behind schedule
- Build 20% buffer into all estimates
- Weekly progress reports to client with realistic projections
- Negotiate deadline flexibility upfront (get it in writing)
- Prioritize core CMS over AI chatbot

---

### Scenario 2: VPS Security Breach (Crypto Miner)

**What went wrong:**
Despite documented security procedures, a service was accidentally exposed to the public internet. Within 48 hours, the VPS was compromised and running cryptocurrency mining software. The database was accessed, and the admin panel was defaced. The incident required complete VPS rebuild and 5 days of downtime.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **MEDIUM** |
| Impact | **CRITICAL** |

**Warning signs:**
- VPS CPU usage unexpectedly high
- SSH login from unknown Tailscale device
- Database connections from unexpected IPs
- Services binding to 0.0.0.0 in deployment logs

**Mitigation strategies:**
- Automated security scan in CI/CD before every deploy
- UFW rules version-controlled and auto-applied
- Weekly manual audit of `netstat -tlnp` output
- Separate staging VPS for testing (never test security config on prod)
- Immediate alerting on any service binding change

---

### Scenario 3: Ollama Cloud Service Unreliability

**What went wrong:**
Ollama Cloud experienced frequent rate limiting and occasional multi-hour outages. The AI content generation feature became frustrating to use, with staff abandoning it after the third failed attempt. The chatbot was permanently disabled after answering questions with "I'm unable to process your request."

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **HIGH** |
| Impact | **MEDIUM** |

**Warning signs:**
- Rate limit errors exceeding 10% of requests
- API response times over 30 seconds
- Ollama Cloud status page showing incidents
- Staff complaints about "AI never works"

**Mitigation strategies:**
- Implement robust queue system with 24-hour retry window
- Cache successful generations for similar prompts
- Build graceful degradation: AI features optional, not blocking
- Have backup LLM provider identified (e.g., Anthropic, OpenAI)
- Monitor Ollama Cloud reliability for 2 weeks before committing

---

### Scenario 4: Content Migration Data Loss

**What went wrong:**
During WordPress migration, 15% of documents were not properly mapped. PDF files from 2019-2021 were missing. Image URLs in migrated posts pointed to the old WordPress site, which was eventually taken down. The municipality discovered missing council meeting minutes 3 months after launch.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **MEDIUM** |
| Impact | **HIGH** |

**Warning signs:**
- Content inventory spreadsheet incomplete
- Migration script errors ignored during test runs
- No diff report comparing old vs new content counts
- Client not involved in migration verification

**Mitigation strategies:**
- Create exhaustive content inventory BEFORE migration
- Automated comparison: count posts, docs, images pre/post
- Client sign-off on migrated content before DNS switch
- Keep WordPress site accessible for 6 months post-launch
- Test all internal links after migration

---

### Scenario 5: Static Export Build Failures

**What went wrong:**
The Next.js 16 static export worked locally but failed intermittently on Cloudflare Pages. Dynamic routes with Croatian characters caused encoding issues. Build times grew to 15+ minutes as content increased. Eventually, the public site became stale because staff stopped triggering rebuilds.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **MEDIUM** |
| Impact | **HIGH** |

**Warning signs:**
- Build failures in Cloudflare Pages logs
- Console errors about generateStaticParams
- Croatian characters appearing as "?" in URLs
- Staff reporting "website not updating"

**Mitigation strategies:**
- Comprehensive E2E tests for static export paths
- Test with 500+ posts locally before production
- Monitor build success rate (alert on any failure)
- Implement automatic rebuild retry on failure
- Document build process for staff troubleshooting

---

### Scenario 6: Municipality Staff Rejection

**What went wrong:**
After launch, staff found the custom CMS "too different" from WordPress. The mayor requested "just make it look like WordPress." Staff reverted to posting announcements only on Facebook, making the website stale. The contract was fulfilled but the project was considered a failure by the client.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **MEDIUM** |
| Impact | **CRITICAL** |

**Warning signs:**
- Staff not engaging during UAT phase
- Questions like "where is the WordPress dashboard?"
- Low login frequency after launch
- Facebook posts without corresponding website updates

**Mitigation strategies:**
- Involve staff in design phase (show mockups EARLY)
- Side-by-side comparison: "WordPress vs New" training doc
- Schedule 2+ training sessions, not just one
- First 30 days: daily check-ins on usage
- Quick wins: make common tasks FASTER than WordPress

---

### Scenario 7: Better Auth Configuration Disaster

**What went wrong:**
A session token misconfiguration caused all users to be logged out every 15 minutes. The password reset flow silently failed due to SMTP configuration issues. When the mayor forgot his password, he couldn't reset it, and the Super Admin was on vacation. The site had to be taken offline.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **LOW** |
| Impact | **CRITICAL** |

**Warning signs:**
- User complaints about frequent logouts
- Password reset emails not arriving
- Session duration not matching configuration
- Better Auth error logs ignored

**Mitigation strategies:**
- Full auth flow E2E test in CI (login, reset, 2FA, sessions)
- Test password reset with real email every deploy
- Emergency access procedure documented
- Multiple Super Admin accounts (never single point of failure)
- Better Auth configuration version-controlled with comments

---

### Scenario 8: Cloudflare R2 Cost Surprise

**What went wrong:**
Image storage grew faster than expected. The gallery feature was heavily used, and each album contained 50+ images in multiple resolutions. Monthly R2 costs hit EUR 100+, exceeding the entire hosting budget. The client was not warned about variable costs.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **LOW** |
| Impact | **MEDIUM** |

**Warning signs:**
- R2 storage growing faster than 10GB/month
- Gallery usage higher than projected
- No image count limits implemented
- No monthly cost monitoring alerts

**Mitigation strategies:**
- Implement image quota per album (e.g., 50 images)
- Monthly R2 cost monitoring with alert thresholds
- Client agreement on cost escalation procedure
- Aggressive image compression (quality 70 instead of 85)
- Archive old gallery images to cheaper storage tier

---

### Scenario 9: Facebook API Token Expiration

**What went wrong:**
The Facebook Page Access Token expired after 60 days. Nobody noticed for 2 weeks until staff complained that Facebook posts weren't working. The token refresh required manual intervention through the Facebook Developer Console, which nobody had access to.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **HIGH** |
| Impact | **LOW** |

**Warning signs:**
- Facebook posts silently failing
- No error notifications to admin
- Token expiration date not tracked
- Facebook API returning 401 errors in logs

**Mitigation strategies:**
- Implement token expiration monitoring (alert 7 days before)
- Document token refresh procedure step-by-step
- Use long-lived token (60 days) with calendar reminder
- Facebook posting failure should notify admin in UI
- Consider removing Facebook posting if maintenance burden too high

---

### Scenario 10: DNS Switch Catastrophe

**What went wrong:**
On launch day, the DNS was switched but propagation took 48 hours instead of the expected 4 hours. During this time, some users saw the old site, some saw the new site, and some saw nothing. Contact form submissions were lost. The mayor received complaints from citizens.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **LOW** |
| Impact | **HIGH** |

**Warning signs:**
- TTL not lowered in advance
- No DNS propagation monitoring
- Old site not configured for graceful handoff
- Contact form on both sites without coordination

**Mitigation strategies:**
- Lower TTL to 300 seconds 1 week before switch
- Monitor propagation with multiple global DNS checkers
- Old site shows "We're moving!" banner during transition
- Both sites forward contact forms to same inbox
- Launch during weekend/low-traffic period

---

### Scenario 11: Embedding Pipeline Failure

**What went wrong:**
The local Ollama embedding model (nomic-embed-text) ran out of VPS memory when processing large PDF documents. The embedding queue backed up with 500+ documents. The chatbot returned "no relevant information found" for basic questions because the knowledge base was incomplete.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **MEDIUM** |
| Impact | **MEDIUM** |

**Warning signs:**
- VPS memory usage consistently above 80%
- Embedding queue growing instead of shrinking
- Chatbot accuracy declining
- OOM (Out of Memory) errors in logs

**Mitigation strategies:**
- Implement PDF size limits (max 10MB, max 50 pages)
- Process embeddings in off-peak hours only
- Monitor embedding queue depth with alerts
- VPS memory monitoring with 70% threshold alert
- Fallback: skip embeddings for large docs, index metadata only

---

### Scenario 12: GDPR/Legal Compliance Failure

**What went wrong:**
The Privacy Policy was copy-pasted from another site and mentioned services not used. The newsletter did not have proper double opt-in. A citizen filed a GDPR complaint. The municipality faced legal scrutiny and had to hire a lawyer.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **MEDIUM** |
| Impact | **HIGH** |

**Warning signs:**
- Legal documents not reviewed by lawyer
- Cookie consent not properly implemented
- Newsletter sign-ups without confirmation email
- No data deletion process documented

**Mitigation strategies:**
- Client must provide/approve all legal text (in writing)
- Verify double opt-in works before launch
- Implement data export/deletion in admin
- Test GDPR data request flow end-to-end
- Document data retention policies

---

### Scenario 13: Human Task Dependencies Not Completed

**What went wrong:**
The human tasks in HUMAN-TODO.md were not completed on time. Cloudflare was not set up until week 3. Google OAuth credentials were missing until week 4. VPS was ordered but not configured. Sprint 0 took 3 weeks instead of 1 week.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **HIGH** |
| Impact | **HIGH** |

**Warning signs:**
- HUMAN-TODO.md tasks not checked off
- Development blocked waiting for credentials
- Client not responding to credential requests
- Sprint 0 dependencies missing

**Mitigation strategies:**
- Send HUMAN-TODO.md to client on day 1
- Set hard deadline: "Credentials needed by Date X or project delayed"
- Create placeholder/mock services for development
- Daily check-in on human task progress for first 2 weeks
- Escalation path if client unresponsive

---

### Scenario 14: Single Developer Unavailability

**What went wrong:**
The sole developer became ill for 2 weeks during Phase 3. There was no handoff documentation. The project fell behind, and the deadline was missed. The client had no technical contact during this period.

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **LOW** |
| Impact | **CRITICAL** |

**Warning signs:**
- No documentation of development environment setup
- No access to credentials for backup person
- Client expectations not managed for this risk
- No communication plan for developer absence

**Mitigation strategies:**
- Document everything in CLAUDE.md and other docs
- Share credential access with trusted backup person
- Client notified upfront that delays possible (contract clause)
- Code commits daily (never more than 1 day of un-pushed work)
- Weekly status updates even when healthy (audit trail)

---

### Scenario 15: Performance Degradation Over Time

**What went wrong:**
Six months after launch, the website became slow. Lighthouse scores dropped from 90 to 55. Database queries that were fast with 100 posts became slow with 1000 posts. The municipality complained that "the new site is slower than WordPress."

| Attribute | Assessment |
|-----------|------------|
| Likelihood | **MEDIUM** |
| Impact | **MEDIUM** |

**Warning signs:**
- Lighthouse scores declining
- Database query times increasing
- Static build times increasing
- User complaints about loading times

**Mitigation strategies:**
- Implement database query monitoring (pg_stat_statements)
- Quarterly performance audit (Lighthouse, Web Vitals)
- Add database indexes based on actual query patterns
- Implement pagination/lazy loading for large lists
- Archive old content to reduce active dataset

---

## Risk Matrix

```
                    IMPACT
                    Low        Medium      High        Critical
              +----------+----------+----------+----------+
              |          |          |          |          |
    High      |  F9      |  F3      | F1, F13  |  F6      |
              |          |          |          |          |
              +----------+----------+----------+----------+
              |          |          |          |          |
    Medium    |          | F8, F11  | F4, F5,  |  F2      |
 LIKELIHOOD   |          |  F15     |  F12     |          |
              +----------+----------+----------+----------+
              |          |          |          |          |
    Low       |          |          |  F10     | F7, F14  |
              |          |          |          |          |
              +----------+----------+----------+----------+

F1  = Deadline Overrun
F2  = VPS Security Breach
F3  = Ollama Cloud Unreliability
F4  = Content Migration Data Loss
F5  = Static Export Build Failures
F6  = Municipality Staff Rejection
F7  = Better Auth Configuration Disaster
F8  = Cloudflare R2 Cost Surprise
F9  = Facebook API Token Expiration
F10 = DNS Switch Catastrophe
F11 = Embedding Pipeline Failure
F12 = GDPR/Legal Compliance Failure
F13 = Human Task Dependencies Not Completed
F14 = Single Developer Unavailability
F15 = Performance Degradation Over Time
```

---

## Top 5 Risks Requiring Immediate Attention

### 1. Human Task Dependencies Not Completed (F13)

**Why this is #1:** Development cannot start without credentials. This is the most likely failure point in the first 2 weeks.

**Immediate actions:**
- [ ] Send HUMAN-TODO.md to client TODAY
- [ ] Set deadline: All Week 1 tasks done within 5 business days
- [ ] Schedule daily 15-minute check-in calls for first week
- [ ] Create local development mocks for all external services
- [ ] Escalation: If Day 5 passes without credentials, formal written notice

---

### 2. Deadline Overrun (F1)

**Why this is #2:** 71 sprints in 60 days is extremely aggressive. Even small delays compound.

**Immediate actions:**
- [ ] Define "Minimum Viable Launch" scope (Phases 0-5 only)
- [ ] AI features (Phases 6-7) officially designated as "Phase 2" post-launch
- [ ] Negotiate with client: AI chatbot is enhancement, not core deliverable
- [ ] Build in weekly milestones with go/no-go decisions
- [ ] If behind by Day 30, trigger formal scope reduction conversation

---

### 3. Municipality Staff Rejection (F6)

**Why this is #3:** Technical success means nothing if users don't adopt the system.

**Immediate actions:**
- [ ] Schedule UX review session with staff BEFORE building admin UI
- [ ] Create clickable prototype/mockup for approval before coding
- [ ] Identify 1-2 "champion" staff members for early testing
- [ ] Plan 3 training sessions, not just 1
- [ ] Get written sign-off on admin panel design before Phase 1 completes

---

### 4. VPS Security Breach (F2)

**Why this is #4:** Previous projects were compromised. This would be devastating for a government website.

**Immediate actions:**
- [ ] Create security checklist CI job (runs on every deploy)
- [ ] Automate `netstat -tlnp` verification in deployment
- [ ] Set up immediate alerts for any 0.0.0.0 binding
- [ ] Document and test VPS rebuild procedure (can recover in <4 hours?)
- [ ] Consider managed database service to reduce attack surface

---

### 5. Content Migration Data Loss (F4)

**Why this is #5:** Losing municipal documents would be a legal and reputational disaster.

**Immediate actions:**
- [ ] Request WordPress export immediately (don't wait for Phase 4)
- [ ] Create content inventory spreadsheet this week
- [ ] Verify backup of all current WordPress content exists
- [ ] Plan for 6-month parallel operation of old site
- [ ] Migration script must produce comparison report (old count vs new count)

---

## Recommendations: What To Do NOW

### Week 1 Actions

1. **Send HUMAN-TODO.md to client** with hard deadlines
2. **Negotiate scope flexibility** - Get written agreement that AI features can slip
3. **Schedule staff UX session** - Before writing any admin UI code
4. **Create security CI checklist** - Automated security verification
5. **Request WordPress backup** - Full export before any other work

### Process Changes

1. **Weekly client check-in** - Every Friday, 30-minute status call
2. **Sprint velocity tracking** - If completing <1 sprint/day, trigger alert
3. **Daily git commits** - Never more than 1 day of uncommitted work
4. **Credential escrow** - Backup person has read access to all credentials
5. **Rollback procedures** - Document and test before going live

### Technical Safeguards

1. **Security-first CI** - Block any deploy with security violations
2. **Build monitoring** - Alert on any Cloudflare Pages build failure
3. **Cost monitoring** - Weekly R2/Ollama cost review
4. **Performance baseline** - Record Lighthouse scores before launch
5. **Backup verification** - Monthly restore test of database backup

### Contractual Protections

1. **Scope change process** - Written approval for any additions
2. **Delay notification** - 5-day advance notice requirement
3. **AI features carve-out** - Explicitly listed as optional/Phase 2
4. **Client credential responsibility** - Delays due to missing credentials = timeline extension
5. **Post-launch support period** - Define what's included in EUR 5,250

---

## Monitoring Dashboard (Post-Launch)

Set up alerts for these metrics:

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Build success rate | <95% | <80% |
| Admin login errors | >5/day | >20/day |
| R2 storage | >50GB | >100GB |
| R2 monthly cost | >EUR 30 | >EUR 50 |
| VPS CPU usage | >70% sustained | >90% sustained |
| VPS memory usage | >70% | >85% |
| Ollama API errors | >10% | >25% |
| Public site uptime | <99.5% | <99% |
| Admin panel uptime | <99% | <98% |
| Lighthouse score | <85 | <70 |

---

## Conclusion

This project is achievable but carries significant risk. The combination of aggressive timeline, multiple external dependencies, AI complexity, and client adoption challenges creates numerous failure paths.

The most likely failure mode is **death by a thousand cuts**: small delays accumulate, human tasks block technical work, staff don't engage until too late, and the deadline slips from 60 days to 90+ days.

**Success requires:**
1. Ruthless scope management - AI features must be negotiable
2. Client engagement from day 1 - Not just at the end
3. Security automation - Human vigilance is insufficient
4. Constant communication - Problems discovered early are solvable

**If only one thing changes:** Get written agreement that AI features (Phases 6-7) are "Phase 2" enhancements, not launch requirements. This single change transforms the project from high-risk to manageable.

---

## Document History

| Date | Changes |
|------|---------|
| 2026-01-23 | Initial pre-mortem audit created |
