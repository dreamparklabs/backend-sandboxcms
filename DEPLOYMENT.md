# Payload CMS Deployment Guide

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Portfolio      │────▶│ Cloudflare Tunnel│────▶│  Payload CMS    │
│  (Vercel)       │     │  (encrypted)     │     │  (Railway)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                                                 │
        └── x-api-key header required ────────────────────┘
```

## Railway Setup

### 1. Create PostgreSQL Database

1. Go to [Railway](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database service
4. Copy the `DATABASE_URL` from the database settings

### 2. Deploy Payload CMS

1. Connect your GitHub repository
2. Add a new service from the repo (select the `cms` folder)
3. Set environment variables:

```env
DATABASE_URL=<from step 1>
PAYLOAD_SECRET=<generate a random 32+ char string>
NODE_ENV=production
PORT=3001
PORTFOLIO_URL=https://your-portfolio.vercel.app
CMS_PLATFORM_URL=https://your-cms-platform.vercel.app
```

### 3. Generate PAYLOAD_SECRET

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Cloudflare Tunnel Setup (Optional - Extra Security)

This makes your Payload CMS not directly accessible from the internet.

### 1. Install cloudflared

```bash
# macOS
brew install cloudflare/cloudflare/cloudflared

# Windows
winget install Cloudflare.cloudflared

# Linux
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
```

### 2. Authenticate

```bash
cloudflared tunnel login
```

### 3. Create Tunnel

```bash
cloudflared tunnel create cms-api
```

### 4. Route DNS

```bash
cloudflared tunnel route dns cms-api cms-api.yourdomain.com
```

### 5. Configure

Edit `cloudflared-config.yml`:
- Replace `<YOUR_TUNNEL_ID>` with your tunnel ID
- Replace `cms-api.yourdomain.com` with your subdomain

### 6. Run on Railway

Add cloudflared as a sidecar service or run it locally pointing to Railway's internal URL.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes (prod) | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Yes | Encryption key (32+ chars) |
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | No | Server port (default: 3001) |
| `PORTFOLIO_URL` | Yes | Your portfolio site URL for CORS |
| `CMS_PLATFORM_URL` | Yes | Your CMS platform URL for CORS |
| `ALLOWED_ORIGINS` | No | Additional CORS origins (comma-separated) |

## Local Development

```bash
# Uses SQLite by default (no DATABASE_URL needed)
npm run dev
```

## Security Layers

1. **Cloudflare Tunnel** - No public ports exposed
2. **API Key Auth** - Content API requires `x-api-key` header
3. **JWT Auth** - Admin endpoints require authenticated session
4. **CORS** - Only allowed origins can make requests
