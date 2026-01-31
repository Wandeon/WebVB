# NIS2 Compliance Checklist

> **Verified:** 2026-01-31
> **Site:** Općina Veliki Bukovec (velikibukovec.hr)
> **Assessor:** Internal technical review

---

## Security Architecture

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Static site (no server-side execution on public) | ✅ | `output: 'export'` in next.config.ts |
| Admin isolated on separate subdomain | ✅ | admin.velikibukovec.hr (separate deployment) |
| No PHP/WordPress vulnerabilities | ✅ | Next.js + TypeScript stack, no legacy CMS |
| SQL injection risk mitigated | ✅ | Public site: static HTML (no runtime DB). Admin: parameterized queries via Prisma ORM |

## Access Control

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Role-based access control (RBAC) | ✅ | Better Auth with super_admin/admin/staff roles |
| Strong password requirements | ✅ | Min 12 chars, complexity enforced |
| Multi-factor authentication (2FA) | ✅ | TOTP via Better Auth plugin |
| Session management | ✅ | 24h default, 30d with remember me, max 5 concurrent |
| Rate limiting on authentication | ✅ | Better Auth rate limit plugin (login, password reset) |

## Encryption

| Requirement | Status | Evidence |
|-------------|--------|----------|
| TLS enforced end-to-end | ✅ | Cloudflare SSL, HTTPS everywhere |
| HSTS enabled | ⚠️ | Ready to enable post-launch (Caddyfile prepared) |
| Secure password hashing | ✅ | bcrypt via Better Auth |
| Database encryption at rest | ✅ | Netcup VPS disk encryption |

## Security Headers

| Header | Status | Value |
|--------|--------|-------|
| Content-Security-Policy | ✅ | Restrictive policy with allowlisted sources |
| X-Content-Type-Options | ✅ | nosniff |
| X-Frame-Options | ✅ | DENY |
| X-XSS-Protection | ✅ | 1; mode=block |
| Referrer-Policy | ✅ | strict-origin-when-cross-origin |
| Permissions-Policy | ✅ | geolocation=(), microphone=(), camera=() |

## Application Security

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Secure cookies | ✅ | HttpOnly, Secure, SameSite=Lax via Better Auth |
| CSRF protection | ✅ | Better Auth CSRF tokens on all forms |
| Input validation | ✅ | Zod schemas on client and server |
| Dependency monitoring | ✅ | npm audit in CI pipeline |

## Backup & Recovery

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Daily automated backups | ✅ | 3am cron to Cloudflare R2 |
| Off-site storage | ✅ | Cloudflare R2 (geographically separate) |
| Backup retention | ✅ | 90 days rolling |
| Tested restore procedure | ⚠️ | Planned (quarterly restore drill scheduled Q2 2026) |

## Monitoring & Logging

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Error tracking | ✅ | Sentry SDK installed |
| Uptime monitoring | ✅ | UptimeRobot configured |
| Admin action audit logs | ✅ | Better Auth audit plugin (who/what/when) |
| Log rotation | ✅ | logrotate configured (14 days, compressed) |

## Infrastructure Security

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Firewall enabled | ✅ | UFW on VPS, default deny incoming |
| SSH hardened | ✅ | Key-only auth, root disabled, Tailscale-only access |
| Brute-force protection | ✅ | fail2ban active on SSH |
| Services isolated | ✅ | PostgreSQL, Ollama bound to 127.0.0.1 only |
| VPN for admin access | ✅ | Tailscale mesh network |
| DDoS protection | ✅ | Cloudflare (included) |

## Incident Response & Governance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Incident response procedure defined | ✅ | Documented in SECURITY.md |
| Incident notification capability (24-72h) | ✅ | Audit logs + defined contact chain |
| Responsibility assigned | ✅ | System owner (municipality) + technical admin defined |
| Change management | ✅ | Git-based CI/CD with full audit trail |
| Security update process | ✅ | Dependabot alerts + unattended-upgrades on VPS |

---

## Compliance Summary

| Category | Status |
|----------|--------|
| Critical Issues | **0** |
| Warnings | **2** (HSTS pending launch, restore drill scheduled) |
| Overall Status | **COMPLIANT** |

### Assessment

This system meets NIS2 requirements through:

1. **Security by design** - Static public site eliminates runtime attack surface
2. **Defense in depth** - Multiple layers (Cloudflare, firewall, VPN, app-level controls)
3. **Access control maturity** - RBAC + 2FA + session management exceeds typical municipal IT
4. **Operational readiness** - Logging, monitoring, and incident response procedures defined

### Recommendations

1. Enable HSTS header after DNS switch to production domain
2. Complete first quarterly backup restore drill by Q2 2026
3. Document incident response contact chain in separate runbook

---

*Generated: 2026-01-31 | Next review: 2026-04-30*
