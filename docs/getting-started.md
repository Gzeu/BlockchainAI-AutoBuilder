# 🚀 Getting Started with BlockchainAI AutoBuilder

Ghid complet pentru setup-ul și utilizarea platformei BlockchainAI AutoBuilder.

## 📝 Cuprins

1. [Prerequisite](#prerequisite)
2. [Instalare Rapidă](#instalare-rapidă)
3. [Configurare Environment](#configurare-environment)
4. [Rulare Locală](#rulare-locală)
5. [Deploy în Producție](#deploy-în-producție)
6. [Troubleshooting](#troubleshooting)

## 💻 Prerequisite

### Software Necesar

```bash
# Node.js 20+
node --version  # trebuie să fie >= 20.0.0

# pnpm (recomandat)
npm install -g pnpm
pnpm --version  # trebuie să fie >= 8.0.0

# Git
git --version

# Docker (opțional, pentru database local)
docker --version
```

### Conturi și API Keys

- **GitHub Account** pentru repository și CI/CD
- **OpenAI API Key** pentru features AI (opțional)
- **Vercel Account** pentru deploy frontend
- **Railway Account** pentru deploy backend
- **Supabase Account** pentru database (opțional)

## ⚡ Instalare Rapidă

### 1. Clone Repository
```bash
git clone https://github.com/Gzeu/BlockchainAI-AutoBuilder.git
cd BlockchainAI-AutoBuilder
```

### 2. Instalează Dependențe
```bash
pnpm install
```

### 3. Setup Environment
```bash
cp .env.example .env.local
```

### 4. Configurează Database (Opțional)

#### Opțiunea A: PostgreSQL Local cu Docker
```bash
# Pornește container PostgreSQL
docker run --name blockchainai-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=blockchainai_db \
  -p 5432:5432 \
  -d postgres:15

# Update .env.local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blockchainai_db"
```

#### Opțiunea B: Supabase (Cloud)
```bash
# Creează proiect pe supabase.com
# Copiază connection string în .env.local
DATABASE_URL="postgresql://username:password@host:port/database"
```

### 5. Setup Database Schema
```bash
# Rulează migrații
pnpm --filter api db:migrate

# Populează cu date demo
pnpm --filter api db:seed
```

### 6. Pornește Aplicațiile
```bash
# Toate aplicațiile simultan
pnpm dev

# Sau individual:
pnpm dev:web    # Frontend pe :3000
pnpm dev:api    # Backend pe :3001
```

## ⚙️ Configurare Environment

### .env.local Minim Necesar
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blockchainai_db"

# JWT pentru autentificare
NEXTAUTH_SECRET="your-secret-key-here-minimum-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# API Base URL
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### AI Features (Opțional)
```env
# OpenAI pentru generarea de cod
OPENAI_API_KEY="sk-your-openai-api-key"
NEXT_PUBLIC_AI_ENABLED=true
```

### MultiversX Blockchain (Opțional)
```env
# Pentru integrarea blockchain
MULTIVERSX_NETWORK="devnet"
MULTIVERSX_GATEWAY_URL="https://devnet-gateway.multiversx.com"
MULTIVERSX_API_URL="https://devnet-api.multiversx.com"
NEXT_PUBLIC_MULTIVERSX_NETWORK="devnet"
```

## 🖥️ Rulare Locală

### Development Mode
```bash
# Toate aplicațiile
pnpm dev

# Aplicații individuale
pnpm dev:web          # Frontend Next.js
pnpm dev:api          # Backend Express
pnpm dev:contracts    # Smart contracts (watch mode)
```

### URLs Disponibile
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **Prisma Studio**: `pnpm db:studio` (pe :5555)

### Testare Rapidă
```bash
# Test API health
curl http://localhost:3001/api/health

# Test frontend
open http://localhost:3000

# Rulează teste
pnpm test
pnpm test:unit
pnpm test:e2e
```

## 🚀 Deploy în Producție

### Setup Secrets GitHub

1. Du-te la **Settings > Secrets and variables > Actions**
2. Adaugă secretele:

```bash
# Vercel
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id

# Railway
RAILWAY_TOKEN=your-railway-token

# AI (opțional)
OPENAI_API_KEY=sk-your-openai-key

# MultiversX (opțional)
MULTIVERSX_PRIVATE_KEY=your-wallet-private-key

# Database
DATABASE_URL=your-production-database-url

# Monitoring (opțional)
SLACK_WEBHOOK=your-slack-webhook-url
CODECOV_TOKEN=your-codecov-token
```

### Deploy Automat
```bash
# Deploy staging
git push origin develop

# Deploy production
git push origin main

# Create release
git tag v1.0.0
git push origin v1.0.0
```

### Deploy Manual

#### Frontend pe Vercel
```bash
cd apps/web
npx vercel
npx vercel --prod
```

#### Backend pe Railway
```bash
cd apps/api
npx railway login
npx railway up
```

## 🔧 Dezvoltare și Workflow

### Structura Comenzilor
```bash
# Root commands (afectează toate app-urile)
pnpm dev              # Dezvoltare
pnpm build            # Build producție
pnpm test             # Toate testele
pnpm lint             # Linting
pnpm format           # Code formatting

# App-specific commands
pnpm dev:web          # Doar frontend
pnpm build:api        # Doar backend
pnpm test:contracts   # Doar smart contracts

# Database commands
pnpm db:migrate       # Rulează migrații
pnpm db:seed          # Populează cu date
pnpm db:studio        # Prisma Studio
pnpm db:reset         # Reset complet database

# AI automation
pnpm ai:generate --type component --name UserProfile
pnpm ai:review file src/components/wallet-button.tsx
pnpm ai:optimize
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
# ... develop ...
pnpm lint:fix
pnpm test
git add .
git commit -m "feat: add amazing feature"
git push origin feature/new-feature
# Create PR

# Hotfix
git checkout -b hotfix/critical-bug
# ... fix ...
git commit -m "fix: resolve critical issue"
```

## 🔍 Troubleshooting

### Probleme Comune

#### 1. Dependințe Lipsă
```bash
# Curăță cache și reinstalează
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 2. Port Ocupat
```bash
# Verifică ce rulează pe port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 PID

# Sau folosește alt port
PORT=3002 pnpm dev:web
```

#### 3. Database Connection
```bash
# Verifică dacă PostgreSQL rulează
docker ps | grep postgres

# Restart container
docker restart blockchainai-db

# Test connection manual
psql postgresql://postgres:postgres@localhost:5432/blockchainai_db
```

#### 4. TypeScript Errors
```bash
# Regenerează types
pnpm typecheck

# Prisma types
pnpm --filter api db:generate

# Clear Next.js cache
rm -rf apps/web/.next
pnpm build:web
```

#### 5. CI/CD Failures
```bash
# Local debugging pentru CI
pnpm lint        # ESLint check
pnpm typecheck   # TypeScript check  
pnpm test:unit   # Unit tests
pnpm build       # Build check

# Verifică secrets GitHub
# Settings > Secrets and variables > Actions
```

### Environment Issues

#### Missing Environment Variables
```bash
# Verifică ce lipsește
grep -r "process.env" apps/ | grep -v node_modules

# Compară cu .env.example
diff .env.example .env.local
```

#### Database Migration Errors
```bash
# Reset database complet
pnpm --filter api db:reset

# Sau manual:
dropdb blockchainai_db
createdb blockchainai_db
pnpm --filter api db:migrate
pnpm --filter api db:seed
```

### Performance Issues

#### Slow Build Times
```bash
# Curăță Turbo cache
rm -rf .turbo

# Rebuild cu cache fresh
pnpm build --force

# Verifică bundle size
npx @next/bundle-analyzer
```

#### Memory Issues
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm build

# Monitor memory usage
top -p $(pgrep node)
```

## 📈 Monitoring și Logs

### Development Logs
```bash
# API logs
tail -f apps/api/logs/combined.log

# Next.js logs
# Logs sunt în console

# Database logs
docker logs blockchainai-db
```

### Production Monitoring
- **Frontend**: Vercel Analytics Dashboard
- **Backend**: Railway Metrics
- **Database**: Supabase Dashboard
- **Errors**: Sentry (dacă configurat)
- **Performance**: Lighthouse CI reports

## 📚 Next Steps

### După Setup Reușit
1. 📖 Citește [Architecture Guide](./architecture.md)
2. 🔗 Configurează [Blockchain Integration](./blockchain.md)
3. 🤖 Explorează [AI Automation](./ai-automation.md)
4. 🚀 Urmărește [Deployment Guide](./deployment.md)
5. 🧪 Scrie [Tests](./testing.md)

### Personalizare
1. **Branding**: Actualizează logo-uri și culori 
2. **Features**: Activează/dezactivează funcționalități
3. **Integrations**: Adaugă servicii externe
4. **Analytics**: Configurează tracking

---

## 🤝 Support

Dacă întâmpini probleme:

1. 🔍 Verifică [Common Issues](#troubleshooting)
2. 🐛 Caută în [GitHub Issues](https://github.com/Gzeu/BlockchainAI-AutoBuilder/issues)
3. 💬 Întreabă în [Discussions](https://github.com/Gzeu/BlockchainAI-AutoBuilder/discussions)
4. 📧 Contactează: [pricopgeorge@gmail.com](mailto:pricopgeorge@gmail.com)

**Happy coding! 🚀**