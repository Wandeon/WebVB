# PROJECT-GOVERNANCE.md - How We Run This Project

> Professional project governance for Veliki Bukovec website.
> Defines communication, approvals, changes, and boundaries.
> Last updated: 2026-01-23

---

## Project Overview

| Item | Value |
|------|-------|
| **Client** | Općina Veliki Bukovec |
| **Project** | Municipality website redesign + migration |
| **Contract Value** | €5,250 (incl. PDV) |
| **Timeline** | 60 days from contract signing |
| **Developer** | [Your name] |

---

## Communication

### Regular Updates

| Type | Frequency | Format | Purpose |
|------|-----------|--------|---------|
| Status Update | Weekly (Friday) | Email | Progress summary, blockers, next week plan |
| Demo Call | End of each phase | Video call | Show working software, get feedback |
| Ad-hoc | As needed | Email/Message | Questions requiring input |

### Status Update Template

```
SUBJECT: Veliki Bukovec - Tjedni status [Date]

OVAJ TJEDAN:
- ✅ Completed: [list]
- 🔄 In progress: [list]

SLJEDEĆI TJEDAN:
- Planned: [list]

POTREBNO OD VAS:
- [Any decisions/content/feedback needed]

TIMELINE STATUS: ✅ On track / ⚠️ At risk / ❌ Delayed
```

### Response Expectations

| From | Expected Response Time |
|------|------------------------|
| Developer → Client questions | Within 24 hours |
| Client → Developer questions | Within 48 hours (business days) |
| Urgent (blocking work) | Same day if possible |

---

## Approval Checkpoints

Work doesn't proceed to the next phase without approval.

| Checkpoint | When | What Client Approves | Format |
|------------|------|---------------------|--------|
| **Design Approval** | End of Phase 1 | Admin panel look & feel | Demo call + written OK |
| **Public Site Approval** | End of Phase 2 | Homepage + key pages | Demo call + written OK |
| **Content Migration** | End of Phase 4 | Migrated content is correct | Client reviews staging |
| **Pre-Launch** | Phase 8 | Everything ready to go live | Written sign-off |
| **Launch** | Phase 8 | DNS switch authorized | Written GO command |

### Approval Process

```
1. Developer sends: "Ready for review: [feature/phase]"
2. Developer provides: Staging URL or demo call
3. Client reviews within: 3 business days
4. Client responds:
   - "Approved" (work continues)
   - "Changes needed: [specific list]" (one revision round included)
5. Major changes beyond scope → Change Request process
```

---

## Scope & Change Control

### What's In Scope

Everything documented in:
- `FEATURES.md` - All features listed
- `ROADMAP.md` - All sprints defined
- `DATABASE.md` - All data structures

### What's Out of Scope

- Features not in documentation
- Additional languages (site is Croatian only)
- Native mobile apps
- Integrations not specified
- Ongoing content creation

### Change Request Process

For requests outside original scope:

```
1. Client requests: "Can we also add X?"

2. Developer evaluates:
   - Is it in scope? → Yes: Do it
   - Is it out of scope? → Change Request

3. Change Request includes:
   - Description of change
   - Impact on timeline (+ X days)
   - Impact on cost (+ €X) or "included as goodwill"

4. Client approves in writing before work begins

5. Document in DECISIONS.md under "Scope Changes"
```

### "Goodwill" Budget

Small requests that take < 2 hours: included at developer's discretion.
Tracked but not charged. Limited to ~10 hours total for project.

---

## Timeline Management

### Key Dates

| Milestone | Target Date | Buffer |
|-----------|-------------|--------|
| Phase 0-1 Complete | Day 20 | Internal target: Day 15 |
| Phase 2 Complete | Day 35 | Internal target: Day 28 |
| Phase 3-5 Complete | Day 50 | Internal target: Day 42 |
| Phase 6-7 Complete | Day 58 | Internal target: Day 52 |
| Launch | Day 60 | Buffer: 8 days |

### If Timeline Slips

```
Scenario 1: Minor delay (< 5 days)
→ Absorb with buffer
→ Inform client

Scenario 2: Major delay (5-15 days)
→ Options meeting with client:
  A) Extend deadline
  B) Reduce scope (defer AI features)
  C) Add resources (unlikely for solo dev)

Scenario 3: Client-caused delay (slow feedback, late content)
→ Document delay
→ Timeline extends by equivalent time
→ Not developer's responsibility
```

### AI Features as Safety Valve

Phases 6-7 (AI content generation, chatbot) are positioned last intentionally.

If timeline pressure mounts:
- Core site launches without AI
- AI features delivered as Phase 2 post-launch
- No reduction in site functionality (AI is enhancement)

---

## Staging & Preview

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | localhost:3000/3001 | Developer testing |
| Staging (Public) | vb-staging.pages.dev | Client preview |
| Staging (Admin) | 100.x.x.x:3001 (Tailscale) | Admin preview |
| Production | velikibukovec.hr | Live site (after launch) |

### Client Access

- Staging URL shared after Phase 1
- Client can preview anytime
- Feedback via email or scheduled call
- Staging may have test data / incomplete features

---

## Payments

### Development Payment (€5,250 total)

6 equal monthly payments:

| Payment | Amount | Trigger |
|---------|--------|---------|
| Month 1 | €875 | Order confirmation |
| Month 2 | €875 | 30 days after start |
| Month 3 | €875 | 60 days after start |
| Month 4 | €875 | 90 days after start |
| Month 5 | €875 | 120 days after start |
| Month 6 | €875 | 150 days after start |

### Post-Launch Support & Hosting

| Period | Monthly Fee | Includes |
|--------|-------------|----------|
| Months 1-12 (after launch) | €0 | Included in project price |
| Month 13+ | €60/month | LLM hosting, VPS, support, maintenance |

### What's Included in €60/month (after month 12)

- VPS hosting (Netcup)
- Ollama Cloud LLM costs
- Bug fixes and minor updates
- Security patches
- Backup monitoring
- Email support (response within 48h)

### Not Included in Monthly Fee

- New features → Quoted separately
- Major redesigns → Quoted separately
- Training new staff → €50/hour

---

## Deliverables & Handoff

### What Client Receives

| Deliverable | Format | When |
|-------------|--------|------|
| Live website | velikibukovec.hr | Launch |
| Admin panel access | Credentials | Launch |
| Source code | GitHub repository | Launch |
| Documentation | Admin user guide | Launch |
| Training | 1-hour recorded session | Pre-launch |

### Knowledge Transfer

```
1. Admin User Guide (written)
   - How to create/edit posts
   - How to upload documents
   - How to manage gallery
   - How to use AI generation (if included)

2. Training Session (recorded)
   - Live walkthrough of admin
   - Q&A
   - Recording provided for future staff

3. Technical Documentation (for future developers)
   - All docs in /docs folder
   - README with setup instructions
   - Environment variables template
```

---

## Post-Launch Support

### First 12 Months (Included in Project Price)

| Coverage | Details |
|----------|---------|
| Bug fixes | Errors, broken features |
| Security patches | Critical updates |
| Minor adjustments | Small tweaks, text changes |
| Email support | Response within 48 hours |
| Hosting | VPS + LLM costs covered |

### After Month 12 (€60/month subscription)

Subscription includes everything above, plus:
- Ongoing LLM/AI hosting costs
- VPS maintenance
- Backup monitoring
- Priority support

### Not Included (Any Time)

| Service | Rate |
|---------|------|
| New features | Quoted per feature |
| Major redesigns | Quoted separately |
| Training new staff | €50/hour |
| Emergency same-day support | €75/hour |

### Support Process

```
1. Client reports issue via email
2. Developer acknowledges within 24-48 hours
3. If included in support: Fixed
4. If not included: Estimate provided, client approves
5. Work completed
6. Invoice sent (if applicable)
```

---

## Risk Management

### Identified Risks (from audits)

| Risk | Mitigation | Owner |
|------|------------|-------|
| Timeline pressure | Buffer built in, AI features deferrable | Developer |
| Client feedback delays | Clear response expectations, timeline adjusts | Shared |
| Content migration issues | Test migration first, client reviews | Shared |
| Technical blockers | Documented fallbacks, early validation | Developer |

### Escalation Path

```
Level 1: Email discussion
Level 2: Phone/video call
Level 3: In-person meeting (if timeline/scope at risk)
```

---

## Documentation

### Project Documents (in repository)

| Document | Purpose |
|----------|---------|
| DECISIONS.md | Master index, key decisions |
| ROADMAP.md | Sprint-ready task list |
| HUMAN-TODO.md | Client action items |
| PROJECT-GOVERNANCE.md | This document |
| /docs/* | Technical specifications |
| /docs/audits/* | Risk analysis |

### Decision Log

Major decisions recorded in DECISIONS.md with:
- Date
- Decision made
- Rationale
- Who approved

---

## Signatures

This governance document establishes how we work together.

```
Developer: _________________________ Date: _________

Client:    _________________________ Date: _________
```

---

## Amendments

Any changes to this governance:
1. Discussed and agreed by both parties
2. Documented in writing
3. Added to "Change Log" below

### Change Log

| Date | Change | Agreed By |
|------|--------|-----------|
| 2026-01-23 | Initial governance created | - |

