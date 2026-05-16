# DigiTrade - Production-Grade Fintech Monorepo

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![Yarn](https://img.shields.io/badge/yarn-%3E%3D4.0.0-brightgreen)

A comprehensive microservices platform for outward remittance built with NestJS, Next.js, PostgreSQL, Redis, and Kafka.

## 🌟 Features

- **Microservices Architecture**: Independent, scalable services
- **Real-time Processing**: Kafka for event streaming
- **User Management**: Authentication, profiles, KYC
- **Payment Processing**: Multi-currency support, quote engine
- **Document Management**: Upload, verification, storage
- **Compliance**: KYC verification, AML checks
- **Notifications**: Email, SMS, in-app notifications
- **Admin Dashboard**: Operations and analytics
- **Modern Frontend**: Next.js with TypeScript
- **Production Ready**: Docker, Kubernetes, monitoring

## 📚 Quick Links

- [Monorepo Setup & Development](./MONOREPO.md) - Complete setup and development guide
- [Production Deployment](./DEPLOYMENT.md) - Deployment guide for Docker/Kubernetes
- [API Documentation](#api-endpoints) - Available endpoints

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 20.0.0+
- **Yarn**: 4.0.0+
- **Docker**: Latest
- **Docker Compose**: Latest

### Installation & Setup

```bash
# Clone repository
git clone <repository-url>
cd DigiTrade

# Run bootstrap (handles everything)
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh

# Start development environment
yarn dev
```

That's it! All services will be running with Docker infrastructure and database migrations applied.

### Manual Setup (if bootstrap fails)

```bash
# Install dependencies
yarn install

# Start Docker services
yarn docker:up

# Run migrations
yarn migrate:deploy

# Start services
yarn workspace @remit/auth-service dev
```

## 📦 Project Structure

```
DigiTrade/
├── apps/                          # Microservices
│   ├── auth-service/             # 🔐 Authentication (port 3001)
│   ├── user-service/             # 👤 User management (port 3002)
│   ├── beneficiary-service/      # 👥 Beneficiary mgmt (port 3003)
│   ├── quote-service/            # 💱 Quote engine (port 3004)
│   ├── compliance-service/       # ⚖️ Compliance & KYC (port 3005)
│   ├── payment-orchestrator/     # 💳 Payments (port 3006)
│   ├── document-service/         # 📄 Document mgmt (port 3007)
│   ├── notification-service/     # 📧 Notifications (port 3008)
│   ├── admin-service/            # ⚙️ Admin ops (port 3009)
│   └── frontend/                 # 🎨 Next.js UI (port 3000)
├── packages/                      # Shared code
│   ├── shared-types/             # TypeScript types
│   ├── shared-utils/             # Utilities
│   └── prisma/                   # Database schema
├── infrastructure/
│   ├── docker/                   # Docker configs
│   └── kubernetes/               # K8s manifests
└── scripts/                       # Utility scripts
```

## 🔗 Service Ports & URLs

| Service | Port | Swagger Docs | Status |
|---------|------|------------|--------|
| Frontend | 3000 | - | http://localhost:3000 |
| Auth API | 3001 | http://localhost:3001/api/docs | http://localhost:3001 |
| User API | 3002 | http://localhost:3002/api/docs | http://localhost:3002 |
| Beneficiary | 3003 | http://localhost:3003/api/docs | http://localhost:3003 |
| Quote API | 3004 | http://localhost:3004/api/docs | http://localhost:3004 |
| Compliance | 3005 | http://localhost:3005/api/docs | http://localhost:3005 |
| Payment | 3006 | http://localhost:3006/api/docs | http://localhost:3006 |
| Document | 3007 | http://localhost:3007/api/docs | http://localhost:3007 |
| Notification | 3008 | http://localhost:3008/api/docs | http://localhost:3008 |
| Admin | 3009 | http://localhost:3009/api/docs | http://localhost:3009 |

## 🛠️ Common Commands

### Development

```bash
# Start all services
yarn dev

# Start specific service
yarn workspace @remit/auth-service dev

# Build all
yarn build

# Build specific
yarn workspace @remit/shared-types build
```

### Testing

```bash
# Run all tests
yarn test

# Run with coverage
yarn test:cov

# Watch mode
yarn workspace @remit/auth-service test:watch
```

### Code Quality

```bash
# Lint
yarn lint

# Format
yarn format

# Check formatting
yarn format:check
```

### Database

```bash
# Create migration
yarn migrate:dev --name "add_users_table"

# Deploy migrations
yarn migrate:deploy

# Seed database
yarn seed

# Prisma Studio
yarn workspace @remit/prisma studio
```

### Docker

```bash
# Start infrastructure
yarn docker:up

# Stop infrastructure
yarn docker:down

# View logs
yarn docker:logs
```

## 🔐 Authentication

Services use JWT tokens. Get a token:

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

# Use token (in Authorization header)
curl http://localhost:3002/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📊 Infrastructure

### Docker Services

The project includes Docker services for:
- **PostgreSQL** (5432) - Primary database
- **Redis** (6379) - Cache & sessions
- **Kafka** (9092/29092) - Event streaming
- **Zookeeper** (2181) - Kafka coordination
- **pgAdmin** (5050) - Database UI
- **Kafka UI** (8080) - Kafka management

### Access Interfaces

- **pgAdmin**: http://localhost:5050 (admin@digitrade.com / admin)
- **Kafka UI**: http://localhost:8080
- **Prisma Studio**: `yarn workspace @remit/prisma studio`

## 🚀 Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for:
- Docker Compose production setup
- Kubernetes deployment
- Database backups
- Monitoring setup
- SSL/TLS configuration
- Scaling strategies

Quick deploy:

```bash
# Build and push images
./scripts/docker-build.sh

# Deploy with Docker Compose
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# Or deploy to Kubernetes
kubectl apply -f infrastructure/kubernetes/
```

## 🔄 API Endpoints

### Auth Service
- `POST /auth/signup` - Register user
- `POST /auth/signin` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### User Service
- `GET /users/me` - Get profile
- `PUT /users/me` - Update profile
- `GET /users/:id/kyc` - Get KYC status
- `PUT /users/:id/kyc` - Update KYC

### Beneficiary Service
- `GET /beneficiaries` - List beneficiaries
- `POST /beneficiaries` - Create beneficiary
- `PUT /beneficiaries/:id` - Update beneficiary
- `DELETE /beneficiaries/:id` - Delete beneficiary

### Quote Service
- `POST /quotes` - Get exchange rate quote
- `GET /quotes/:id` - Get quote details

### Payment Service
- `POST /payments` - Initiate payment
- `GET /payments/:id` - Get payment status
- `GET /payments` - List user payments

### Document Service
- `POST /documents/upload` - Upload document
- `GET /documents` - List documents
- `GET /documents/:id/download` - Download document

## 🧪 Testing

```bash
# Unit tests
yarn test

# Integration tests
yarn test:e2e

# Coverage report
yarn test:cov
```

## 📈 Monitoring & Logging

Services output structured JSON logs:

```json
{
  "level": "INFO",
  "context": "AuthService",
  "message": "User logged in",
  "userId": "123",
  "timestamp": "2024-05-15T10:30:45Z"
}
```

Set log level:
```env
LOG_LEVEL=debug  # debug, info, warn, error
```

## 🔒 Security

- JWT-based authentication
- Password hashing with Argon2
- Rate limiting on all endpoints
- Input validation with class-validator
- CORS configured per service
- SQL injection prevention via Prisma
- XSS protection in frontend

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Database Connection Failed
```bash
# Check PostgreSQL
docker-compose -f infrastructure/docker/docker-compose.yml logs postgres

# Reset database
docker-compose -f infrastructure/docker/docker-compose.yml down -v
```

### Service Won't Start
```bash
# Check logs
yarn workspace @remit/auth-service dev 2>&1 | tail -50

# Clear node_modules
rm -rf node_modules && yarn install
```

See [MONOREPO.md](./MONOREPO.md) for more troubleshooting.

## 📞 Support

- 📖 [Full Documentation](./MONOREPO.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 🐛 [Issue Tracker](../../issues)
- 💬 [Discussions](../../discussions)

## 📄 License

Proprietary. All rights reserved © 2024 DigiTrade

## 👥 Contributors

- **Architecture**: Microservices, NestJS, Kafka
- **Frontend**: Next.js, TypeScript, TailwindCSS
- **Infrastructure**: Docker, Kubernetes, PostgreSQL
- **Database**: Prisma ORM, PostgreSQL

---

**Ready to get started?** Run `./scripts/bootstrap.sh` and start building! 🚀