# Deployment Guide

This guide walks you through deploying your survey to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Environment Configuration](#environment-configuration)
- [Post-Deployment](#post-deployment)
- [Platform-Specific Guides](#platform-specific-guides)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Survey configured** - `config/survey.json` finalized
- [ ] **Theme configured** - `config/theme.json` with your branding
- [ ] **Assets uploaded** - Logo, avatar, favicon in `frontend/public/assets/`
- [ ] **Database ready** - PostgreSQL database provisioned
- [ ] **Domain configured** - DNS pointing to your servers (optional)
- [ ] **SSL certificate** - HTTPS enabled (required for production)
- [ ] **Environment variables** - All secrets and keys ready
- [ ] **Tested locally** - Survey works end-to-end in development

---

## Database Setup

### PostgreSQL Database

You need a PostgreSQL database (version 12+). Options:

**Hosted Services (Recommended):**
- [Neon](https://neon.tech) - Serverless Postgres, generous free tier
- [Supabase](https://supabase.com) - Includes auth, storage, free tier
- [Railway](https://railway.app) - Easy provisioning, good free tier
- [Heroku Postgres](https://www.heroku.com/postgres) - Classic option
- [AWS RDS](https://aws.amazon.com/rds/) - Enterprise option

**Self-Hosted:**
- Docker container
- Cloud VM (AWS EC2, DigitalOcean, etc.)

### Database Configuration

1. **Create Database**
   ```sql
   CREATE DATABASE survey_engine;
   ```

2. **Run Migrations**

   Set `DATABASE_URL` environment variable, then:
   ```bash
   cd backend
   npm run migrate
   ```

3. **Verify Tables**
   ```sql
   \dt  -- List tables
   -- Should see: surveys, survey_responses, survey_answers, users
   ```

### Redis (Optional but Recommended)

Redis is used for session management. For production, use:

- [Upstash](https://upstash.com) - Serverless Redis, free tier
- [Redis Cloud](https://redis.com/try-free/) - Managed Redis
- [Railway](https://railway.app) - Easy Redis provisioning

If you don't configure Redis, the system will use in-memory storage (sessions lost on restart).

---

## Backend Deployment

### Option 1: Railway (Easiest)

[Railway](https://railway.app) provides easy deployment with automatic builds.

1. **Create Railway Project**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Add PostgreSQL**
   - In Railway dashboard: New → Database → PostgreSQL
   - `DATABASE_URL` automatically injected

3. **Configure Environment**

   Set in Railway dashboard:
   ```bash
   NODE_ENV=production
   PORT=3001
   CLERK_SECRET_KEY=sk_live_...
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Run Migrations**
   ```bash
   railway run npm run migrate
   ```

### Option 2: Vercel (Serverless)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Set Environment Variables**

   In Vercel dashboard or via CLI:
   ```bash
   vercel env add DATABASE_URL
   vercel env add CLERK_SECRET_KEY
   ```

4. **Custom vercel.json**

   Create `backend/vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/index.js"
       }
     ]
   }
   ```

### Option 3: Docker + Any Cloud

1. **Build Docker Image**
   ```bash
   docker build -t survey-backend ./backend
   ```

2. **Push to Registry**
   ```bash
   docker tag survey-backend your-registry/survey-backend
   docker push your-registry/survey-backend
   ```

3. **Deploy to:**
   - AWS ECS/Fargate
   - Google Cloud Run
   - DigitalOcean App Platform
   - Azure Container Instances

### Option 4: Traditional VPS

1. **SSH into Server**
   ```bash
   ssh user@your-server.com
   ```

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm postgresql nginx
   ```

3. **Clone and Build**
   ```bash
   git clone your-repo
   cd survey-engine/backend
   npm install
   npm run build
   ```

4. **Configure PM2**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name survey-backend
   pm2 save
   pm2 startup
   ```

5. **Setup Nginx Reverse Proxy**

   `/etc/nginx/sites-available/survey`:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

6. **Enable HTTPS**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set Environment Variables**

   In Vercel dashboard:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
   ```

4. **Custom Domain**
   - Add domain in Vercel dashboard
   - Update DNS records
   - SSL automatic

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd frontend
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Configure**

   Create `frontend/netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

4. **Environment Variables**

   Set in Netlify dashboard.

### Option 3: Cloudflare Pages

1. **Connect Git Repository**
   - Go to Cloudflare Pages dashboard
   - Connect GitHub/GitLab repository

2. **Configure Build**
   ```
   Build command: cd frontend && npm run build
   Build output: frontend/dist
   Root directory: /
   ```

3. **Environment Variables**

   Set in Cloudflare dashboard:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
   ```

### Option 4: Static Hosting (S3, GCS, Azure Blob)

1. **Build**
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload `dist/` folder**

   **AWS S3:**
   ```bash
   aws s3 sync dist/ s3://your-bucket-name --acl public-read
   ```

3. **Configure CloudFront (AWS) or CDN**
   - Point to S3 bucket
   - Add custom domain
   - Enable HTTPS

---

## Environment Configuration

### Backend Environment Variables

**Required:**
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:pass@host:5432/db
```

**Recommended:**
```bash
REDIS_URL=redis://user:pass@host:6379
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

**Optional:**
```bash
# Admin authentication
CLERK_SECRET_KEY=sk_live_...

# VideoAsk integration
VIDEOASK_API_KEY=your-api-key
VIDEOASK_WEBHOOK_SECRET=your-secret

# Google Drive export
GOOGLE_DRIVE_CLIENT_ID=...
GOOGLE_DRIVE_CLIENT_SECRET=...
GOOGLE_DRIVE_REFRESH_TOKEN=...

# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

### Frontend Environment Variables

**Required:**
```bash
VITE_API_URL=https://api.yourdomain.com
```

**Optional:**
```bash
# Admin panel (requires Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

---

## Post-Deployment

### 1. Verify Deployment

**Backend Health Check:**
```bash
curl https://api.yourdomain.com/health
# Should return: { "status": "ok" }
```

**Frontend:**
- Visit https://yourdomain.com
- Complete a test survey end-to-end
- Check admin panel (if configured)

### 2. Test Core Features

- [ ] Survey loads correctly
- [ ] All question types render
- [ ] Answers are saved to database
- [ ] Progress bar updates
- [ ] Final message displays
- [ ] Admin dashboard shows responses (if enabled)

### 3. Configure Monitoring

**Backend Monitoring:**
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry, Rollbar)
- Set up log aggregation (Logtail, Papertrail)

**Database Monitoring:**
- Enable slow query logging
- Set up connection pool monitoring
- Configure backups (daily recommended)

### 4. Performance Optimization

**Backend:**
- Enable GZIP compression
- Configure rate limiting
- Set up Redis for session caching

**Frontend:**
- Enable CDN
- Optimize images (compress, WebP format)
- Configure cache headers

### 5. Security Checklist

- [ ] HTTPS enabled (SSL certificate valid)
- [ ] CORS configured correctly (`ALLOWED_ORIGINS`)
- [ ] Database uses strong password
- [ ] All secrets in environment variables (not committed to git)
- [ ] Rate limiting enabled (prevent abuse)
- [ ] Admin panel requires authentication (Clerk)
- [ ] Regular security updates (`npm audit`)

### 6. Backup Strategy

**Database:**
```bash
# Automated daily backups (example for PostgreSQL)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240315.sql
```

**Config Files:**
- Keep `config/` folder in private git repository
- Tag releases when deploying new versions

### 7. Analytics & Tracking

**Survey Completion Rates:**
- Monitor in admin dashboard
- Track drop-off points
- A/B test question wording

**Custom Analytics:**
- Google Analytics (add to `frontend/index.html`)
- Segment, Mixpanel for detailed tracking
- UTM parameters for campaign tracking

---

## Platform-Specific Guides

### Vercel Frontend + Railway Backend

**Perfect for:**
- Most use cases
- Auto-scaling
- Easy setup
- Cost-effective

**Steps:**
1. Deploy backend to Railway (auto-detects Node.js)
2. Add PostgreSQL plugin in Railway
3. Set environment variables in Railway
4. Deploy frontend to Vercel
5. Set `VITE_API_URL` to Railway backend URL
6. Done!

**Cost:**
- Free tier: ~100k requests/month
- Paid: $5-20/month for most surveys

### AWS Full Stack

**Perfect for:**
- Enterprise deployments
- High traffic (100k+ responses)
- Full control

**Architecture:**
- Frontend: S3 + CloudFront
- Backend: ECS Fargate or EC2
- Database: RDS PostgreSQL
- Cache: ElastiCache Redis

**Estimated Cost:**
- $50-200/month depending on traffic

### Single VPS (DigitalOcean, Linode)

**Perfect for:**
- Budget deployments
- Self-hosting preference
- Moderate traffic

**Requirements:**
- 2GB RAM minimum
- 25GB SSD
- Ubuntu 22.04 LTS

**Cost:**
- $12-24/month

---

## Troubleshooting

### "CORS Error" in Browser

**Fix:**
Set `ALLOWED_ORIGINS` in backend:
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Database Connection Fails

**Check:**
1. `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
2. Database allows connections from backend IP
3. SSL required? Add `?sslmode=require` to URL

### Frontend Shows "Failed to Fetch"

**Check:**
1. `VITE_API_URL` points to correct backend
2. Backend is running and healthy
3. CORS configured correctly
4. HTTPS on both frontend and backend

### Sessions Not Persisting

**Fix:**
- Configure Redis (`REDIS_URL`)
- Or: Use sticky sessions if deploying multiple backend instances

### Admin Panel Not Loading

**Check:**
1. `VITE_CLERK_PUBLISHABLE_KEY` set in frontend
2. `CLERK_SECRET_KEY` set in backend
3. Clerk configured for production domain
4. User has admin privileges

---

## Scaling Considerations

### Handling High Traffic

**5,000+ concurrent users:**
1. Enable Redis for session management
2. Use CDN for static assets (CloudFront, Cloudflare)
3. Deploy multiple backend instances (load balancer)
4. Use database connection pooling (already configured)
5. Enable database read replicas

**50,000+ concurrent users:**
1. All of the above, plus:
2. Move to serverless (AWS Lambda, Vercel Functions)
3. Use DynamoDB or similar for session storage
4. Implement edge caching (Cloudflare Workers)
5. Consider queue-based answer processing

---

## Rollback Procedure

If deployment fails:

1. **Frontend:** Vercel/Netlify keep previous deployments - rollback in dashboard
2. **Backend:** Redeploy previous version or use `pm2 reload`
3. **Database:** Restore from latest backup
4. **Config:** Revert git commit, redeploy

---

## Additional Resources

- **Vercel Deployment**: https://vercel.com/docs
- **Railway Deployment**: https://docs.railway.app
- **Netlify Deployment**: https://docs.netlify.com
- **Docker Documentation**: https://docs.docker.com
- **PostgreSQL Best Practices**: https://wiki.postgresql.org/wiki/Performance_Optimization

---

Need help with deployment? Check platform-specific documentation or create an issue in the repository.
