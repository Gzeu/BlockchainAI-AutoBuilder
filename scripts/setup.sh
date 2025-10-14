#!/bin/bash

# BlockchainAI AutoBuilder Setup Script
# Automatizează setup-ul complet al proiectului

set -e  # Exit on any error

# Colors pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        error "$1 is required but not installed. Please install it first."
    fi
}

# Banner
echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║               BlockchainAI AutoBuilder                  ║
║                   Setup Script                          ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Starting setup process..."

# Check prerequisites
log "Checking prerequisites..."
check_command "node"
check_command "git"
check_command "pnpm"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE="20"
if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
    error "Node.js version $REQUIRED_NODE or higher is required. Current: $NODE_VERSION"
fi

success "Prerequisites check passed!"

# Install dependencies
log "Installing dependencies..."
pnpm install || error "Failed to install dependencies"
success "Dependencies installed!"

# Setup environment
log "Setting up environment..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    warn "Created .env.local from .env.example"
    warn "Please edit .env.local with your configuration before running the app"
else
    log ".env.local already exists, skipping..."
fi

# Setup database (optional)
read -p "Do you want to setup a local PostgreSQL database with Docker? (y/N): " setup_db
if [[ $setup_db =~ ^[Yy]$ ]]; then
    log "Setting up PostgreSQL with Docker..."
    
    if ! command -v "docker" &> /dev/null; then
        warn "Docker not found. Please install Docker to setup local database."
    else
        # Check if container already exists
        if docker ps -a --format 'table {{.Names}}' | grep -q "blockchainai-db"; then
            log "Database container already exists"
            docker start blockchainai-db || warn "Failed to start existing container"
        else
            docker run --name blockchainai-db \
                -e POSTGRES_PASSWORD=postgres \
                -e POSTGRES_DB=blockchainai_db \
                -p 5432:5432 \
                -d postgres:15 || error "Failed to create database container"
            
            # Wait for database to be ready
            log "Waiting for database to be ready..."
            sleep 10
        fi
        
        # Update .env.local with database URL
        if grep -q "DATABASE_URL=" .env.local; then
            sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blockchainai_db"|' .env.local
        else
            echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/blockchainai_db"' >> .env.local
        fi
        
        success "PostgreSQL database setup complete!"
    fi
fi

# Setup database schema
read -p "Do you want to run database migrations and seed data? (y/N): " setup_schema
if [[ $setup_schema =~ ^[Yy]$ ]]; then
    log "Running database migrations..."
    pnpm --filter api db:migrate || warn "Database migration failed - you may need to configure DATABASE_URL first"
    
    log "Seeding database with demo data..."
    pnpm --filter api db:seed || warn "Database seeding failed"
    
    success "Database schema setup complete!"
fi

# Install AI automation tools
log "Setting up AI automation tools..."
cd tools/ai-automation
npm install || warn "Failed to install AI tools - you can install them later"
cd ../..

# Make AI tools executable
chmod +x tools/ai-automation/generate.js
chmod +x tools/ai-automation/review.js

success "AI automation tools setup complete!"

# Setup Git hooks (optional)
read -p "Do you want to setup Git hooks for code quality? (y/N): " setup_hooks
if [[ $setup_hooks =~ ^[Yy]$ ]]; then
    log "Setting up Git hooks..."
    npx husky install || warn "Failed to setup Husky"
    npx husky add .husky/pre-commit "pnpm lint-staged" || warn "Failed to add pre-commit hook"
    success "Git hooks setup complete!"
fi

# Build check
log "Running build check..."
pnpm build || error "Build failed - please check your configuration"
success "Build check passed!"

# Final setup summary
echo -e "${GREEN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════╗
║                  Setup Complete! 🎉                    ║
╚══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

log "Setup completed successfully!"
log ""
log "Next steps:"
log "1. Edit .env.local with your configuration"
log "2. Run 'pnpm dev' to start development servers"
log "3. Visit http://localhost:3000 to see the frontend"
log "4. Visit http://localhost:3001/api/health to check the backend"
log ""
log "Available commands:"
log "  pnpm dev              - Start all development servers"
log "  pnpm dev:web          - Start frontend only"
log "  pnpm dev:api          - Start backend only"
log "  pnpm build            - Build for production"
log "  pnpm test             - Run all tests"
log "  pnpm lint             - Lint code"
log "  pnpm ai:generate      - AI code generation"
log "  pnpm db:studio        - Open Prisma Studio"
log ""
log "Documentation:"
log "  📖 Getting Started: docs/getting-started.md"
log "  🏗️  Architecture: docs/architecture.md"
log "  🔗 Blockchain: docs/blockchain.md"
log "  🤖 AI Automation: docs/ai-automation.md"
log "  🚀 Deployment: docs/deployment.md"
log ""
log "Support:"
log "  🐛 Issues: https://github.com/Gzeu/BlockchainAI-AutoBuilder/issues"
log "  💬 Discussions: https://github.com/Gzeu/BlockchainAI-AutoBuilder/discussions"
log "  📧 Email: pricopgeorge@gmail.com"
log ""
success "Happy coding! 🚀"

# Auto-start option
read -p "Do you want to start the development servers now? (y/N): " start_dev
if [[ $start_dev =~ ^[Yy]$ ]]; then
    log "Starting development servers..."
    log "Frontend will be available at: http://localhost:3000"
    log "Backend will be available at: http://localhost:3001"
    log "Press Ctrl+C to stop the servers"
    log ""
    exec pnpm dev
fi

log "Run 'pnpm dev' when you're ready to start development!"