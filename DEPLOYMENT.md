# Neevara Realty — Deployment Guide

## Prerequisites
- Node.js 18+
- Git
- A GitHub repository

## Environment Variables
Create a `.env` file in the project root:

```
PORT=3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your-gmail-app-password
SITE_URL=https://neevararealty.com
```

To get a Gmail App Password:
1. Enable 2-Factor Authentication on your Google account
2. Go to Security > App Passwords
3. Generate a password for "Mail"
4. Use that as `EMAIL_PASS`

---

## Option 1: Render.com (Free Tier)

1. Push the project to a GitHub repository
2. Log in to [render.com](https://render.com) → Dashboard → New + → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name**: neevara-realty
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables (exact names as above):
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `SITE_URL`
6. Choose **Free** plan
7. Click **Create Web Service**
8. Set your custom domain in Render Dashboard → Settings → Custom Domain

---

## Option 2: Railway.app

1. Push the project to GitHub
2. Log in to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Railway auto-detects the `railway.json` config
4. Add Environment Variables under the project dashboard
5. Set custom domain: Dashboard → Settings → Domains → `neevararealty.com`

---

## Option 3: VPS (Ubuntu 22.04)

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Verify
node --version  # v18.x
npm --version
```

### 2. Clone & Install
```bash
cd /var/www
git clone https://github.com/your-org/neevara-realty.git
cd neevara-realty
npm install --production
```

### 3. Environment File
```bash
cp .env.example .env
nano .env
# Add your real credentials
```

### 4. PM2 Process Manager
```bash
sudo npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Follow the sudo command PM2 outputs
```

### 5. Nginx Reverse Proxy

Create `/etc/nginx/sites-available/neevararealty.com`:

```nginx
server {
    listen 80;
    server_name neevararealty.com www.neevararealty.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://127.0.0.1:3000;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;
    gzip_min_length 256;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/neevararealty.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL via Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d neevararealty.com -d www.neevararealty.com
# Follow interactive prompts
sudo systemctl enable certbot.timer  # auto-renewal
```

### 7. Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## Verifying Deployment

- Visit `https://neevararealty.com` — Homepage loads
- Visit `https://neevararealty.com/projects/haigreeva-meadows` — Project page loads
- Visit `https://neevararealty.com/health` — Returns `{"status":"ok"}`
- Test contact form submission
- Test mobile responsiveness
