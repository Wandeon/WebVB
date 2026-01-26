# VPS Staging Environment Setup

Deploy both admin (backend) and web (static frontend) to VPS with Tailscale access.

## Current Deployment

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://100.120.125.83/ | ✅ Live |
| Admin | http://100.120.125.83:3001/ | ✅ Live |
| Admin API | http://100.120.125.83:3001/api/ | ✅ Live |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    VPS (Tailscale)                      │
│                                                         │
│   :80 ──► Caddy ──► static files (web/out)             │
│                                                         │
│   :3001 ──► PM2/Next.js (admin app)                    │
│                                                         │
│   :5432 ──► PostgreSQL (localhost only)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## SSH Access - CRITICAL

**SSH is Tailscale SSH only. Direct OpenSSH to port 22 will NOT work.**

### ✅ Correct way to connect:
```bash
tailscale ssh deploy@v2202601269591428137
```

### ❌ This will NOT work:
```bash
ssh deploy@100.120.125.83  # Connection refused (DERP-only path)
```

### Why regular SSH fails:
- The VPS is accessible via Tailscale DERP relay only (no direct connection)
- UFW blocks port 22 from non-Tailscale sources
- Even Tailscale IPs fail because the path is DERP-relayed
- Tailscale SSH handles this by tunneling through the Tailscale control plane

### Requirements for SSH access:
1. Your machine must be on the same Tailscale network
2. Tailscale ACL must permit SSH from your machine to the VPS
3. VPS must have `tailscale up --ssh` enabled

### Tailscale ACL example (add to Access Controls):
```json
{
  "ssh": [
    {
      "action": "accept",
      "src": ["autogroup:members"],
      "dst": ["tag:tagged-devices"],
      "users": ["autogroup:nonroot", "root"]
    }
  ]
}
```

---

## Quick Deploy Script

After SSH access is established, run:

```bash
tailscale ssh deploy@v2202601269591428137 << 'DEPLOY'
cd /home/deploy/apps/admin-repo
git pull origin main
export DATABASE_URL='postgresql://velikibukovec:PASSWORD@localhost:5432/velikibukovec'
pnpm install
pnpm --filter @repo/database db:generate
pnpm --filter @repo/admin build
pnpm --filter @repo/web build
pm2 restart vb-admin
echo "Deploy complete!"
DEPLOY
```

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
:80 {
    root * /home/deploy/apps/admin-repo/apps/web/out
    file_server
    try_files {path} {path}.html {path}/ /index.html

    @static {
        path /_next/* /images/* /fonts/* *.css *.js *.ico *.png *.jpg *.svg *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"

    header {
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    encode gzip
}
```

---

## Firewall (UFW)

Key rules:
```
22/tcp    ALLOW  100.64.0.0/10   # SSH-Tailscale
80/tcp    ALLOW  Anywhere        # HTTP-Web
3001/tcp  ALLOW  100.64.0.0/10   # Admin-Tailscale (if needed)
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
