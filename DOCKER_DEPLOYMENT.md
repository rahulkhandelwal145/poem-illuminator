# Docker Deployment Guide

## Prerequisites

- Ubuntu 24.04 LTS VM (Azure B1s or higher)
- Ports 80 and 22 open in Azure NSG
- Domain / public IP ready

---

## Step 1 — Install Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

Install Docker Compose plugin:

```bash
sudo apt-get install -y docker-compose-plugin
docker compose version   # should print v2.x
```

---

## Step 2 — Clone the repository

```bash
git clone https://github.com/rahulkhandelwal145/poem-illuminator.git
cd poem-illuminator
```

---

## Step 3 — Create .env with credentials

```bash
cat > .env << 'EOF'
CF_ACCOUNT_ID=<your_cloudflare_account_id>
CF_TOKEN=<your_cloudflare_api_token>
VITE_GROQ_API_KEY=<your_groq_api_key>
EOF
```

| Variable | Where to get it |
|---|---|
| `CF_ACCOUNT_ID` | Cloudflare Dashboard → right sidebar |
| `CF_TOKEN` | Cloudflare → My Profile → API Tokens → Create Token (Workers AI permission) |
| `VITE_GROQ_API_KEY` | console.groq.com → API Keys → Create API Key |

> `.env` is gitignored — never committed to the repo.

---

## Step 4 — Build and start

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

- First build takes ~3–5 minutes (downloads node, nginx images, runs npm build)
- `-f docker-compose.prod.yml` maps port 80 (no port number in URL)
- `-d` runs in background
- `--build` rebuilds the image (required when .env or code changes)

---

## Step 5 — Verify

```bash
docker compose ps          # should show "Up"
docker compose logs -f     # live logs (Ctrl+C to exit)
```

Visit `http://<your-domain-or-ip>` — the app should load.

---

## Redeploying after code or config changes

```bash
cd poem-illuminator
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Always use `--build` so the new code and env vars are baked into the image.

---

## Useful commands

```bash
# Stop the app
docker compose down

# Restart without rebuilding
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# View logs
docker compose logs -f

# Check running containers
docker compose ps

# Free up unused Docker images/cache
docker system prune -f
```

---

## Architecture

```
Browser
  │
  ▼
Azure VM : 80
  │
  ▼
Docker container (nginx : 80)
  ├── /            → serves React app (static files)
  ├── /cf-generate → proxies to Cloudflare Workers AI (FLUX.1-schnell)
  └── /local-generate → proxies to host:8083 (optional local SD model)
```

**Image generation:** Cloudflare Workers AI (free tier, 10k steps/day)  
**LLM prompts:** Groq API (free tier, llama-3.3-70b, 14,400 req/day)  
**Credentials:** injected at build time (Groq) or at container start via envsubst (Cloudflare)

---

## Azure NSG required inbound rules

| Port | Protocol | Purpose |
|------|----------|---------|
| 22   | TCP      | SSH access |
| 80   | TCP      | Web app (HTTP) |
