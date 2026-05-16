# DigiTrade Runbook: Local Development

This guide outlines the step-by-step process required to compile, configure, and start the DigiTrade monorepo on your local development machine.

## Prerequisites

1. **Node.js (>=20.0.0)**
2. **Yarn (v4 / Berry)**
   ```bash
   corepack enable && yarn set version stable
   ```
3. **Docker & Docker Compose** (for running PostgreSQL, Redis, and Kafka)

---

## Step 1: Environment Variables

Ensure you have a `.env` file at the root of the workspace. You can copy the template if one exists, or use the following minimal variables required to boot the applications:

```env
# Postgres
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/digitrade?schema=public"

# Kafka
KAFKA_BROKER="localhost:29092"

# JWT Config (Auth)
JWT_SECRET="super-secret-local-key"
JWT_EXPIRE_IN="7d"

# S3 / Minio (Document Service)
AWS_REGION="ap-south-1"
AWS_ACCESS_KEY_ID="test"
AWS_SECRET_ACCESS_KEY="test"
AWS_S3_BUCKET="digitrade-docs-local"
# AWS_S3_ENDPOINT="http://localhost:9000" # Uncomment if using local Minio

# Ports
API_GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
USER_SERVICE_PORT=3002
DOCUMENT_SERVICE_PORT=3007

# Service URLs for API Gateway
AUTH_SERVICE_URL="http://localhost:3001"
USER_SERVICE_URL="http://localhost:3002"
DOCUMENT_SERVICE_URL="http://localhost:3007"
```

> Note: To ensure Next.js and NestJS microservices can all read these configurations, store this file as `.env` at the project root.

---

## Step 2: Boot Local Infrastructure

We rely on Docker to spin up PostgreSQL, Redis, Zookeeper, and Kafka.

```bash
yarn docker:up
```

You can optionally monitor the status of the containers:
```bash
yarn docker:logs
```

Wait until you see that PostgreSQL is ready to accept connections and Kafka broker ID 1 is registered in Zookeeper.

---

## Step 3: Install Dependencies & Bootstrap

Use the bootstrap script to resolve packages and generate the Prisma Client for your local operating system architecture.

```bash
yarn bootstrap
```

---

## Step 4: Run Database Migrations

Apply the Prisma schema models to your local PostgreSQL instance:

```bash
yarn workspace @remit/prisma prisma migrate dev --name init
```

If you need to seed initial admin users or data, you can run:
```bash
yarn seed
```
*(Optionally view the database tables via `yarn workspace @remit/prisma prisma studio`)*

---

## Step 5: Compile the Monorepo (Optional but recommended)

To verify that there are no hidden type errors across your backend microservices and frontend application, run a complete monorepo build:

```bash
yarn build
```

---

## Step 6: Start the Development Servers

You can start the backend services concurrently using the built-in yarn workspace commands:

```bash
# Start all microservices in watch mode
yarn dev:services
```

In a separate terminal, start the API Gateway:
```bash
yarn workspace @remit/api-gateway dev
```

In another terminal, start the Frontend:
```bash
yarn dev:frontend
```

### Accessing the System

* **Frontend**: `http://localhost:3000` (or the port defined by Next.js)
* **API Gateway**: `http://localhost:3000/api` (Resolves upstream to microservices)
* **Auth Service Docs (Swagger)**: `http://localhost:3001/docs`
* **User Service Docs (Swagger)**: `http://localhost:3002/docs`
* **Document Service Docs (Swagger)**: `http://localhost:3007/docs`
* **Kafka UI**: `http://localhost:8080`
* **pgAdmin**: `http://localhost:5050` (Login: `admin@digitrade.com` / `admin`)
