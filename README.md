# DigiTrade - Production-Grade Fintech Remittance Platform

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![Yarn](https://img.shields.io/badge/yarn-%3E%3D4.0.0-brightgreen)

A comprehensive microservices-based outward remittance platform built with **NestJS**, **Next.js**, **PostgreSQL**, **Redis**, and **Kafka**. Production-ready with Docker, Kubernetes, and monitoring.

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start) - Get running in 3 commands
2. [Architecture](#-architecture) - System design and services
3. [Features](#-features) - What's included
4. [Project Structure](#-project-structure) - Directory layout
5. [Development](#-development) - Working with the monorepo
6. [Deployment](#-deployment) - Production setup
7. [API Endpoints](#-api-endpoints) - Service endpoints
8. [Troubleshooting](#-troubleshooting) - Common issues

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js:  >= 20.0.0
Yarn:     >= 4.0.0
Docker:   Latest
Git:      Latest
```

### 3-Step Setup

```bash
# 1. Clone and navigate
git clone <repository-url>
cd DigiTrade

# 2. Bootstrap (installs deps, starts Docker, runs migrations)
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh

# 3. Start development
yarn dev
```

**Done!** All 10 services + frontend running on localhost:3000-3009.

### Manual Setup (if bootstrap fails)

```bash
yarn install                      # Install dependencies
yarn docker:up                    # Start Docker services (PostgreSQL, Redis, Kafka)
yarn migrate:deploy               # Run database migrations
yarn dev                          # Start all services
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────┐
│      Next.js Frontend (3000)        │
│    React, TailwindCSS, Zustand     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Nginx Reverse Proxy (80/443)  │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┬───────────┬──────────────┐
    │          │          │           │              │
    ▼          ▼          ▼           ▼              ▼
┌────────┐ ┌──────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│ Auth   │ │ User │ │Benefit. │ │Quote     │ │Compliant │
│3001    │ │3002  │ │3003     │ │3004      │ │3005      │
└────────┘ └──────┘ └─────────┘ └──────────┘ └──────────┘
    │          │          │           │              │
    ├──────────┴──────────┴───────────┴──────────────┤
    │                                                │
    └────────────────┬─────────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
    ▼                ▼                ▼
┌────────────┐  ┌─────────────┐  ┌────────────────┐
│PostgreSQL  │  │  Redis      │  │    Kafka       │
│ (Database) │  │  (Cache)    │  │  (Event Stream)│
│   5432     │  │   6379      │  │     9092       │
└────────────┘  └─────────────┘  └────────────────┘
```

### Microservices

| Service | Port | Purpose |
|---------|------|---------|
| **Auth Service** | 3001 | JWT authentication, user sessions, token management |
| **User Service** | 3002 | User profiles, KYC data, preferences |
| **Beneficiary Service** | 3003 | Beneficiary management, bank account mapping |
| **Quote Service** | 3004 | Exchange rates, quote generation |
| **Compliance Service** | 3005 | KYC verification, AML checks, regulatory |
| **Payment Orchestrator** | 3006 | Payment processing, settlement coordination |
| **Document Service** | 3007 | Document upload, verification, storage |
| **Notification Service** | 3008 | Email, SMS, in-app notifications |
| **Admin Service** | 3009 | Operations, analytics, system management |
| **Frontend** | 3000 | Next.js web application (React UI) |

### Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| PostgreSQL | 5432 | Primary database (Docker) |
| Redis | 6379 | Cache & sessions (Docker) |
| Kafka | 9092 | Event streaming (Docker) |
| Zookeeper | 2181 | Kafka coordination (Docker) |
| pgAdmin | 5050 | Database UI management |
| Kafka UI | 8080 | Kafka topic management |

---

## ✨ Features

### Production-Ready
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting on all endpoints
- ✅ Database migrations & versioning
- ✅ Health checks & liveness probes
- ✅ Structured JSON logging
- ✅ Input validation & sanitization
- ✅ Error handling with custom exceptions
- ✅ CORS configured per service
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Password hashing (Argon2)

### Scalability
- ✅ Microservices architecture
- ✅ Kafka event-driven communication
- ✅ Redis caching layer
- ✅ Horizontal Pod Autoscaling (Kubernetes)
- ✅ Load balancing (Nginx)
- ✅ Database connection pooling

### DevOps & Deployment
- ✅ Docker containerization
- ✅ Docker Compose (dev & prod)
- ✅ Kubernetes manifests with YAML
- ✅ CI/CD ready
- ✅ Multi-stage builds
- ✅ Database backup strategies
- ✅ SSL/TLS support
- ✅ Environment-based configuration

### Developer Experience
- ✅ Hot-reload during development
- ✅ Yarn workspaces for shared code
- ✅ TypeScript everywhere
- ✅ Shared types & utilities
- ✅ Automated bootstrap script
- ✅ Comprehensive documentation
- ✅ OpenAPI/Swagger documentation
- ✅ Unified linting & formatting

---

## 📁 Project Structure

```
DigiTrade/
│
├── apps/                              # 10 microservices + frontend
│   ├── auth-service/                  # 🔐 Authentication (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── modules/               # Auth modules
│   │   │   ├── infrastructure/        # Redis, Kafka, Audit
│   │   │   └── common/                # Filters, Interceptors
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   ├── user-service/                  # 👤 User management
│   ├── beneficiary-service/           # 👥 Beneficiary management
│   ├── quote-service/                 # 💱 Exchange rates
│   ├── compliance-service/            # ⚖️ KYC & compliance
│   ├── payment-orchestrator/          # 💳 Payment processing
│   ├── document-service/              # 📄 Document management
│   ├── notification-service/          # 📧 Notifications
│   ├── admin-service/                 # ⚙️ Admin operations
│   │
│   └── frontend/                      # 🎨 Next.js application
│       ├── app/                       # App router
│       ├── components/                # React components
│       ├── styles/                    # TailwindCSS styles
│       ├── lib/                       # Utilities & API calls
│       └── public/                    # Static assets
│
├── packages/                          # Shared code
│   ├── shared-types/                  # TypeScript interfaces & types
│   │   ├── src/
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── transaction.ts
│   │   │   ├── errors.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── shared-utils/                  # Utility functions
│   │   ├── src/
│   │   │   ├── logger.ts
│   │   │   ├── exceptions.ts
│   │   │   ├── validators.ts
│   │   │   └── helpers/
│   │   └── package.json
│   │
│   └── prisma/                        # Database schema
│       ├── schema.prisma
│       ├── migrations/
│       └── seed.ts
│
├── infrastructure/                    # Deployment & DevOps
│   │
│   ├── docker/
│   │   ├── docker-compose.yml         # Development stack
│   │   ├── docker-compose.prod.yml    # Production stack
│   │   ├── Dockerfile                 # NestJS multi-stage build
│   │   ├── Dockerfile.frontend        # Next.js build
│   │   ├── nginx.conf                 # Reverse proxy config
│   │   └── .dockerignore
│   │
│   └── kubernetes/
│       ├── base.yaml                  # Base resources (DB, Cache, ConfigMaps)
│       ├── services.yaml              # Service deployments & HPA
│       └── ingress.yaml               # Ingress configuration
│
├── scripts/                           # Automation scripts
│   ├── bootstrap.sh                   # Complete setup automation (200+ lines)
│   ├── dev.sh                         # Development launcher (200+ lines)
│   └── docker-build.sh                # Docker image builder (100+ lines)
│
├── Root Configuration Files
│   ├── package.json                   # Yarn workspaces & scripts
│   ├── tsconfig.base.json             # Base TypeScript config
│   ├── .env.example                   # Environment template
│   ├── .prettierrc                    # Code formatting
│   ├── .prettierignore
│   ├── .gitignore
│   └── yarn.lock
│
└── Documentation
    ├── README.md                      # This file (complete guide)
    ├── MONOREPO.md                    # Extended development guide
    ├── DEPLOYMENT.md                  # Production deployment
    ├── STRUCTURE.md                   # Detailed structure
    └── QUICKREF.md                    # Command quick reference
```

---

## 🛠️ Development

### Common Commands

```bash
# Start all services
yarn dev

# Start specific service
yarn workspace @remit/auth-service dev

# Build all
yarn build

# Build specific
yarn workspace @remit/frontend build

# Lint
yarn lint

# Format code
yarn format

# Run tests
yarn test
yarn test:watch
yarn test:cov
```

### Database Operations

```bash
# Start Docker services
yarn docker:up

# View Docker logs
yarn docker:logs

# Stop Docker services
yarn docker:down

# Create migration
yarn migrate:dev --name "add_users_table"

# Deploy migrations
yarn migrate:deploy

# Seed database
yarn seed

# Prisma Studio
yarn workspace @remit/prisma studio
```

### Workspace-Specific Commands

```bash
# Auth service
yarn workspace @remit/auth-service dev
yarn workspace @remit/auth-service build
yarn workspace @remit/auth-service test

# Frontend
yarn workspace @remit/frontend dev
yarn workspace @remit/frontend build

# Shared types
yarn workspace @remit/shared-types build

# All services in parallel
yarn workspaces foreach -ptA --include '@remit/*' run build
```

### Code Quality

```bash
# Format all files
yarn format

# Check formatting
yarn format:check

# Lint all
yarn lint

# Type check TypeScript
yarn workspace @remit/auth-service tsc --noEmit
```

---

## 🚀 Deployment

### Docker Compose (Development)

```bash
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

Services start with:
- PostgreSQL (5432)
- Redis (6379)
- Kafka (9092)
- pgAdmin (5050)
- Kafka UI (8080)

### Docker Compose (Production)

```bash
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d
```

Production includes:
- Health checks
- Resource limits
- Restart policies
- Volume management
- Network isolation

### Kubernetes Deployment

```bash
# Deploy base infrastructure
kubectl apply -f infrastructure/kubernetes/base.yaml

# Deploy services
kubectl apply -f infrastructure/kubernetes/services.yaml

# Check deployments
kubectl get deployments
kubectl get services
kubectl logs deployment/auth-service
```

### Build Docker Images

```bash
# Build all services
./scripts/docker-build.sh

# Build with custom registry
./scripts/docker-build.sh my-registry.com

# Build specific service
docker build -t @remit/auth-service:latest -f apps/auth-service/Dockerfile .
```

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Key variables:
```env
# Node
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/digitrade
DATABASE_POOL_SIZE=20

# Redis
REDIS_URL=redis://localhost:6379

# Kafka
KAFKA_BROKERS=localhost:9092

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=3600

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Logging
LOG_LEVEL=info
```

---

## 🔗 API Endpoints

### Auth Service (3001)

```bash
POST   /auth/signup              # Register user
POST   /auth/signin              # Login
POST   /auth/refresh             # Refresh token
POST   /auth/logout              # Logout
POST   /auth/verify-email        # Email verification
GET    /auth/profile             # Get current user
```

### User Service (3002)

```bash
GET    /users/me                 # Get profile
PUT    /users/me                 # Update profile
GET    /users/:id                # Get user by ID
PUT    /users/:id/kyc            # Update KYC
GET    /users/:id/kyc            # Get KYC status
```

### Beneficiary Service (3003)

```bash
GET    /beneficiaries            # List beneficiaries
POST   /beneficiaries            # Create
PUT    /beneficiaries/:id        # Update
DELETE /beneficiaries/:id        # Delete
GET    /beneficiaries/:id        # Get details
```

### Quote Service (3004)

```bash
POST   /quotes                   # Get exchange rate quote
GET    /quotes/:id               # Get quote details
GET    /rates                    # Get all rates
```

### Payment Service (3006)

```bash
POST   /payments                 # Initiate payment
GET    /payments/:id             # Get payment status
GET    /payments                 # List user payments
PUT    /payments/:id/cancel      # Cancel payment
```

### All Services

```bash
GET    /health                   # Health check
GET    /api/docs                 # Swagger documentation
```

---

## 🔐 Authentication

### Get Auth Token

```bash
# Sign up
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Sign in
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John"
  }
}
```

### Use Token

Add to request header:
```bash
curl http://localhost:3002/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill it (replace PID with actual process ID)
kill -9 PID
```

### Database Connection Failed

```bash
# Check Docker services
docker-compose -f infrastructure/docker/docker-compose.yml ps

# View logs
docker-compose -f infrastructure/docker/docker-compose.yml logs postgres

# Reset database
docker-compose -f infrastructure/docker/docker-compose.yml down -v
```

### Service Won't Start

```bash
# Check logs
yarn workspace @remit/auth-service dev 2>&1 | tail -100

# Clear node_modules and reinstall
rm -rf node_modules
yarn install

# Rebuild NestJS
yarn build:services
```

### Dependency Resolution Issues

```bash
# Clear cache
yarn cache clean

# Reinstall everything
rm -rf node_modules yarn.lock
yarn install
```

### Docker Issues

```bash
# Restart Docker daemon
docker restart

# Remove dangling images
docker image prune -a

# Rebuild Docker images
docker-compose -f infrastructure/docker/docker-compose.yml down
docker-compose -f infrastructure/docker/docker-compose.yml up -d --build
```

### Kubernetes Debugging

```bash
# View pod logs
kubectl logs -f pod/auth-service-XXXX

# Describe pod for events
kubectl describe pod auth-service-XXXX

# Port forward for testing
kubectl port-forward service/auth-service 3001:3001

# Check service status
kubectl get svc
kubectl get pods
```

---

## 📊 Monitoring & Logging

### Structured Logging

All services output JSON logs:

```json
{
  "level": "INFO",
  "context": "AuthService",
  "message": "User logged in",
  "userId": "user-123",
  "timestamp": "2024-05-17T14:30:00Z",
  "duration": 125
}
```

### Set Log Level

```env
LOG_LEVEL=debug   # debug, info, warn, error
```

### Access Management UIs

- **pgAdmin**: http://localhost:5050 (admin@digitrade.com / admin)
- **Kafka UI**: http://localhost:8080
- **Prisma Studio**: `yarn workspace @remit/prisma studio`

---

## 🔒 Security Checklist

- ✅ JWT token-based authentication
- ✅ Password hashing with Argon2
- ✅ Rate limiting on endpoints
- ✅ CORS configured
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Prisma)
- ✅ Environment variables for secrets
- ✅ Docker non-root user
- ✅ Kubernetes RBAC
- ✅ SSL/TLS support
- ✅ Audit logging
- ✅ Request validation pipes

---

## 📞 Support & Documentation

### Main Documentation Files

| File | Purpose |
|------|---------|
| **README.md** | This file - complete overview |
| **MONOREPO.md** | Extended development guide (700+ lines) |
| **DEPLOYMENT.md** | Production deployment (400+ lines) |
| **STRUCTURE.md** | Detailed project structure |
| **QUICKREF.md** | Command quick reference |

### External Resources

- [NestJS Docs](https://docs.nestjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Kubernetes Docs](https://kubernetes.io/docs)
- [Kafka Docs](https://kafka.apache.org)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

## 🎓 Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20+ | Runtime |
| NestJS | 10.3 | Framework |
| TypeScript | 5.3 | Language |
| PostgreSQL | 16 | Database |
| Prisma | 5.9 | ORM |
| Redis | 7 | Cache |
| Kafka | 7.5 | Event streaming |
| Swagger | 7.3 | API docs |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15 | Framework |
| React | 18.3 | UI library |
| TypeScript | 5.3 | Language |
| TailwindCSS | 3.4 | Styling |
| Zustand | 4.4 | State management |
| React Query | 5.28 | Data fetching |
| Axios | 1.6 | HTTP client |

### Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| Docker | Latest | Containerization |
| Docker Compose | Latest | Orchestration |
| Kubernetes | Latest | Container orchestration |
| Nginx | Latest | Reverse proxy |
| Yarn | 4+ | Package manager |

---

## 📈 Statistics

- **Microservices**: 9 NestJS services
- **Frontend**: 1 Next.js application
- **Shared Packages**: 3 (types, utils, prisma)
- **Total Workspaces**: 14
- **Configuration Files**: 26+
- **Infrastructure Services**: 6 (PostgreSQL, Redis, Kafka, Zookeeper, pgAdmin, Kafka UI)
- **Service Ports**: 3000-3009
- **Documentation**: 1500+ lines across guides

---

## 🎯 Next Steps

### 1. **Initial Setup**
```bash
./scripts/bootstrap.sh
```

### 2. **Verify Services**
```bash
yarn dev              # Terminal 1
curl http://localhost:3001/health  # Terminal 2
```

### 3. **Access Services**
- Frontend: http://localhost:3000
- Auth API: http://localhost:3001/api/docs
- Services: http://localhost:3XXX

### 4. **Start Development**
- Read [MONOREPO.md](./MONOREPO.md) for detailed development guide
- Check [QUICKREF.md](./QUICKREF.md) for common commands
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup

### 5. **Build Your Features**
- Add endpoints to services
- Update database schema with migrations
- Extend frontend components
- Deploy to production

---

## 📝 License

Proprietary. All rights reserved © 2026 DigiTrade

---

## 👥 Architecture & Design

**Authors**: Fintech Architecture Team
- Microservices architecture by experienced architects
- Production-grade NestJS patterns
- Modern Next.js frontend
- Kubernetes-ready infrastructure

---

## ✨ Status

```
✅ PRODUCTION READY
✅ All Services Configured
✅ Docker & Kubernetes Support
✅ Comprehensive Documentation
✅ Ready for Development & Deployment
```

---

**Last Updated**: May 17, 2026
**Platform**: DigiTrade - Fintech Remittance Platform
**Status**: ✅ Production Ready

Get started: `./scripts/bootstrap.sh && yarn dev` 🚀
