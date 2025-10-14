# 🚀 Deployment Guide

Ghid complet pentru deploy-ul platformei BlockchainAI AutoBuilder pe diverse platforme cloud.

## 📝 Cuprins

1. [Arhitectura Deployment-ului](#arhitectura-deployment-ului)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Railway)](#backend-deployment-railway)
4. [Database Setup (Supabase)](#database-setup-supabase)
5. [Smart Contracts (MultiversX)](#smart-contracts-multiversx)
6. [CI/CD Automation](#cicd-automation)
7. [Environment Variables](#environment-variables)
8. [Monitoring și Logging](#monitoring-și-logging)

## 🏗️ Arhitectura Deployment-ului

```
🌐 Production Architecture

┌────────────────────┐
│ 👨‍💻 Users                 │
└──────────┐──────────┘
            │
    ┌───────┴───────┐
    │ 🌐 Vercel CDN  │
    │ (Frontend)    │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    │ 🚄 Railway    │
    │ (Backend API) │
    └───────┬───────┘
            │
┌───────────┴───────────┐
│ 📊 Supabase (Database) │
└───────────┬───────────┘
            │
┌───────────┴───────────┐
│ 🔗 MultiversX Network  │
│ (Smart Contracts)   │
└───────────────────────┘
```

## 🌐 Frontend Deployment (Vercel)

### Setup Vercel Project

1. **Creează cont pe [vercel.com](https://vercel.com)**
2. **Conectează GitHub repository**
3. **Configurează project settings**

### Manual Deploy
```bash
cd apps/web

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Production deploy
vercel --prod
```

### Vercel Configuration

Creează `apps/web/vercel.json`:
```json
{
  "framework": "nextjs",
  "buildCommand": "cd ../.. && pnpm build:web",
  "devCommand": "cd ../.. && pnpm dev:web",
  "installCommand": "cd ../.. && pnpm install",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.blockchainai-autobuilder.up.railway.app",
    "NEXT_PUBLIC_APP_NAME": "BlockchainAI AutoBuilder",
    "NEXT_PUBLIC_AI_ENABLED": "true"
  },
  "build": {
    "env": {
      "NEXTAUTH_SECRET": "@nextauth_secret",
      "NEXTAUTH_URL": "https://blockchainai-autobuilder.vercel.app"
    }
  }
}
```

### Environment Variables Vercel

**Production**:
```env
NEXTAUTH_SECRET=your-production-secret-32-chars
NEXTAUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-api.railway.app
NEXT_PUBLIC_AI_ENABLED=true
NEXT_PUBLIC_MULTIVERSX_NETWORK=mainnet
```

**Preview** (pentru PR-uri):
```env
NEXTAUTH_SECRET=your-preview-secret
NEXTAUTH_URL=https://your-app-git-branch.vercel.app
NEXT_PUBLIC_API_URL=https://your-staging-api.railway.app
```

### Custom Domain
```bash
# Adaugă domain custom
vercel domains add your-domain.com

# Configurează DNS
# A record: @ -> 76.76.19.61
# CNAME: www -> cname.vercel-dns.com
```

## 🚄 Backend Deployment (Railway)

### Setup Railway Project

1. **Creează cont pe [railway.app](https://railway.app)**
2. **Conectează GitHub repository**
3. **Deploy din `apps/api` folder**

### Manual Deploy
```bash
cd apps/api

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### Railway Configuration

Creează `apps/api/railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 300
  }
}
```

### Environment Variables Railway

```env
# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# App Config
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app

# Authentication
JWT_SECRET=your-jwt-secret-here

# AI Services
OPENAI_API_KEY=sk-your-openai-key

# MultiversX
MULTIVERSX_NETWORK=mainnet
MULTIVERSX_GATEWAY_URL=https://gateway.multiversx.com
MULTIVERSX_API_URL=https://api.multiversx.com
MULTIVERSX_PRIVATE_KEY=your-wallet-key

# Rate Limiting
API_RATE_LIMIT_MAX=1000
API_RATE_LIMIT_WINDOW_MS=900000

# Logging
LOG_LEVEL=info
```

### Database Integration
```bash
# Adaugă PostgreSQL service
railway add postgresql

# Conectează la API service
railway variables set DATABASE_URL ${{Postgres.DATABASE_URL}}

# Rulează migrații
railway run pnpm db:migrate
```

## 📊 Database Setup (Supabase)

### Alternativă la Railway PostgreSQL

1. **Creează proiect pe [supabase.com](https://supabase.com)**
2. **Obține connection string**
3. **Configurează în Railway**

### Setup Supabase
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push schema
supabase db push
```

### Migration la Supabase
```sql
-- Enable necessary extensions
CREATE EXTENSION if not exists "uuid-ossp";

-- Rulează migrațiile Prisma
-- Se face automat prin pnpm db:migrate
```

### Backup și Recovery
```bash
# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql

# Scheduled backups
# Configurează în Supabase Dashboard
```

## 🔗 Smart Contracts (MultiversX)

### Deploy pe Mainnet

```bash
cd apps/smart-contracts

# Build contracts
make build

# Deploy pe mainnet (ATENȚIE!)
make NETWORK=mainnet WALLET_PEM=production-wallet.pem deploy-all
```

### Contract Addresses

Salvează adresele în environment:
```env
# Production contract addresses
NEXT_PUBLIC_AUTO_BUILDER_CONTRACT=erd1qqqqqqqqqqqqqq...
NEXT_PUBLIC_PROJECT_FACTORY_CONTRACT=erd1qqqqqqqqqqqqqq...
NEXT_PUBLIC_AI_ORACLE_CONTRACT=erd1qqqqqqqqqqqqqq...
```

### Verify Contracts
```bash
# Verifică deployment
mxpy contract query $CONTRACT_ADDRESS \
  --proxy https://gateway.multiversx.com \
  --function getContractVersion
```

## 🤖 CI/CD Automation

### GitHub Actions Setup

**Secrets necesare în GitHub**:
```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id  
VERCEL_PROJECT_ID=your-project-id

# Railway
RAILWAY_TOKEN=your-railway-token

# Database
DATABASE_URL=your-production-database-url

# AI
OPENAI_API_KEY=sk-your-openai-key

# MultiversX
MULTIVERSX_PRIVATE_KEY=your-wallet-private-key

# Monitoring
SLACK_WEBHOOK=your-slack-webhook
CODECOV_TOKEN=your-codecov-token
```

### Deployment Environments

```yaml
# .github/workflows/ci-cd.yml (deja configurat)

# Staging (develop branch)
- Frontend: preview-deploy.vercel.app
- Backend: staging-api.railway.app
- Database: staging database
- Network: MultiversX devnet

# Production (main branch)
- Frontend: your-domain.com
- Backend: api.your-domain.com  
- Database: production database
- Network: MultiversX mainnet
```

### Rollback Strategy
```bash
# Rollback Vercel
vercel rollback https://your-app.vercel.app

# Rollback Railway
railway rollback

# Database rollback
# Restore from backup
psql $DATABASE_URL < backup-before-deploy.sql
```

## 📊 Monitoring și Logging

### Application Monitoring

**Vercel Analytics**:
- Page views și performance
- Core Web Vitals
- Geographic distribution

**Railway Metrics**:
- CPU și memory usage
- Response times
- Error rates

### Error Tracking

**Sentry Setup** (opțional):
```bash
# Install Sentry
pnpm add @sentry/nextjs @sentry/node

# Configure
# apps/web/sentry.client.config.js
# apps/api/src/utils/sentry.ts
```

### Uptime Monitoring

**UptimeRobot** sau **Pingdom**:
```
Endpoints de monitorizat:
- https://your-app.vercel.app
- https://your-api.railway.app/api/health
- https://your-api.railway.app/api/blockchain/info
```

### Logging Strategy

**Structured Logging**:
```typescript
// Backend logging (deja configurat)
import { logger } from '@/utils/logger'

logger.info('User action', {
  userId,
  action: 'project_created',
  metadata: { projectId, type }
})
```

**Log Aggregation**:
- Railway Logs pentru backend
- Vercel Function Logs pentru frontend
- Sentry pentru errors

## 🔐 Security Considerations

### SSL/TLS
```bash
# Automatic HTTPS
# Vercel: automatic SSL
# Railway: automatic SSL
# Custom domain: configure SSL
```

### Environment Security
```bash
# Niciodată în code:
- Private keys
- API secrets
- Database passwords

# Folosește mereu:
- GitHub Secrets
- Environment variables
- Vault services
```

### CORS Configuration
```typescript
// apps/api/src/index.ts (deja configurat)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
```

## 📈 Performance Optimization

### CDN și Caching
```javascript
// Next.js config (deja configurat)
module.exports = {
  images: {
    domains: ['your-cdn.com']
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ]
}
```

### Database Optimization
```sql
-- Index optimization
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at);

-- Connection pooling (Prisma)
// DATABASE_URL="...?connection_limit=20&pool_timeout=20"
```

### API Optimization
```typescript
// Rate limiting (deja configurat)
// Caching cu Redis
// Response compression
```

## 📧 Custom Domains

### Setup Domain
```bash
# Frontend
vercel domains add your-domain.com
vercel domains add api.your-domain.com

# Backend
# Railway: Settings > Domains
# Add: api.your-domain.com
```

### DNS Configuration
```bash
# Root domain (A record)
your-domain.com -> 76.76.19.61 (Vercel)

# API subdomain (CNAME)  
api.your-domain.com -> your-project.up.railway.app

# WWW redirect
www.your-domain.com -> your-domain.com
```

## 🔄 Backup Strategy

### Automated Backups
```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > "backup_${DATE}.sql"

# Upload to S3
aws s3 cp "backup_${DATE}.sql" s3://your-backup-bucket/

# Cleanup old backups
find . -name "backup_*.sql" -mtime +7 -delete
```

### Repository Backup
```bash
# Git mirror
git clone --mirror https://github.com/Gzeu/BlockchainAI-AutoBuilder.git

# Periodic sync
git remote update
```

---

## ✅ Deployment Checklist

### Pre-deployment
- [ ] Toate testele trec local
- [ ] Environment variables configurate
- [ ] Database migrations testate
- [ ] Security audit complet
- [ ] Performance benchmarks ok

### Deployment
- [ ] Staging deployment testat
- [ ] Production deployment
- [ ] Health checks pass
- [ ] Monitoring activ
- [ ] Backup realizat

### Post-deployment
- [ ] Smoke tests
- [ ] Performance monitoring
- [ ] Error tracking activ
- [ ] User acceptance testing
- [ ] Documentation updated

---

## 🤝 Support

Pentru probleme de deployment:
1. Verifică [GitHub Actions logs](https://github.com/Gzeu/BlockchainAI-AutoBuilder/actions)
2. Monitorizează health endpoints
3. Contactează: [pricopgeorge@gmail.com](mailto:pricopgeorge@gmail.com)

**Production is live! 🎉**