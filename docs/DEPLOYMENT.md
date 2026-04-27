# Deployment Guide

## Frontend → Vercel

```bash
# vercel.json (place in frontend/)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}

# Deploy
cd frontend
npm run build
vercel deploy --prod
```

Set environment variable in Vercel dashboard:
- `VITE_API_URL` = `https://your-api-domain.com`

## Frontend → Netlify

Create `frontend/public/_redirects`:
```
/* /index.html 200
```

Build settings:
- Build command: `npm run build`
- Publish directory: `dist`

Environment variable:
- `VITE_API_URL` = `https://your-api-domain.com`

## Backend → VPS (PM2 + Nginx)

```bash
# On the VPS:
npm install -g pm2
cd /srv/admin-api
git clone your-repo .
cd backend
npm install
npx prisma migrate deploy
node ../prisma/seed.js
pm2 start src/app.js --name admin-api
pm2 save
pm2 startup
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

After setup, install SSL with Certbot:
```bash
certbot --nginx -d api.yourdomain.com
```

## Production Environment Variables (backend/.env)

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=mysql://user:pass@localhost:3306/admin_db
JWT_ACCESS_SECRET=<64-char-random>
JWT_REFRESH_SECRET=<different-64-char-random>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLIENT_URL=https://your-frontend-domain.com
```

Generate secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Pre-Deployment Checklist

- [ ] `NODE_ENV=production` in backend `.env`
- [ ] JWT secrets are random 64-char strings (not dev defaults)
- [ ] `DATABASE_URL` points to production MySQL
- [ ] `CLIENT_URL` is your production frontend URL
- [ ] SSL/HTTPS on backend domain
- [ ] Database backed up before first deployment
- [ ] `.env` files NOT committed to git
