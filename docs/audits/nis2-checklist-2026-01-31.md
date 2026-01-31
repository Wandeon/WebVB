# NIS2 Compliance Checklist

> Verified: 2026-01-31
> Site: Opcina Veliki Bukovec (velikibukovec.hr)

## Security Architecture

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Static site (no server-side execution on public) | ✅ | `output: 'export'` in next.config.ts |
| Admin isolated on separate subdomain | ✅ | admin.velikibukovec.hr |
| No PHP/WordPress vulnerabilities | ✅ | Next.js + TypeScript stack |
| No SQL injection possible on public site | ✅ | Static HTML, no database queries |

## Access Control

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Role-based authentication | ✅ | Better Auth with super_admin/admin/staff |
| Strong password requirements | ✅ | Min 12 chars, complexity rules |
| 2FA available | ✅ | TOTP in Better Auth |
| Session management | ✅ | 24h default, 30d remember me |
| Rate limiting on login | ✅ | Better Auth rate limit plugin |

## Encryption

| Requirement | Status | Evidence |
|-------------|--------|----------|
| TLS everywhere (HTTPS) | ✅ | Cloudflare SSL |
| Secure password hashing | ✅ | bcrypt via Better Auth |
| Database encryption at rest | ✅ | Netcup disk encryption |

## Security Headers

| Header | Status |
|--------|--------|
| X-Content-Type-Options: nosniff | ✅ |
| X-Frame-Options: DENY | ✅ |
| X-XSS-Protection: 1; mode=block | ✅ |
| Referrer-Policy: strict-origin-when-cross-origin | ✅ |
| Content-Security-Policy | ✅ |
| Permissions-Policy | ✅ |

## Backup & Recovery

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Daily automated backups | ✅ | 3am cron to R2 |
| Off-site storage | ✅ | Cloudflare R2 |
| Backup retention | ✅ | 90 days |
| Tested restore procedure | ⚠️ | Schedule quarterly test |

## Monitoring & Logging

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Error tracking | ✅ | Sentry SDK installed |
| Uptime monitoring | ✅ | UptimeRobot configured |
| Admin action audit logs | ✅ | Better Auth audit plugin |
| Log rotation | ✅ | logrotate configured |

## Infrastructure Security

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Firewall enabled | ✅ | UFW on VPS |
| SSH key-only authentication | ✅ | Password auth disabled |
| Fail2ban active | ✅ | Protects SSH |
| Services bound to localhost | ✅ | PostgreSQL, Ollama on 127.0.0.1 |
| Tailscale VPN for admin access | ✅ | All internal access via VPN |

## Compliance Summary

- **Critical Issues:** 0
- **Warnings:** 1 (backup restore test pending)
- **Status:** COMPLIANT (with note)
