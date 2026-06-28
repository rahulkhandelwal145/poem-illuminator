# Deployment Guide — DigitalOcean Droplet

This app runs as a Docker container behind the droplet's host nginx reverse proxy.
Port `3001` is used internally so it does not conflict with other apps already on port `80`.

---

## Prerequisites

- Docker + Docker Compose installed on the droplet
- Host nginx installed (`apt install nginx`)
- A domain/subdomain pointing to the droplet (optional but recommended for HTTPS)

---

## First-Time Setup

### 1. Clone the repo on the droplet

```bash
git clone https://github.com/<your-username>/poem-illuminator.git /srv/poem-illuminator
cd /srv/poem-illuminator
```

### 2. Create the `.env` file

```bash
cat > .env << 'EOF'
VITE_CF_ACCOUNT_ID=your_cloudflare_account_id
VITE_CF_TOKEN=your_cloudflare_api_token
VITE_GROQ_API_KEY=your_groq_api_key
EOF
```

> `.env` is gitignored and never committed. CF credentials are injected into
> nginx at container startup via `envsubst` — they never appear in the JS bundle.

### 3. Build and start the container

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

`docker-compose.prod.yml` is an override file — it must be layered on top of
`docker-compose.yml` (which holds the `build:` context). The container exposes
port `3001` on the host (`3001:80` in docker-compose.prod.yml).

### 4. Add the host nginx reverse-proxy block

```bash
nano /etc/nginx/sites-available/poem-illuminator
```

Paste (replace `poem.yourdomain.com` with your subdomain or the droplet IP):

```nginx
server {
    listen 80;
    server_name poem.yourdomain.com;

    location / {
        proxy_pass         http://127.0.0.1:3001;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

### 5. Enable the site and reload nginx

```bash
ln -s /etc/nginx/sites-available/poem-illuminator /etc/nginx/sites-enabled/
nginx -t          # must print "test is successful"
systemctl reload nginx
```

### 6. (Optional) Enable HTTPS with Let's Encrypt

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d poem.yourdomain.com
```

---

## Redeployment (after pushing new code)

```bash
cd /srv/poem-illuminator
git pull origin main
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

No nginx changes needed — only the container is rebuilt.

---

## Verify

```bash
docker ps                        # container should be "Up"
curl -I http://127.0.0.1:3001   # should return HTTP 200
```

---

## Port Map

| Layer | Port | Notes |
|---|---|---|
| Host nginx | 80 / 443 | Shared with other apps, routes by server_name |
| poem-illuminator container | 3001 → 80 | Host port 3001, container internal 80 |

---

## Useful Commands

```bash
# View live logs
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Stop the app
docker compose -f docker-compose.yml -f docker-compose.prod.yml down

# Rebuild without cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
