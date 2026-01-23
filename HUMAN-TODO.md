# HUMAN-TODO.md - Tasks Requiring Human Action

> Things YOU (the human) need to do that Claude cannot do for you.
> Check items off as you complete them.
> Last updated: 2026-01-23

## Before Development Starts (Phase 0)

### Accounts to Create

| Service | Action | Cost | Priority |
|---------|--------|------|----------|
| **Cloudflare** | Create account, add velikibukovec.hr domain | Free | HIGH |
| **Cloudflare R2** | Enable R2, create bucket `velikibukovec-media` | ~€2-5/mo | HIGH |
| **Cloudflare Pages** | Connect GitHub repo | Free | HIGH |
| **Netcup** | Order VPS (RS 1000 G11 or similar) | ~€8/mo | HIGH |
| **Ollama Cloud** | Create account, choose Pro/Max plan | ~€10-30/mo | MEDIUM |
| **Google Cloud** | Create project for Search API | Free tier | MEDIUM |
| **Facebook Developer** | Create app for page posting | Free | LOW |
| **Sentry** | Create account for error tracking | Free (10k events) | LOW |
| **UptimeRobot** | Create account for uptime monitoring | Free | LOW |

### Credentials to Obtain

```
□ Cloudflare Zone ID (from domain dashboard)
□ Cloudflare API Token (for cache purging)
□ Cloudflare R2 Access Key ID
□ Cloudflare R2 Secret Access Key
□ Google OAuth Client ID (for admin login)
□ Google OAuth Client Secret
□ Google Search API Key
□ Google Custom Search Engine ID
□ Facebook App ID
□ Facebook App Secret
□ Facebook Page Access Token (long-lived)
□ Ollama Cloud API Key
□ Sentry DSN
```

### Domain & DNS

```
□ Point velikibukovec.hr nameservers to Cloudflare
□ Wait for DNS propagation (24-48 hours)
□ Configure DNS records in Cloudflare:
   - A record: admin.velikibukovec.hr → VPS IP
   - CNAME: www → velikibukovec.hr
   - MX records: Point to Siteground for email
□ Enable Cloudflare proxy (orange cloud) on A/CNAME records
□ Configure SSL: Full (strict) mode
```

---

## During Development (Phases 1-5)

### Content Decisions Needed

```
□ Final list of news categories (confirm the 7 listed)
□ Final list of document categories (confirm the 11 listed)
□ Logo files (SVG preferred, PNG fallback)
□ Favicon and app icons (512x512 PNG for PWA)
□ Hero images for homepage
□ Default placeholder images
□ Social media preview image (1200x630)
```

### Design Review Points

```
□ Review color palette (greens match crest?)
□ Approve typography (Inter + Plus Jakarta Sans)
□ Review homepage layout mockup (when built)
□ Review admin dashboard layout (when built)
□ Approve mobile navigation pattern
```

### User Accounts to Create

```
□ Decide who gets Super Admin (just you?)
□ List of Admin users (načelnik + who else?)
□ List of Staff users (names and emails)
□ Decide 2FA policy (required for admins?)
```

---

## Content Migration (Phase 4)

### Before Migration

```
□ Export WordPress content (you'll need WP admin access)
   - Use WP All Export or manual XML export
   - Export: posts, pages, media library
□ Get list of all documents currently on site
□ Identify which content to migrate vs. archive vs. delete
□ Create content mapping spreadsheet:
   | Old URL | New URL | Migrate? | Notes |
```

### WordPress Export Steps

```bash
# In WordPress Admin:
1. Go to Tools → Export
2. Select "All content"
3. Download XML file
4. Also download media library separately (WP Media Folder or FTP)

# You'll provide Claude with:
- The XML export file
- The media files (or FTP access)
- Your content mapping decisions
```

### Email Migration

```
□ Get list of existing email accounts from current host
□ Decide which accounts to migrate
□ Prepare passwords for new accounts (or let Siteground generate)
□ Coordinate switchover time (expect 24-48h propagation)
□ Notify users about email migration date
```

---

## VPS Setup (Phase 3)

### Initial VPS Access

```
□ Order VPS from Netcup
□ Wait for provisioning email (usually same day)
□ Note down: IP address, root password
□ SSH in and change root password immediately
□ Install Tailscale on VPS: curl -fsSL https://tailscale.com/install.sh | sh
□ Install Tailscale on your machine
□ Authenticate both to same Tailscale network
□ Note Tailscale IP of VPS (100.x.x.x)
```

### After VPS Hardening (Claude will guide)

```
□ Disable root SSH (Claude will provide commands)
□ Configure UFW firewall
□ Set up automatic security updates
□ Test SSH via Tailscale only
```

---

## Before Launch (Phase 8)

### Client Approval

```
□ Schedule demo with client (načelnik)
□ Walk through public site
□ Walk through admin panel
□ Get written sign-off
□ Train admin users (create training doc or video)
```

### Legal & Compliance

```
□ Privacy policy page content (GDPR)
□ Cookie consent text
□ Impressum (legal info page) content
□ Contact form consent text
□ Newsletter signup consent text
```

### Go-Live Checklist

```
□ Final content review
□ All placeholder content replaced
□ All images optimized
□ 404 page tested
□ Contact form tested (sends emails?)
□ Newsletter signup tested
□ Mobile testing on real devices
□ Test on slow connection
□ Schedule go-live time (low traffic period)
□ Have rollback plan ready
```

---

## Post-Launch

### Week 1

```
□ Monitor Sentry for errors
□ Monitor UptimeRobot
□ Check Cloudflare Analytics daily
□ Respond to any user issues
□ Verify old URLs redirect properly
```

### Ongoing

```
□ Weekly: Review analytics
□ Weekly: Check for dependency updates
□ Monthly: Review error logs
□ Monthly: Test backup restore
□ Quarterly: Security audit
```

---

## Service Credentials Summary

When you have them, store securely (password manager, not plain text):

```
# .env.local (NEVER commit this file)

# Cloudflare
CLOUDFLARE_ZONE_ID=
CLOUDFLARE_API_TOKEN=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=velikibukovec-media

# Google
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_CX=

# Facebook
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_PAGE_ID=
FACEBOOK_PAGE_ACCESS_TOKEN=

# Ollama Cloud
OLLAMA_CLOUD_URL=https://api.ollama.ai
OLLAMA_CLOUD_API_KEY=

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Monitoring
SENTRY_DSN=
```

---

## Notes

- **Priority:** Focus on HIGH priority items first
- **Help needed?** Mark items where you need guidance
- **Timeline:** Aim to complete "Before Development" items before Phase 0 coding starts

