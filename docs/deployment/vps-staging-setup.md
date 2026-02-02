# VPS Staging Environment Setup

Deploy both admin (backend) and web (static frontend) to VPS.

## Current Deployment

| Service | URL | Access |
|---------|-----|--------|
| Frontend (public) | http://159.195.61.215/ | ✅ Public |
| Frontend (Tailscale) | http://100.120.125.83/ | ✅ Tailscale |
| Admin | http://100.120.125.83:3001/ | ✅ Tailscale only (port 3001 firewalled) |
| Admin API | http://100.120.125.83:3001/api/ | ✅ Tailscale only |

**Note:** The domain `velikibukovec.hr` still points to the old WordPress site. DNS switch pending for launch.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VPS (159.195.61.215)                 │
│                                                         │
│   :80 ──► Caddy ──► static files (web/out)  [PUBLIC]   │
│                                                         │
│   :3001 ──► PM2/Next.js (admin app)  [TAILSCALE ONLY]  │
│                                                         │
│   :5432 ──► PostgreSQL (localhost + Tailscale)         │
│                                                         │
│   Tailscale IP: 100.120.125.83                         │
└─────────────────────────────────────────────────────────┘
```

---

## SSH Access

SSH access is via Tailscale IP only (UFW blocks port 22 from public internet).

### Connect via Tailscale:
```bash
ssh deploy@100.120.125.83
```

### Requirements:
1. Your machine must be on the same Tailscale network
2. SSH key must be authorized on VPS (~/.ssh/authorized_keys)

---

## Quick Deploy Script

After SSH access is established, run:

```bash
tailscale ssh deploy@v2202601269591428137 << 'DEPLOY'
cd /home/deploy/apps/admin-repo
git pull origin main
export DATABASE_URL='postgresql://velikibukovec:PASSWORD@localhost:5432/velikibukovec'
export ADMIN_HOST='127.0.0.1'
export ADMIN_PORT='3001'
export NEXT_PUBLIC_API_URL='https://admin.velikibukovec.hr'
export NEXT_PUBLIC_SITE_URL='https://velikibukovec.hr'
pnpm install
pnpm --filter @repo/database db:generate
pnpm --filter @repo/admin build
pnpm --filter @repo/web build
pm2 restart vb-admin
echo "Deploy complete!"
DEPLOY
```

> **Staging override:** For Tailscale-only testing, set `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SITE_URL` to `http://127.0.0.1:3001` and `http://127.0.0.1` to avoid accidental public exposure.

---

## Directory Structure (VPS)

```
/home/deploy/
├── apps/
│   └── admin-repo/          # Git repository
│       ├── apps/
│       │   ├── admin/       # Admin app (PM2)
│       │   └── web/
│       │       └── out/     # Static files (Caddy)
│       └── packages/
├── logs/                    # PM2 logs
└── backups/                 # DB backups
```

---

## Services

### PM2 (Admin App)
```bash
pm2 status              # Check status
pm2 logs vb-admin       # View logs
pm2 restart vb-admin    # Restart
```

### Caddy (Static Files)
```bash
sudo systemctl status caddy
sudo systemctl reload caddy
sudo caddy validate --config /etc/caddy/Caddyfile
```

### PostgreSQL
```bash
sudo systemctl status postgresql
sudo -u postgres psql -d velikibukovec
```

---

## Caddy Configuration

Location: `/etc/caddy/Caddyfile`

```caddyfile
{
    # Enforce modern TLS and avoid leaking server information
    servers {
        protocol {
            experimental_http3
        }
    }
}

# Redirect HTTP → HTTPS (production)
http:// {
    redir https://{host}{uri} permanent
}

# Static site (public)
velikibukovec.hr {
    root * /home/deploy/apps/admin-repo/apps/web/out
    file_server
    try_files {path} {path}.html {path}/ /index.html

    @static {
        path /_next/* /images/* /fonts/* *.css *.js *.ico *.png *.jpg *.svg *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    request_body {
        max_size 10MB
    }

    header {
        -Server
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }

    encode zstd gzip
}

# Admin (reverse proxy to localhost-only app)
admin.velikibukovec.hr {
    request_body {
        max_size 20MB
    }

    header {
        -Server
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    }

    reverse_proxy 127.0.0.1:3001 {
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}

        transport http {
            dial_timeout 5s
            response_header_timeout 30s
            idle_timeout 2m
        }
    }

    encode zstd gzip
}
```

> **Staging note:** If you must expose HTTP for local testing, keep `:80` only on a Tailscale-only interface and skip the HTTPS redirect block above. Production must terminate TLS and redirect HTTP to HTTPS.

---

## Firewall (UFW)

Key rules:
```
22/tcp    ALLOW  100.64.0.0/10   # SSH via Tailscale
80/tcp    ALLOW  Cloudflare IPs  # HTTP redirect only (prod)
443/tcp   ALLOW  Cloudflare IPs  # HTTPS (prod)
3001/tcp  DENY   (not exposed)   # Admin via reverse proxy only
5432/tcp  DENY   (not exposed)   # PostgreSQL localhost only
```

---

## Troubleshooting

### "Connection refused" on SSH
- Use `tailscale ssh`, not `ssh`
- Verify Tailscale ACL permits SSH
- Check `tailscale status` on both machines

### Admin app not responding
```bash
tailscale ssh deploy@v2202601269591428137 "pm2 logs vb-admin --lines 50"
```

### Static files return 403
```bash
# Ensure Caddy can traverse directories
chmod o+x /home/deploy
```

### Database connection issues
```bash
# Test connection
PGPASSWORD='xxx' psql -h localhost -U velikibukovec -d velikibukovec -c '\conninfo'
```
