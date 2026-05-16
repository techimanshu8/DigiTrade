#!/bin/bash

# DigiTrade Monorepo Bootstrap Script
# This script sets up the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 DigiTrade Monorepo Bootstrap${NC}\n"

# Check Node.js version
echo -e "${YELLOW}Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 20+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check Yarn version
echo -e "${YELLOW}Checking Yarn version...${NC}"
YARN_VERSION=$(yarn -v | cut -d'.' -f1)
if [ "$YARN_VERSION" -lt 4 ]; then
    echo -e "${YELLOW}⚠️  Upgrading Yarn to v4...${NC}"
    corepack enable
    yarn set version stable
fi
echo -e "${GREEN}✓ Yarn $(yarn -v)${NC}\n"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
yarn install --frozen-lockfile
echo -e "${GREEN}✓ Dependencies installed${NC}\n"

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
yarn workspace @remit/prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}\n"

# Create .env files if they don't exist
echo -e "${YELLOW}Checking environment files...${NC}"

if [ ! -f .env.local ]; then
    cp .env.example .env.local 2>/dev/null || cat > .env.local << 'EOF'
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digitrade"

# Redis
REDIS_URL="redis://localhost:6379"

# Kafka
KAFKA_BROKERS="localhost:29092"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRE_IN="7d"

# Services
AUTH_SERVICE_URL="http://localhost:3001"
USER_SERVICE_URL="http://localhost:3002"
BENEFICIARY_SERVICE_URL="http://localhost:3003"
QUOTE_SERVICE_URL="http://localhost:3004"
COMPLIANCE_SERVICE_URL="http://localhost:3005"
PAYMENT_ORCHESTRATOR_URL="http://localhost:3006"
DOCUMENT_SERVICE_URL="http://localhost:3007"
NOTIFICATION_SERVICE_URL="http://localhost:3008"
ADMIN_SERVICE_URL="http://localhost:3009"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# AWS (optional)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""

# Logging
LOG_LEVEL="debug"
LOG_FORMAT="json"
EOF
    echo -e "${GREEN}✓ Created .env.local${NC}"
else
    echo -e "${GREEN}✓ .env.local exists${NC}"
fi

# Start Docker services
echo -e "\n${YELLOW}Starting Docker services...${NC}"
docker-compose -f infrastructure/docker/docker-compose.yml up -d
echo -e "${GREEN}✓ Docker services started${NC}\n"

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 5

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
yarn migrate:deploy || echo -e "${YELLOW}⚠️  Migration warning (might be normal on first run)${NC}"
echo -e "${GREEN}✓ Migrations completed${NC}\n"

# Build packages
echo -e "${YELLOW}Building shared packages...${NC}"
yarn build
echo -e "${GREEN}✓ Packages built${NC}\n"

# Display helpful information
echo -e "${GREEN}✅ Bootstrap complete!${NC}\n"

echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Review .env.local and update secrets"
echo -e "  2. Start services: ${GREEN}yarn dev${NC}"
echo -e "  3. Frontend: http://localhost:3000"
echo -e "  4. API Docs: http://localhost:3001/api/docs"
echo -e "  5. Kafka UI: http://localhost:8080"
echo -e "  6. PostgreSQL: http://localhost:5050 (pgAdmin)\n"

echo -e "${YELLOW}📚 Available commands:${NC}"
echo -e "  yarn dev              - Start all services"
echo -e "  yarn build            - Build all packages"
echo -e "  yarn lint             - Lint all packages"
echo -e "  yarn test             - Run tests"
echo -e "  yarn docker:up        - Start Docker services"
echo -e "  yarn docker:down      - Stop Docker services"
echo -e "  yarn migrate:dev      - Run database migrations interactively"
echo -e "  yarn seed             - Seed database with sample data\n"
