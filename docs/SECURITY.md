# SECURITY.md - Security & Compliance

> Security configuration, authentication, VPS hardening, and compliance documentation.
> Last updated: 2026-01-23

## Table of Contents

1. [Security Principles](#security-principles)
2. [Authentication System](#authentication-system)
3. [User Roles & Permissions](#user-roles--permissions)
4. [VPS Hardening](#vps-hardening)
5. [Service Configuration](#service-configuration)
6. [Environment Variables](#environment-variables)
7. [NIS2 Compliance](#nis2-compliance)
8. [Security Checklist](#security-checklist)

---

## Security Principles

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️  SECURITY IS RULE #1                                        │
│                                                                 │
│  Previous projects were compromised by crypto miners due to     │
│  exposed services. THIS WILL NOT HAPPEN HERE.                   │
│                                                                 │
│  Every decision must pass the security check first.             │
└─────────────────────────────────────────────────────────────────┘
```

### Non-Negotiable Rules

| Rule | Enforcement |
|------|-------------|
| Never bind to 0.0.0.0 | All services localhost only |
| Never hardcode secrets | Environment variables only |
| Never commit .env files | .gitignore enforced |
| Never disable firewalls | UFW always enabled |
| Never skip input validation | Zod on client AND server |
| Always use Tailscale | VPN for all internal access |

---

## Authentication System

### Authentication Methods

```
┌─────────────────────────────────────────────────────────────────┐
│  AUTHENTICATION METHODS                                         │
├─────────────────────────────────────────────────────────────────┤
│  1. Email + Password (traditional)                              │
│     • Strong password requirements (min 12 chars, complexity)   │
│     • Secure password hashing (bcrypt/argon2)                   │
│                                                                 │
│  2. Google OAuth (Gmail login)                                  │
│     • One-click login for convenience                           │
│     • Only whitelisted emails can register                      │
│                                                                 │
│  3. Passkeys (WebAuthn)                                         │
│     • Modern passwordless authentication                        │
│     • Supports hardware keys (YubiKey, etc.)                    │
│     • Supports platform authenticators (Touch ID, Face ID)      │
│                                                                 │
│  4. Biometric (via Passkeys)                                    │
│     • Fingerprint (Touch ID)                                    │
│     • Face recognition (Face ID, Windows Hello)                 │
│     • Device-native biometric prompts                           │
│                                                                 │
│  5. Two-Factor Authentication (2FA)                             │
│     • TOTP apps (Google Authenticator, Authy)                   │
│     • Required for Super Admin                                  │
│     • Optional but encouraged for Admin/Staff                   │
│                                                                 │
│  6. Password Reset                                              │
│     • Email-based secure reset link                             │
│     • Time-limited tokens (1 hour expiry)                       │
│     • Rate limited (max 3 requests per hour)                    │
└─────────────────────────────────────────────────────────────────┘
```

### Session Management

```
┌─────────────────────────────────────────────────────────────────┐
│  SESSION MANAGEMENT                                             │
├─────────────────────────────────────────────────────────────────┤
│  • Default session: 24 hours                                    │
│  • "Remember me" session: 30 days                               │
│  • Refresh tokens: Auto-refresh if active                       │
│  • Session invalidation on password change                      │
│  • Concurrent session limit: 5 devices per user                 │
│  • Session revocation from settings page                        │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| Auth Framework | Better Auth |
| Passkeys/WebAuthn | Better Auth Passkey Plugin |
| OAuth | Better Auth Google Provider |
| Password Hashing | Better Auth (bcrypt) |
| 2FA | Better Auth TOTP Plugin |
| Rate Limiting | Better Auth Rate Limit Plugin |
| Audit Logging | Better Auth Audit Plugin |

### Why Better Auth (not NextAuth)

- NextAuth v5 never reached stable release
- Main NextAuth contributor left January 2025
- Better Auth: TypeScript-first, MIT licensed, framework-agnostic
- Built-in plugins for MFA, rate limiting, audit logging
- Full database control with automatic schema generation

---

## User Roles & Permissions

| Role | Who | Permissions |
|------|-----|-------------|
| **Super Admin** | Developer | Full system access, settings, user management, logs, everything |
| **Admin** | Načelnik (mayor) | Full content management, CAN DELETE posts/docs, manage Staff users |
| **Staff** | Staff members | Create/edit posts, add documents, publish posts, CANNOT delete |

### User Management Permissions

```
┌─────────────────────────────────────────────────────────────────┐
│  USER MANAGEMENT (Admin & Super Admin)                          │
├─────────────────────────────────────────────────────────────────┤
│  Super Admin can:                                               │
│  • Create/edit/delete ALL users                                 │
│  • Assign any role                                              │
│  • Force password reset                                         │
│  • View all sessions, revoke any session                        │
│  • View audit logs                                              │
│                                                                 │
│  Admin can:                                                     │
│  • Create/edit Staff users only                                 │
│  • Cannot create other Admins                                   │
│  • Cannot modify Super Admin                                    │
│  • View own sessions only                                       │
│                                                                 │
│  Staff can:                                                     │
│  • Edit own profile only                                        │
│  • Manage own sessions                                          │
│  • Cannot manage other users                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## VPS Hardening

### Initial Setup Checklist

```bash
# 1. Update system immediately
apt update && apt upgrade -y

# 2. Create non-root user
adduser deploy
usermod -aG sudo deploy

# 3. Disable root SSH login
# Edit /etc/ssh/sshd_config:
PermitRootLogin no
PasswordAuthentication no  # Use SSH keys only

# 4. Configure firewall (UFW)
ufw default deny incoming
ufw default allow outgoing
ufw allow from <YOUR_TAILSCALE_IP> to any port 22  # SSH only via Tailscale
ufw allow 80/tcp   # HTTP (for Cloudflare)
ufw allow 443/tcp  # HTTPS (for Cloudflare)
ufw enable

# 5. Install fail2ban
apt install fail2ban
systemctl enable fail2ban

# 6. Install and configure Tailscale
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up

# 7. Automatic security updates
apt install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### Tailscale Network

```
┌─────────────────────────────────────────────────────────────────┐
│  TAILSCALE NETWORK TOPOLOGY                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Your Machine ◄─── Tailscale ───► Netcup VPS                   │
│  (100.x.x.x)        (encrypted)    (100.x.x.x)                 │
│                                                                 │
│  Access:                                                        │
│  • SSH: ssh deploy@100.x.x.x                                   │
│  • PostgreSQL: psql -h 100.x.x.x (if needed remotely)          │
│  • Admin dev: http://100.x.x.x:3001                            │
│                                                                 │
│  Public never sees:                                             │
│  • SSH port                                                     │
│  • Database                                                     │
│  • Internal services                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Service Configuration

### Service Binding Rules

```
┌─────────────────────────────────────────────────────────────────┐
│  NEVER BIND TO 0.0.0.0 OR PUBLIC IP                             │
├─────────────────────────────────────────────────────────────────┤
│  Service          │ Bind To                                     │
│  ─────────────────┼─────────────────────────────────────────    │
│  PostgreSQL       │ 127.0.0.1:5432 (localhost only)             │
│  Ollama           │ 127.0.0.1:11434 (localhost only)            │
│  Admin App        │ 127.0.0.1:3001 (behind Cloudflare)          │
│  Node.js Dev      │ 127.0.0.1:3000 (never public)               │
│  Redis (if used)  │ 127.0.0.1:6379 (localhost only)             │
├─────────────────────────────────────────────────────────────────┤
│  ONLY Cloudflare IPs should reach ports 80/443                  │
│  ALL other access via Tailscale VPN                             │
└─────────────────────────────────────────────────────────────────┘
```

### PostgreSQL Security

```bash
# /etc/postgresql/15/main/postgresql.conf
listen_addresses = 'localhost'  # NEVER '*'

# /etc/postgresql/15/main/pg_hba.conf
# Only local connections
local   all   all                 peer
host    all   all   127.0.0.1/32  scram-sha-256
# NO entries for 0.0.0.0/0 !!!
```

### Ollama Security

```bash
# Ollama service override
# /etc/systemd/system/ollama.service.d/override.conf
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"  # Localhost only!
```

### Log Management

```bash
# /etc/logrotate.d/app-logs
/var/log/velikibukovec/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 deploy deploy
    sharedscripts
    postrotate
        systemctl reload rsyslog > /dev/null 2>&1 || true
    endscript
}

# Also configure journald limits
# /etc/systemd/journald.conf
SystemMaxUse=500M
SystemMaxFileSize=50M
MaxRetentionSec=1week
```

### Cloudflare IP Whitelist (Optional)

```bash
# Only allow Cloudflare IPs to reach your server
# Get current IPs: https://www.cloudflare.com/ips/

# /etc/ufw/applications.d/cloudflare
[Cloudflare]
title=Cloudflare
description=Cloudflare IP ranges
ports=80,443/tcp
```

---

## Environment Variables

### Template (.env.example)

```bash
# .env.example (this IS committed - template only)
# Copy to .env and fill in real values

# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/velikibukovec"

# ============================================
# AUTHENTICATION (Better Auth)
# ============================================
BETTER_AUTH_URL="https://admin.velikibukovec.hr"
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"

# ============================================
# AI SERVICES
# ============================================
OLLAMA_CLOUD_URL="https://api.ollama.ai"
OLLAMA_CLOUD_API_KEY="your-ollama-cloud-key"
OLLAMA_LOCAL_URL="http://127.0.0.1:11434"  # Local embeddings

# ============================================
# EXTERNAL SERVICES
# ============================================
FACEBOOK_PAGE_ID="your-page-id"
FACEBOOK_ACCESS_TOKEN="your-long-lived-token"

GOOGLE_SEARCH_API_KEY="your-google-api-key"
GOOGLE_SEARCH_CX="your-search-engine-id"

# ============================================
# EMAIL (SMTP)
# ============================================
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@example.com"
SMTP_PASSWORD="your-smtp-password"
SMTP_FROM="Općina Veliki Bukovec <noreply@example.com>"

# ============================================
# CLOUDFLARE
# ============================================
CLOUDFLARE_ZONE_ID="your-zone-id"
CLOUDFLARE_API_TOKEN="your-api-token"  # For cache purging
CLOUDFLARE_ANALYTICS_TOKEN="your-analytics-token"

# ============================================
# STORAGE (R2)
# ============================================
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_R2_BUCKET_NAME="velikibukovec-backups"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-xxx.r2.dev"

# ============================================
# SITEGROUND DEPLOYMENT
# ============================================
SITEGROUND_SFTP_HOST="your-server.siteground.com"
SITEGROUND_SFTP_USER="your-sftp-user"
SITEGROUND_SFTP_KEY_PATH="/path/to/private/key"
SITEGROUND_DEPLOY_PATH="/home/user/public_html"

# ============================================
# SENTRY (Error Tracking)
# ============================================
SENTRY_DSN="https://xxx@sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"

# ============================================
# APP CONFIG
# ============================================
NODE_ENV="production"
LOG_LEVEL="info"
```

### Environment Variable Rules

```
┌─────────────────────────────────────────────────────────────────┐
│  ENVIRONMENT VARIABLE RULES                                     │
├─────────────────────────────────────────────────────────────────┤
│  1. NEVER commit .env files (only .env.example)                 │
│  2. NEVER log environment variables                             │
│  3. NEVER expose in client-side code                            │
│  4. ALWAYS use NEXT_PUBLIC_ prefix for client vars              │
│  5. ALWAYS validate env vars at startup                         │
│  6. ALWAYS use strong, generated secrets                        │
│  7. ROTATE secrets periodically                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Startup Validation

```typescript
// packages/shared/src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  OLLAMA_CLOUD_API_KEY: z.string().min(1),
  // ... all required vars
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    process.exit(1);
  }
  return result.data;
}
```

---

## NIS2 Compliance

### Zakon o kibernetičkoj sigurnosti - Compliance Checklist

| Requirement | How We Comply |
|-------------|---------------|
| **Secure Architecture** | Headless/static = no server-side execution on public site, minimal attack surface |
| **Access Control** | Role-based auth (Super Admin, Admin, Staff), Better Auth with secure sessions |
| **Encryption in Transit** | TLS everywhere via Cloudflare (HTTPS enforced) |
| **Encryption at Rest** | PostgreSQL encryption, Netcup disk encryption |
| **Backup & Recovery** | Daily backups to R2, 3-month retention, tested restore procedure |
| **DDoS Protection** | Cloudflare (included free) |
| **WAF (Web App Firewall)** | Cloudflare WAF rules |
| **Security Updates** | Automated dependency updates, OS patching on VPS |
| **Logging & Monitoring** | Admin action logs, error tracking, uptime monitoring |
| **Incident Response** | Documented procedure, contact points, rollback capability |
| **Supply Chain Security** | Dependency auditing (npm audit), minimal dependencies |
| **Data Minimization** | Only collect necessary data, GDPR-compliant forms |

### Architecture Security Advantages

```
┌─────────────────────────────────────────────────────────────────┐
│  WHY HEADLESS/STATIC IS INHERENTLY SECURE                       │
├─────────────────────────────────────────────────────────────────┤
│  ✓ No WordPress = no plugin vulnerabilities                     │
│  ✓ No PHP = no PHP exploits                                     │
│  ✓ Static public site = no server-side code execution           │
│  ✓ No database on public site = no SQL injection possible       │
│  ✓ Admin isolated on separate subdomain                         │
│  ✓ Admin behind Cloudflare = IP hidden, DDoS protected          │
│  ✓ Cloudflare WAF blocks common attacks                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Checklist

### Before Deployment

- [ ] Rate limiting on login attempts
- [ ] CSRF protection on all forms
- [ ] Content Security Policy (CSP) headers
- [ ] Secure cookie settings (HttpOnly, Secure, SameSite)
- [ ] Input validation/sanitization everywhere
- [ ] Admin action audit log (who did what, when)
- [ ] 2FA for Super Admin account
- [ ] Automated security scanning in CI/CD
- [ ] Regular backup restore tests

### Code Review Security Checks

```
SECURITY (Check FIRST - any failure = reject)
□ No hardcoded secrets, API keys, passwords
□ No services bound to 0.0.0.0 or public IP
□ No sensitive data in logs
□ Input validation on ALL user inputs
□ No dangerouslySetInnerHTML without sanitization
□ Environment variables used for all secrets
□ No .env files committed
```

### Instant Rejection Criteria

```
These issues = AUTOMATIC REJECTION, no exceptions:

1. Hardcoded secrets or API keys
2. Services exposed to public (0.0.0.0 binding)
3. Tests skipped or loosened to pass CI
4. TypeScript errors dismissed as "preexisting"
5. any types without documented justification
6. console.log in production code
7. Missing input validation
8. Sensitive data in logs
```
