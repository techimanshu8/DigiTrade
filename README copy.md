# auth-service — Structure, Setup & Test Commands

## 1. Folder Structure

```
auth-service/
├── prisma/
│   └── schema.prisma                   # DB schema: User, RefreshToken, AuditLog
├── src/
│   ├── main.ts                         # Bootstrap: versioning, validation, swagger
│   ├── app.module.ts                   # Root module wiring
│   ├── config/
│   │   ├── app.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── kafka.config.ts
│   ├── prisma/
│   │   ├── prisma.service.ts           # PrismaClient + healthCheck
│   │   └── prisma.module.ts            # @Global()
│   ├── redis/
│   │   ├── redis.service.ts            # Token blacklist, RT family, login attempts
│   │   └── redis.module.ts             # @Global()
│   ├── kafka/
│   │   ├── kafka.producer.ts           # Idempotent producer + typed emit()
│   │   └── kafka.module.ts             # @Global()
│   ├── audit/
│   │   ├── audit.service.ts            # Fire-and-forget audit log writes
│   │   └── audit.module.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts          # POST /register /login /refresh /logout /me
│   │   ├── auth.service.ts             # Register, login, logout, account lock
│   │   ├── token.service.ts            # JWT generate/rotate/revoke, RT rotation
│   │   ├── dto/
│   │   │   └── auth.dto.ts             # RegisterDto, LoginDto, RefreshTokenDto, etc.
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts       # Passport JWT guard + public route bypass
│   │   │   └── roles.guard.ts          # RBAC role enforcement
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts         # Validates JTI blacklist + user status
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       ├── roles.decorator.ts
│   │       └── public.decorator.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Unified error shape + traceId
│   │   ├── interceptors/
│   │   │   ├── transform.interceptor.ts  # Wraps all responses: { success, data }
│   │   │   └── logging.interceptor.ts
│   │   ├── constants/
│   │   │   └── kafka-topics.ts
│   │   └── utils/
│   │       └── request.util.ts
│   └── health/
│       └── health.module.ts            # /auth/health endpoint
├── test/
│   └── jest-e2e.json
├── .env.example
├── package.json
└── tsconfig.json
```

## 2. Setup Commands

```bash
# Clone and navigate
cd auth-service

# Install dependencies
npm install

# Copy env and configure
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL, JWT secrets, Redis, Kafka

# Generate JWT secrets (production)
openssl rand -hex 64  # Use for JWT_ACCESS_SECRET
openssl rand -hex 64  # Use for JWT_REFRESH_SECRET
openssl rand -hex 32  # Use for ENCRYPTION_KEY

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed (dev only)
npx prisma db seed

# Start development server
npm run start:dev

# Build for production
npm run build
npm run start

# View Prisma Studio (dev)
npx prisma studio
```

## 3. Test Commands

```bash
# Unit tests
npm test

# Unit tests with coverage (target: >80%)
npm run test:cov

# Watch mode
npm run test:watch

# E2E tests (requires running DB + Redis)
npm run test:e2e

# Lint
npm run lint
```

## 4. API Endpoints

| Method | Path              | Auth     | Description               |
|--------|-------------------|----------|---------------------------|
| POST   | /api/v1/auth/register   | Public   | Register user             |
| POST   | /api/v1/auth/login      | Public   | Login, get token pair     |
| POST   | /api/v1/auth/refresh    | Public   | Rotate refresh token      |
| POST   | /api/v1/auth/logout     | Bearer   | Revoke current session    |
| POST   | /api/v1/auth/logout-all | Bearer   | Revoke all sessions       |
| GET    | /api/v1/auth/me         | Bearer   | Get current user payload  |
| GET    | /api/v1/auth/health     | Public   | Health check              |
| GET    | /api/docs               | Dev only | Swagger UI                |

## 5. Security Guarantees

- Argon2id password hashing (65536 memory, 3 iterations)
- Refresh token rotation with family-based reuse detection
- JWT JTI blacklisting in Redis on logout
- Account lockout after N failed attempts (configurable)
- Constant-time password check (prevents timing attacks on email enumeration)
- RBAC via @Roles() decorator + RolesGuard
- Per-endpoint throttling (stricter for auth routes)
- Audit log for every auth event (non-blocking)
- Kafka events for downstream services (notification, compliance)
