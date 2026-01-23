# HUMAN-TODO.md - Tasks Requiring Human Action

> Things YOU (the human) need to do that Claude cannot do for you.
> Organized by WHEN to do them and WHAT they block.
> Last updated: 2026-01-23

---

## 🚨 DO THIS WEEK (Before Sprint 0.1)

These tasks block early sprints. Do them NOW to avoid delays.

### 1. Cloudflare Setup (blocks Sprint 1.5, 3.5, 3.6)

```
□ Create Cloudflare account (free)
□ Add velikibukovec.hr as site
   ⚠️ DO NOT change nameservers yet - just add the site
□ Get Zone ID (from domain overview page)
□ Create API Token:
   → Account Settings → API Tokens → Create Token
   → Use "Edit zone DNS" template
   → Save token securely
□ Enable R2:
   → R2 → Create bucket → Name: "velikibukovec-media"
   → Get Account ID (R2 overview page)
   → Manage R2 API Tokens → Create token
   → Save Access Key ID + Secret Access Key
```

**Time:** ~30 minutes
**Credentials you'll have:**
- Cloudflare Zone ID
- Cloudflare API Token
- R2 Account ID
- R2 Access Key ID
- R2 Secret Access Key

### 2. Google Cloud Setup (blocks Sprint 0.3)

```
□ Go to console.cloud.google.com
□ Create new project: "Veliki Bukovec"
□ Enable APIs:
   → APIs & Services → Enable APIs
   → Search for "Custom Search API" → Enable
□ Create OAuth credentials (for admin login):
   → APIs & Services → Credentials → Create Credentials → OAuth client ID
   → Application type: Web application
   → Authorized redirect URIs:
     - http://localhost:3001/api/auth/callback/google (dev)
     - https://admin.velikibukovec.hr/api/auth/callback/google (prod)
   → Save Client ID + Client Secret
□ Create Search API key:
   → Credentials → Create Credentials → API Key
   → Restrict to Custom Search API
□ Create Custom Search Engine:
   → programmablesearchengine.google.com
   → Sites to search: velikibukovec.hr
   → Get Search Engine ID (cx)
```

**Time:** ~20 minutes
**Credentials you'll have:**
- Google OAuth Client ID
- Google OAuth Client Secret
- Google Search API Key
- Google Custom Search Engine ID (cx)

### 3. Order VPS (blocks Sprint 3.1)

```
□ Go to netcup.de
□ Order: RS 1000 G11 (or similar)
   → ~€8/month
   → Location: Germany (EU)
   → OS: Ubuntu 24.04 LTS
□ Wait for provisioning email (usually same day)
□ Note down:
   → IP address
   → Root password
□ DO NOT configure yet - we'll do it together in Sprint 3.1
```

**Time:** ~10 minutes to order, hours to provision

### 4. Gather Design Assets (blocks Sprint 2.1, 2.2)

```
□ Logo files:
   → SVG format (vector, preferred)
   → PNG with transparent background (fallback)
   → Both dark and light versions if available

□ Favicon source:
   → 512x512 PNG minimum (we'll generate all sizes)
   → Or SVG

□ Municipality crest/coat of arms:
   → High resolution for hero sections
   → Vector if possible

□ Homepage hero images (5-10):
   → Photos of Veliki Bukovec, Dubovica, Kapela Podravska
   → Landscape orientation, high quality
   → At least 1920px wide

□ Landmark photos (for static pages):
   → Crkva sv. Franje Asiškog
   → Dvorac Drašković
   → Other landmarks from menu
```

**Time:** Varies (may need to take/find photos)

---

## 📋 DO WITHIN 2 WEEKS (Before Phase 1 completes)

### 5. WordPress Export (blocks Phase 4)

```
□ Login to WordPress admin
□ Tools → Export → All content → Download XML
□ Download media library:
   → Option A: FTP into wp-content/uploads, download all
   → Option B: Install "Export Media Library" plugin
□ Save both locally:
   → wordpress-export.xml
   → uploads/ folder with all media

□ Create content inventory spreadsheet:
   | Title | Type | URL | Category | Keep? | Notes |
   |-------|------|-----|----------|-------|-------|
   | ...   | Post | ... | Sport    | Yes   |       |
```

**Why now?** You can review content while I build the admin panel.

**Time:** ~30-60 minutes

### 6. User List (blocks Sprint 1.11)

```
□ Fill out this table:

| Name | Email | Role | 2FA? |
|------|-------|------|------|
| [You] | your@email.com | Super Admin | Required |
| Načelnik | ? | Admin | Recommended |
| Staff 1 | ? | Staff | Optional |
| Staff 2 | ? | Staff | Optional |

Roles:
- Super Admin: Full access (you, developer)
- Admin: Can delete content, manage staff (načelnik)
- Staff: Can create/edit, cannot delete
```

**Time:** ~10 minutes (may need to ask client)

### 7. Legal Text Drafts (blocks Sprint 2.9)

```
□ Privacy Policy (Politika privatnosti)
   → What data you collect
   → How you use it
   → GDPR rights
   → Contact for data requests

□ Cookie Consent text
   → What cookies are used
   → Accept/Reject options

□ Contact Form consent checkbox:
   → "Slažem se s obradom osobnih podataka..."

□ Newsletter consent checkbox:
   → "Želim primati obavijesti..."

□ Impressum (legal info page):
   → Full legal name of municipality
   → Address, OIB, contact
```

**Tip:** Look at similar Croatian municipality sites (e.g., opcina-cestica.hr)

**Time:** 1-2 hours

### 8. Confirm Access Credentials

```
□ WordPress admin login (for migration)
□ Current hosting control panel (for reference)
□ Domain registrar login (for DNS later - NOT NOW)
□ Siteground access (for email migration)
□ Facebook page admin access (for posting feature)
```

---

## 📅 DO BEFORE PHASE 6 (AI Features)

### 9. Ollama Cloud Account

```
□ Create account at ollama.ai (or current provider)
□ Choose plan:
   → Pro (~€10-20/mo) - for moderate usage
   → Max (~€30/mo) - if heavy generation expected
□ Get API key
□ Note rate limits for your plan
```

### 10. Facebook Developer Setup

```
□ Go to developers.facebook.com
□ Create app (type: Business)
□ Add Facebook Login product
□ Add Pages API product
□ Get:
   → App ID
   → App Secret
□ Generate Page Access Token:
   → Must be long-lived (60 days)
   → Needs pages_manage_posts permission
```

---

## 📅 DO BEFORE LAUNCH (Phase 8)

### 11. Client Coordination

```
□ Schedule demo with načelnik
□ Prepare training materials (or schedule training session)
□ Get written approval to go live
□ Coordinate DNS switch timing
□ Notify current hosting provider
```

### 12. Email Migration Prep

```
□ List all email accounts to migrate:
   → info@velikibukovec.hr
   → nacelnik@velikibukovec.hr
   → (others?)
□ Notify email users of migration date
□ Choose migration time (low activity)
```

### 13. DNS Preparation

```
□ Lower TTL on DNS records 1 week before launch (300 seconds)
□ Have both old and new sites ready
□ Prepare rollback plan
□ Schedule launch for low-traffic time
```

---

## ✅ Credential Checklist

Check off as you obtain each credential:

```
CLOUDFLARE (Week 1)
□ Zone ID
□ API Token
□ R2 Account ID
□ R2 Access Key ID
□ R2 Secret Access Key

GOOGLE (Week 1)
□ OAuth Client ID
□ OAuth Client Secret
□ Search API Key
□ Custom Search Engine ID (cx)

VPS (Week 1)
□ IP Address
□ Root password (change immediately!)
□ Tailscale IP (after setup)

FACEBOOK (Before Phase 6)
□ App ID
□ App Secret
□ Page Access Token

OLLAMA CLOUD (Before Phase 6)
□ API Key

SITEGROUND (Before Phase 8)
□ SMTP Host
□ SMTP Username
□ SMTP Password

MONITORING (Before Phase 8)
□ Sentry DSN
□ UptimeRobot configured
```

---

## 🗂️ Store Credentials Securely

Use a password manager. When ready, create `.env.local`:

```bash
# .env.local (NEVER commit this file)

# === CLOUDFLARE ===
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=velikibukovec-media

# === GOOGLE ===
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_CX=

# === FACEBOOK ===
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=

# === OLLAMA CLOUD ===
OLLAMA_CLOUD_URL=https://api.ollama.ai
OLLAMA_CLOUD_API_KEY=

# === EMAIL (SMTP) ===
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# === MONITORING ===
SENTRY_DSN=

# === DATABASE ===
DATABASE_URL=postgresql://user:password@localhost:5432/velikibukovec
```

---

## 📊 Impact Summary

| Task | Effort | Blocks |
|------|--------|--------|
| Cloudflare setup | 30 min | Sprint 1.5, 3.5, 3.6 |
| Google Cloud setup | 20 min | Sprint 0.3 |
| VPS order | 10 min | Sprint 3.1 |
| Design assets | Varies | Sprint 2.1, 2.2 |
| WordPress export | 30-60 min | Phase 4 |
| User list | 10 min | Sprint 1.11 |
| Legal text | 1-2 hrs | Sprint 2.9 |
| Facebook setup | 30 min | Sprint 6.7 |
| Ollama Cloud | 10 min | Sprint 6.1 |

**Most impactful this week:** Cloudflare + Google Cloud + VPS order

---

## 🆘 Need Help?

If you're stuck on any task, note it here and we'll solve it together:

```
Task: ________________
Stuck on: ________________
```

