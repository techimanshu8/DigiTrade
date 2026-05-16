# DigiTrade Monorepo - Structure Overview

## 📁 Complete Directory Structure

```
DigiTrade/
│
├── 📁 apps/                                    # All applications (monorepo workspaces)
│   │
│   ├── 📁 auth-service/                       # Authentication & Authorization Service
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 user-service/                       # User Profiles & Settings Service
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 beneficiary-service/                # Beneficiary Management Service
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 quote-service/                      # Exchange Rate & Pricing Service
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 compliance-service/                 # KYC & Compliance Service
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 payment-orchestrator/               # Payment Processing Orchestrator
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 document-service/                   # Document Management Service
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 notification-service/               # Email/SMS/Push Notifications
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 admin-service/                      # Administrative Operations
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── 📁 frontend/                           # Next.js Frontend Application
│       ├── src/
│       ├── public/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       └── tailwind.config.js
│
├── 📁 packages/                               # Shared Packages (monorepo workspaces)
│   │
│   ├── 📁 shared-types/                       # Shared TypeScript Types & Interfaces
│   │   ├── src/
│   │   │   └── index.ts                       # All type definitions
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── 📁 shared-utils/                       # Shared Utilities & Helpers
│   │   ├── src/
│   │   │   └── index.ts                       # Logger, validators, helpers
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── 📁 prisma/                             # Database Schema & Migrations
│       ├── prisma/
│       │   ├── schema.prisma                  # Prisma schema
│       │   └── migrations/                    # Database migrations
│       ├── src/
│       │   └── seed.ts                        # Database seeding
│       ├── package.json
│       └── tsconfig.json
│
├── 📁 infrastructure/                         # Infrastructure as Code
│   │
│   ├── 📁 docker/
│   │   ├── docker-compose.yml                 # Development composition
│   │   ├── docker-compose.prod.yml            # Production composition
│   │   ├── Dockerfile                         # Multi-stage build for services
│   │   ├── Dockerfile.frontend                # Frontend-specific Dockerfile
│   │   ├── nginx.conf                         # Nginx reverse proxy config
│   │   └── .dockerignore
│   │
│   └── 📁 kubernetes/
│       ├── base.yaml                          # Base K8s resources (postgres, redis)
│       ├── services.yaml                      # Service deployments & HPA
│       └── ingress.yaml                       # Ingress configuration (optional)
│
├── 📁 scripts/                                # Utility Scripts
│   ├── bootstrap.sh                           # Initial setup script
│   ├── dev.sh                                 # Development startup script
│   └── docker-build.sh                        # Docker build script
│
├── 📄 package.json                            # Root workspace config
├── 📄 tsconfig.base.json                      # Base TypeScript config
├── 📄 .env.example                            # Environment variables template
├── 📄 .env                                    # Local environment (git ignored)
├── 📄 .gitignore                              # Git ignore rules
├── 📄 .prettierrc                             # Prettier formatting config
├── 📄 .prettierignore                         # Prettier ignore patterns
├── 📄 README.md                               # Main project README
├── 📄 MONOREPO.md                             # Comprehensive monorepo guide
├── 📄 DEPLOYMENT.md                           # Production deployment guide
└── 📄 README\ copy.md                         # Backup readme
```

## 🏗️ Service Architecture

### Microservices (Port Assignments)

```
┌─────────────────────────────────────────────────────────┐
│                     Frontend (3000)                      │
│                   (Next.js + TailwindCSS)              │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼─────┐ ┌──▼────────────┐
│  Auth (3001) │ │User(3002) │ Beneficiary(3003)
└───────┬──────┘ └────┬─────┘ └──┬───────────┘
        │             │          │
     ┌──▼─────────────▼──────────▼─┐
     │     Quote(3004)             │
     │  Compliance(3005)           │
     │  Payment(3006)              │
     │  Document(3007)             │
     │  Notification(3008)         │
     │  Admin(3009)                │
     └──────────────┬──────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼──┐  ┌────▼────┐  ┌──▼──────┐
   │  DB   │  │  Redis  │  │  Kafka  │
  (Postgres)(5432) (6379)  (9092)
   └───────┘  └─────────┘  └─────────┘
```

## 📦 Monorepo Configuration

### Root package.json Workspaces

```json
{
  "workspaces": [
    "apps/*",        // 10 apps
    "packages/*"     // 3 packages
  ]
}
```

### Service Ports

| Service | Port | Dependencies |
|---------|------|--------------|
| Frontend | 3000 | All APIs |
| Auth | 3001 | DB, Redis, Kafka |
| User | 3002 | DB, Redis, Kafka |
| Beneficiary | 3003 | DB, Redis, Kafka |
| Quote | 3004 | DB, Redis, Kafka |
| Compliance | 3005 | DB, Redis, Kafka |
| Payment | 3006 | DB, Redis, Kafka |
| Document | 3007 | DB, Redis, Kafka, S3 |
| Notification | 3008 | Redis, Kafka, Email |
| Admin | 3009 | DB, Redis, Kafka |

### Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & sessions |
| Kafka | 9092/29092 | Event streaming |
| Zookeeper | 2181 | Kafka coordination |
| pgAdmin | 5050 | Database UI |
| Kafka UI | 8080 | Kafka management |

## 🔄 Workspace Dependencies

### Frontend Dependencies
```
@remit/frontend
  └── @remit/shared-types
  └── @remit/shared-utils
```

### Service Dependencies (Example: Auth Service)
```
@remit/auth-service
  ├── @remit/shared-types
  ├── @remit/shared-utils
  ├── @prisma/client
  ├── kafkajs
  ├── ioredis
  └── @nestjs/*
```

### Shared Packages
```
@remit/shared-types
  └── (no dependencies)

@remit/shared-utils
  └── @remit/shared-types

@remit/prisma
  ├── @prisma/client
  └── prisma
```

## 📝 File Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Root workspace configuration |
| `tsconfig.base.json` | Base TypeScript config for all packages |
| `.env.example` | Environment variables template |
| `.prettierrc` | Code formatting rules |
| `.gitignore` | Git ignore patterns |

### Documentation

| File | Purpose |
|------|---------|
| `README.md` | Main project overview |
| `MONOREPO.md` | Comprehensive monorepo guide |
| `DEPLOYMENT.md` | Production deployment guide |

### Docker Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for NestJS services |
| `Dockerfile.frontend` | Optimized build for Next.js frontend |
| `docker-compose.yml` | Development environment |
| `docker-compose.prod.yml` | Production environment |
| `.dockerignore` | Files to exclude from Docker build |

### Scripts

| Script | Purpose |
|--------|---------|
| `bootstrap.sh` | Initial setup & dependency installation |
| `dev.sh` | Start all services in development mode |
| `docker-build.sh` | Build and push Docker images |

## 🚀 Development Workflow

### 1. Bootstrap
```bash
./scripts/bootstrap.sh
```
Sets up entire environment, runs migrations

### 2. Development
```bash
yarn dev
# OR
./scripts/dev.sh
```
Starts all services with hot-reload

### 3. Testing
```bash
yarn test          # All tests
yarn test:cov      # With coverage
yarn workspace @remit/auth-service test:watch  # Specific service
```

### 4. Building
```bash
yarn build         # Build all
yarn build:services # Build only services
yarn build:frontend # Build only frontend
```

## 🐳 Docker Services

### Development
```bash
yarn docker:up    # Start infrastructure
yarn docker:down  # Stop infrastructure
```

### Production
```bash
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```

## 📊 Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: NestJS 10
- **Language**: TypeScript 5
- **Database**: PostgreSQL 16 + Prisma ORM
- **Cache**: Redis 7
- **Messaging**: Kafka 7.5
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 15
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 3
- **State**: Zustand
- **HTTP Client**: Axios
- **Data Fetching**: React Query

### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)
- **Reverse Proxy**: Nginx
- **Monitoring**: Prometheus (optional)

## ✅ Production Ready Features

- ✅ Multi-service deployment
- ✅ Database migrations management
- ✅ Health checks & liveness probes
- ✅ Rate limiting
- ✅ JWT authentication
- ✅ Error handling & logging
- ✅ Docker & Kubernetes support
- ✅ CI/CD ready
- ✅ Backup strategies
- ✅ Security best practices

## 📚 Documentation

- **[README.md](./README.md)** - Quick start guide
- **[MONOREPO.md](./MONOREPO.md)** - Complete setup & development
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment

---

**Total Structure**: 13 services/packages + 2 libraries + Infrastructure = Complete Platform 🚀
