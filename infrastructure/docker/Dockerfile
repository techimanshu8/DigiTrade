# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package.json yarn.lock ./

# Copy all workspaces
COPY apps ./apps
COPY packages ./packages
COPY tsconfig.base.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Build all services
RUN yarn build:services

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package.json yarn.lock ./

# Copy built applications from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Set user
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Default to auth service
CMD ["node", "dist/apps/auth-service/main"]
