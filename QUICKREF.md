# DigiTrade Quick Reference

## 🚀 Getting Started (2 minutes)

```bash
# 1. Clone and navigate
git clone <repo> && cd DigiTrade

# 2. Bootstrap (one command, does everything)
./scripts/bootstrap.sh

# 3. Services running! Access:
# Frontend:     http://localhost:3000
# Auth API:     http://localhost:3001
# All Services: http://localhost:3XXX
```

## 📋 Essential Commands

```bash
# Development
yarn dev                    # Start all services
./scripts/dev.sh           # Same as above
yarn workspace @remit/auth-service dev  # Single service

# Building
yarn build                 # Build everything
yarn build:services        # Only services
yarn build:frontend        # Only frontend

# Database
yarn migrate:dev --name "description"  # Create migration
yarn migrate:deploy                    # Apply migrations
yarn workspace @remit/prisma studio    # Open Prisma UI

# Testing
yarn test                  # All tests
yarn test:cov             # With coverage
yarn test:watch --workspace=@remit/auth-service  # Watch mode

# Code Quality
yarn lint                  # Check linting
yarn format               # Auto-format code
yarn format:check         # Check formatting

# Docker
yarn docker:up            # Start infrastructure
yarn docker:down          # Stop infrastructure
yarn docker:logs          # View logs
```

## 🔍 Service Endpoints

| Service | Port | URL |
|---------|------|-----|
| Frontend | 3000 | http://localhost:3000 |
| Auth | 3001 | http://localhost:3001/api |
| User | 3002 | http://localhost:3002/api |
| Beneficiary | 3003 | http://localhost:3003/api |
| Quote | 3004 | http://localhost:3004/api |
| Compliance | 3005 | http://localhost:3005/api |
| Payment | 3006 | http://localhost:3006/api |
| Document | 3007 | http://localhost:3007/api |
| Notification | 3008 | http://localhost:3008/api |
| Admin | 3009 | http://localhost:3009/api |

## 🗄️ Infrastructure Access

```bash
# PostgreSQL
Host: localhost
Port: 5432
Database: digitrade
User: postgres
Password: postgres

# Redis
Host: localhost
Port: 6379
Password: (none by default)

# pgAdmin (Database UI)
URL: http://localhost:5050
Email: admin@digitrade.com
Password: admin

# Kafka UI
URL: http://localhost:8080

# Prisma Studio
yarn workspace @remit/prisma studio
```

## 🔐 Authentication Flow

```bash
# 1. Sign up
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Sign in (get token)
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass123!"
  }'

# Response: { accessToken, refreshToken, expiresIn }

# 3. Use token
curl http://localhost:3002/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📦 Adding Dependencies

```bash
# Add to specific workspace
yarn workspace @remit/auth-service add axios

# Add dev dependency
yarn workspace @remit/auth-service add -D @types/node

# Add to root (dev only)
yarn add -W -D prettier

# Add shared package to service
yarn workspace @remit/auth-service add @remit/shared-types
```

## 🐛 Troubleshooting

### "Port already in use"
```bash
# Kill process on port
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Database connection failed"
```bash
# Check PostgreSQL
docker-compose -f infrastructure/docker/docker-compose.yml logs postgres

# Reset database
docker-compose -f infrastructure/docker/docker-compose.yml down -v
docker-compose -f infrastructure/docker/docker-compose.yml up -d postgres
```

### "Dependencies missing"
```bash
# Reinstall everything
rm -rf node_modules && yarn install
```

### "Service won't start"
```bash
# Check service logs
yarn workspace @remit/auth-service dev 2>&1 | head -100

# Check environment variables
echo $DATABASE_URL
cat .env.local | grep DATABASE
```

## 📁 Project Structure Quick Guide

```
apps/               ← 10 microservices + frontend
packages/           ← Shared types, utils, prisma
infrastructure/     ← Docker, Kubernetes configs
scripts/            ← Bootstrap, dev, docker-build
```

## 🏗️ File Structure Per Service

```
apps/auth-service/
├── src/
│   ├── main.ts              ← Entry point
│   ├── app.module.ts        ← Root module
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   └── common/              ← Guards, decorators, etc
├── test/
├── dist/                    ← Compiled output
├── tsconfig.json
├── package.json
└── Dockerfile (optional)
```

## 🔄 Development Cycle

1. **Make changes** in service
2. **Hot-reload**: Automatic in watch mode
3. **Run tests**: `yarn test`
4. **Commit**: Changes reflected immediately

## 📚 Documentation

- **[README.md](./README.md)** - Overview & quick start
- **[MONOREPO.md](./MONOREPO.md)** - Full setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment
- **[STRUCTURE.md](./STRUCTURE.md)** - Project structure details

## 🚀 Production Checklist

- [ ] Update `.env.local` with production values
- [ ] Generate SSL certificates
- [ ] Set up backups
- [ ] Configure monitoring
- [ ] Run `yarn build`
- [ ] Build Docker images: `./scripts/docker-build.sh`
- [ ] Deploy: `docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d`
- [ ] Run migrations: `yarn migrate:deploy`
- [ ] Verify all services: `curl http://localhost:3XXX/health`

## 💡 Tips & Tricks

```bash
# View multiple service logs
yarn workspace @remit/auth-service dev &
yarn workspace @remit/user-service dev &

# Format on save (in VS Code)
# Settings > Editor: Format On Save

# Watch and rebuild
yarn workspace @remit/shared-types dev

# Clean build
rm -rf dist && yarn build

# Test specific file
yarn workspace @remit/auth-service test auth.service.spec

# Debug service
node --inspect-brk dist/apps/auth-service/main
```

## 🔗 Quick Links

- NestJS Docs: https://docs.nestjs.com
- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Kafka: https://kafka.apache.org
- PostgreSQL: https://www.postgresql.org/docs

## 📞 Support

- Check [MONOREPO.md](./MONOREPO.md) troubleshooting section
- View service logs: `docker logs container-name`
- Check database: Open pgAdmin at http://localhost:5050

---

**Remember**: `./scripts/bootstrap.sh` is your friend! 🎯
