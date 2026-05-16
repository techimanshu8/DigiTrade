#!/bin/bash

# DigiTrade Development Server
# Starts all services in development mode

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting DigiTrade Development Environment${NC}\n"

# Check if Docker services are running
echo -e "${YELLOW}Checking Docker services...${NC}"
docker-compose -f infrastructure/docker/docker-compose.yml ps | grep -q "postgres" || {
    echo -e "${YELLOW}Starting Docker services...${NC}"
    docker-compose -f infrastructure/docker/docker-compose.yml up -d
    sleep 3
}

# Start all services in watch mode
echo -e "${GREEN}Starting services...${NC}\n"

# Create a temporary directory for pids
PIDS_FILE="/tmp/digitrade-pids"
mkdir -p "$PIDS_FILE"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    kill $(cat "$PIDS_FILE"/* 2>/dev/null) 2>/dev/null || true
    rm -rf "$PIDS_FILE"
}

trap cleanup EXIT

# Start auth service
echo -e "${GREEN}▶ Starting Auth Service (port 3001)${NC}"
yarn workspace @remit/auth-service dev > /tmp/auth-service.log 2>&1 &
echo $! > "$PIDS_FILE/auth-service"

# Start user service
echo -e "${GREEN}▶ Starting User Service (port 3002)${NC}"
yarn workspace @remit/user-service dev > /tmp/user-service.log 2>&1 &
echo $! > "$PIDS_FILE/user-service"

# Start beneficiary service
echo -e "${GREEN}▶ Starting Beneficiary Service (port 3003)${NC}"
yarn workspace @remit/beneficiary-service dev > /tmp/beneficiary-service.log 2>&1 &
echo $! > "$PIDS_FILE/beneficiary-service"

# Start quote service
echo -e "${GREEN}▶ Starting Quote Service (port 3004)${NC}"
yarn workspace @remit/quote-service dev > /tmp/quote-service.log 2>&1 &
echo $! > "$PIDS_FILE/quote-service"

# Start compliance service
echo -e "${GREEN}▶ Starting Compliance Service (port 3005)${NC}"
yarn workspace @remit/compliance-service dev > /tmp/compliance-service.log 2>&1 &
echo $! > "$PIDS_FILE/compliance-service"

# Start payment orchestrator
echo -e "${GREEN}▶ Starting Payment Orchestrator (port 3006)${NC}"
yarn workspace @remit/payment-orchestrator dev > /tmp/payment-orchestrator.log 2>&1 &
echo $! > "$PIDS_FILE/payment-orchestrator"

# Start document service
echo -e "${GREEN}▶ Starting Document Service (port 3007)${NC}"
yarn workspace @remit/document-service dev > /tmp/document-service.log 2>&1 &
echo $! > "$PIDS_FILE/document-service"

# Start notification service
echo -e "${GREEN}▶ Starting Notification Service (port 3008)${NC}"
yarn workspace @remit/notification-service dev > /tmp/notification-service.log 2>&1 &
echo $! > "$PIDS_FILE/notification-service"

# Start admin service
echo -e "${GREEN}▶ Starting Admin Service (port 3009)${NC}"
yarn workspace @remit/admin-service dev > /tmp/admin-service.log 2>&1 &
echo $! > "$PIDS_FILE/admin-service"

# Start frontend
echo -e "${GREEN}▶ Starting Frontend (port 3000)${NC}"
yarn workspace @remit/frontend dev > /tmp/frontend.log 2>&1 &
echo $! > "$PIDS_FILE/frontend"

echo -e "\n${GREEN}✅ All services started!${NC}\n"
echo -e "${YELLOW}📱 Access points:${NC}"
echo -e "  Frontend:     http://localhost:3000"
echo -e "  Auth API:     http://localhost:3001/api"
echo -e "  User API:     http://localhost:3002/api"
echo -e "  Beneficiary:  http://localhost:3003/api"
echo -e "  Quote API:    http://localhost:3004/api"
echo -e "  Compliance:   http://localhost:3005/api"
echo -e "  Payment:      http://localhost:3006/api"
echo -e "  Document:     http://localhost:3007/api"
echo -e "  Notification: http://localhost:3008/api"
echo -e "  Admin:        http://localhost:3009/api"
echo -e "  Kafka UI:     http://localhost:8080"
echo -e "  PgAdmin:      http://localhost:5050\n"

echo -e "${YELLOW}📋 View logs:${NC}"
echo -e "  tail -f /tmp/auth-service.log"
echo -e "  tail -f /tmp/frontend.log\n"

echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Wait for all processes
wait
