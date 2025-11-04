# Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Database migrations up to date
- [ ] Environment variables configured for production
- [ ] HTTPS/TLS certificate obtained
- [ ] NODE_ENV set to `production`
- [ ] Reverse proxy configured (nginx/Apache)
- [ ] Database backups scheduled

## Environment Configuration

### Production .env

```env
# Server
PORT=3001
NODE_ENV=production

# Database (switch to PostgreSQL for production)
DATABASE_URL=postgresql://user:password@hostname:5432/dbname

# JWT (use strong random value, minimum 32 chars)
JWT_SECRET=your_strong_random_secret_here_minimum_32_characters

# CORS
CLIENT_URL=https://yourdomain.com

# Optional: AI features
ANTHROPIC_API_KEY=sk-...
```

## Database Migration

### Before Deployment

1. **Create migration from development:**
```bash
npm run db:migrate
```

2. **Test migration on staging database:**
```bash
DATABASE_URL=postgresql://staging_user:password@staging_host/staging_db npm run db:migrate
```

3. **Backup production database:**
```bash
# For PostgreSQL
pg_dump your_database > backup_$(date +%Y%m%d_%H%M%S).sql
```

### On Production Server

1. **Apply migrations:**
```bash
npm run db:migrate
```

2. **Verify schema:**
```bash
npm run db:studio  # or query database directly
```

## User Role Assignment

### For Existing Users

Users created before role-based access control are assigned QUIZ_TAKER by default.

#### Option 1: Using Prisma Studio

```bash
npm run db:studio
```

1. Navigate to http://localhost:5555
2. Open the `User` table
3. Edit the `role` field: change to `QUIZ_MANAGER` as needed
4. Save changes

#### Option 2: Direct Database Query

For PostgreSQL:
```sql
-- Set specific user as manager
UPDATE users SET role = 'QUIZ_MANAGER' WHERE username = 'username';

-- View current assignments
SELECT id, username, role FROM users;
```

#### Option 3: Via Seed File

Edit `database/prisma/seed.ts` to include role assignments, then:
```bash
npm run db:seed
```

### For New Users

New users registering via the app UI are assigned QUIZ_TAKER role by default (principle of least privilege).

To create an admin/manager user:
1. Register user normally through app
2. Assign QUIZ_MANAGER role using Option 1 or 2 above

## Production Deployment Steps

### 1. Build All Workspaces

```bash
npm run build
```

Verify successful builds:
- `client/dist/` exists with HTML/JS/CSS
- `server/dist/` exists with compiled JavaScript
- `database/dist/` exists with Prisma client

### 2. Configure Reverse Proxy (nginx example)

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Frontend
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Redirect HTTP to HTTPS
    error_page 497 301 =307 https://$host$request_uri;
}

# HTTP redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### 3. Deploy Backend

Using PM2 (recommended for Node.js):

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server/dist/index.js --name "quiz-api" --env production

# Monitor
pm2 monit

# Enable auto-restart on reboot
pm2 startup
pm2 save
```

Or with systemd:

```ini
# /etc/systemd/system/quiz-app.service
[Unit]
Description=AI Development Quiz App
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/app
ExecStart=/usr/bin/node server/dist/index.js
Restart=always
Environment="NODE_ENV=production"
Environment="DATABASE_URL=postgresql://..."
Environment="JWT_SECRET=..."
Environment="CLIENT_URL=https://yourdomain.com"

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable quiz-app
sudo systemctl start quiz-app
sudo systemctl status quiz-app
```

### 4. Deploy Frontend

Option A: Static hosting (Vercel, Netlify):
1. Push repository to GitHub
2. Connect to Vercel/Netlify
3. Set build command: `npm run build`
4. Set publish directory: `client/dist`

Option B: Self-hosted:
```bash
# Copy dist to web server
scp -r client/dist/* user@server:/var/www/quiz-app/

# Configure web server to serve from /var/www/quiz-app
```

### 5. Verify Deployment

```bash
# Check health endpoint
curl https://yourdomain.com/health

# Test authentication
curl -X POST https://yourdomain.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"TestPass123!"}'

# Test role-based access
# (use token from auth response)
```

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://yourdomain.com/health

# Monitor logs
pm2 logs quiz-api

# Or with systemd
journalctl -u quiz-app -f
```

### Database Maintenance

```bash
# Check database size (PostgreSQL)
SELECT pg_size_pretty(pg_database.datsize)
FROM pg_database
WHERE datname = 'your_database';

# Backup schedule (automated)
# Use: pg_dump, mysqldump, or native backups
```

### Performance Monitoring

- Monitor response times via nginx/reverse proxy logs
- Set up error tracking (Sentry, LogRocket)
- Monitor database query performance
- Alert on server resource usage

## Rollback Procedure

### If Deployment Fails

```bash
# Stop current deployment
pm2 stop quiz-api

# Restore previous code
git checkout previous_commit

# Rebuild
npm run build

# Start previous version
pm2 start server/dist/index.js

# Restore database (if needed)
psql your_database < backup_timestamp.sql
```

## Security Checklist for Production

- ✅ HTTPS/TLS enabled
- ✅ HTTP redirects to HTTPS
- ✅ Security headers configured (HSTS, CSP)
- ✅ JWT_SECRET is strong (32+ characters, random)
- ✅ Database password is strong
- ✅ Environment variables not committed to git
- ✅ Firewall rules configured
- ✅ Rate limiting enabled
- ✅ Error messages don't leak sensitive info
- ✅ Database backups scheduled
- ✅ Monitoring and alerting configured
- ✅ Initial manager user created

## Post-Deployment Tasks

1. Create initial Quiz Manager user (see Role Assignment)
2. Set up monitoring and alerting
3. Configure automated backups
4. Document deployment configuration
5. Train content managers on managing quizzes
6. Monitor error logs for issues
7. Verify all API endpoints are accessible

## Support

For issues during deployment:
- Check backend logs: `pm2 logs` or `journalctl`
- Verify database connectivity: `psql` or `mysql` CLI
- Check reverse proxy configuration: nginx error logs
- Verify SSL certificate validity: `openssl s_client -connect yourdomain.com:443`
