# Comprehensive Monorepo Documentation

## 📋 Project Overview

DigiTrade is a production-grade fintech platform for outward remittance using a microservices architecture. The monorepo contains multiple NestJS services, a Next.js frontend, shared packages, and infrastructure configurations.

### Services Architecture

- **Auth Service**: Authentication, JWT tokens, session management
- **User Service**: User profiles, settings, KYC management
- **Beneficiary Service**: Beneficiary management and validation
- **Quote Service**: Exchange rate quotes and pricing
- **Compliance Service**: KYC, AML, regulatory compliance
- **Payment Orchestrator**: Payment processing and orchestration
- **Document Service**: Document management and storage
- **Notification Service**: Email, SMS, push notifications
- **Admin Service**: Administrative operations and analytics
- **Frontend (Next.js)**: Client-facing web application

## 🏗️ Project Structure

```
DigiTrade/
├── apps/                          # Microservices and frontend
│   ├── auth-service/             # Authentication service
│   ├── user-service/             # User management
│   ├── beneficiary-service/      # Beneficiary management
│   ├── quote-service/            # Quote engine
│   ├── compliance-service/       # Compliance & KYC
│   ├── payment-orchestrator/     # Payment processing
│   ├── document-service/         # Document management
│   ├── notification-service/     # Notifications
│   ├── admin-service/            # Admin operations
│   └── frontend/                 # Next.js frontend
├── packages/                      # Shared packages
│   ├── shared-types/             # TypeScript types
│   ├── shared-utils/             # Utilities and helpers
│   └── prisma/                   # Database schema
├── infrastructure/
│   ├── docker/                   # Docker configs
│   └── kubernetes/               # K8s manifests
├── scripts/                       # Bootstrap and utility scripts
├── tsconfig.base.json            # Root TypeScript config
└── package.json                  # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.0.0 or higher
- **Yarn**: 4.0.0 or higher
- **Docker**: Latest version
- **Docker Compose**: Latest version

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd DigiTrade
   ```

2. **Bootstrap the project** (automatic setup):
   ```bash
   chmod +x scripts/bootstrap.sh
   ./scripts/bootstrap.sh
   ```

   This will:
   - Verify Node.js and Yarn versions
   - Install all dependencies
   - Generate Prisma client
   - Create `.env.local` file
   - Start Docker services
   - Run database migrations

3. **Start development environment**:
   ```bash
   yarn dev
   ```

   Or use the helper script:
   ```bash
   chmod +x scripts/dev.sh
   ./scripts/dev.sh
   ```

## 📦 Workspace Management

### Installing Dependencies

```bash
# Install all dependencies
yarn install

# Install dependency in specific workspace
yarn workspace @remit/auth-service add axios

# Add dev dependency
yarn workspace @remit/auth-service add -D @types/express
```

### Running Commands

```bash
# Run command in all workspaces
yarn workspaces run build

# Run command in specific service
yarn workspace @remit/auth-service dev

# Run command in all services (excluding frontend)
yarn workspaces run --include '@remit/*' test
```

### Building

```bash
# Build all packages and services
yarn build

# Build only services
yarn build:services

# Build only frontend
yarn build:frontend

# Watch mode
yarn workspace @remit/shared-types dev
```

## 🗄️ Database Setup

### Prisma Configuration

Database schema is managed in `packages/prisma/prisma/schema.prisma`

```bash
# Create a new migration
yarn migrate:dev --name "description"

# Deploy migrations to database
yarn migrate:deploy

# Generate Prisma client
yarn workspace @remit/prisma generate

# Seed database
yarn seed

# Open Prisma Studio
yarn workspace @remit/prisma studio
```

## 🐳 Docker & Infrastructure

### Docker Compose Services

```bash
# Start all infrastructure services
yarn docker:up

# Stop all services
yarn docker:down

# View logs
yarn docker:logs

# View specific service logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f postgres
```

### Available Services

- **PostgreSQL**: `localhost:5432` (db: digitrade)
- **Redis**: `localhost:6379`
- **Kafka**: `localhost:29092` (internal), `localhost:9092` (external)
- **Kafka UI**: `http://localhost:8080`
- **pgAdmin**: `http://localhost:5050` (admin@digitrade.com / admin)

### Building Docker Images

```bash
# Build service images
./scripts/docker-build.sh

# Build with custom registry
REGISTRY=myregistry VERSION=1.0.0 ./scripts/docker-build.sh

# Build specific service
docker build -f infrastructure/docker/Dockerfile -t digitrade/auth-service:latest .
```

## 🔧 Environment Configuration

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Key environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digitrade"

# Redis
REDIS_URL="redis://localhost:6379"

# Kafka
KAFKA_BROKERS="localhost:29092"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRE_IN="7d"
```

## 📝 Development Workflow

### Starting Services

**Option 1: Using helper script**:
```bash
./scripts/dev.sh
```

**Option 2: Manual setup**:
```bash
# Terminal 1 - Start infrastructure
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Terminal 2 - Start auth service
yarn workspace @remit/auth-service dev

# Terminal 3 - Start user service
yarn workspace @remit/user-service dev

# Terminal 4 - Start frontend
yarn workspace @remit/frontend dev
```

### Service URLs

| Service | URL | Swagger Docs |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Auth Service | http://localhost:3001 | http://localhost:3001/api/docs |
| User Service | http://localhost:3002 | http://localhost:3002/api/docs |
| Beneficiary Service | http://localhost:3003 | http://localhost:3003/api/docs |
| Quote Service | http://localhost:3004 | http://localhost:3004/api/docs |
| Compliance Service | http://localhost:3005 | http://localhost:3005/api/docs |
| Payment Orchestrator | http://localhost:3006 | http://localhost:3006/api/docs |
| Document Service | http://localhost:3007 | http://localhost:3007/api/docs |
| Notification Service | http://localhost:3008 | http://localhost:3008/api/docs |
| Admin Service | http://localhost:3009 | http://localhost:3009/api/docs |

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:cov

# Run tests in watch mode
yarn workspace @remit/auth-service test:watch

# Run e2e tests
yarn workspace @remit/auth-service test:e2e
```

## 📊 Code Quality

```bash
# Lint all packages
yarn lint

# Format code
yarn format

# Check formatting
yarn format:check
```

## 📚 Shared Packages

### @remit/shared-types

Centralized TypeScript types and interfaces:

```typescript
import {
  User,
  JwtPayload,
  Transaction,
  ApiResponse,
  UserRole,
} from '@remit/shared-types';
```

### @remit/shared-utils

Utility functions and helpers:

```typescript
import {
  Logger,
  ApiException,
  retry,
  roundToDecimals,
  isValidEmail,
} from '@remit/shared-utils';
```

### @remit/prisma

Prisma schema and migrations are centralized here. All services use the same database schema.

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to git
2. **Secrets**: Use secret management solutions in production
3. **JWT Tokens**: Store in secure, httpOnly cookies
4. **Rate Limiting**: Enabled on all services
5. **CORS**: Configured per service
6. **Input Validation**: Using class-validator

## 📈 Scaling Considerations

### Horizontal Scaling

Services are stateless and can be scaled horizontally:

```yaml
# kubernetes example
replicas: 3
```

### Database

- **Read Replicas**: For read-heavy operations
- **Connection Pooling**: Using pgBouncer
- **Partitioning**: For large tables

### Caching

- **Redis**: Session cache, rate limiting
- **Kafka**: Event streaming, saga patterns

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use docker-compose to stop
docker-compose -f infrastructure/docker/docker-compose.yml down
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose -f infrastructure/docker/docker-compose.yml ps postgres

# View PostgreSQL logs
docker-compose -f infrastructure/docker/docker-compose.yml logs postgres

# Reset database
docker-compose -f infrastructure/docker/docker-compose.yml down -v
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres
```

### Missing Dependencies

```bash
# Reinstall all dependencies
rm -rf node_modules
yarn install --frozen-lockfile

# Reset Prisma
yarn workspace @remit/prisma generate
```

## 🔄 CI/CD Integration

Services include GitHub Actions workflows (when configured):

- **Lint**: Code quality checks
- **Test**: Unit and integration tests
- **Build**: Compile and build artifacts
- **Docker**: Build and push images
- **Deploy**: Automatic deployment

## 📖 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Kafka Documentation](https://kafka.apache.org/documentation)
- [Redis Documentation](https://redis.io/documentation)

## 👥 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test: `yarn test`
3. Lint and format: `yarn lint && yarn format`
4. Commit with clear message
5. Push and create Pull Request

## 📝 License

Copyright © 2024 DigiTrade. All rights reserved.
