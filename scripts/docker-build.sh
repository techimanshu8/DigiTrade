#!/bin/bash

# DigiTrade Docker Build and Push Script
# Builds and pushes Docker images to registry

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
REGISTRY="${REGISTRY:-digitrade}"
VERSION="${VERSION:-latest}"
BUILD_SERVICES="${BUILD_SERVICES:-all}"

echo -e "${GREEN}🐳 DigiTrade Docker Build${NC}\n"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Build function
build_service() {
    local SERVICE=$1
    local DOCKERFILE=$2
    local TAG="${REGISTRY}/${SERVICE}:${VERSION}"
    
    echo -e "${YELLOW}Building ${SERVICE}...${NC}"
    docker build -f "$DOCKERFILE" -t "$TAG" .
    
    if [ -z "$REGISTRY" ] || [ "$REGISTRY" = "digitrade" ]; then
        echo -e "${GREEN}✓ Built ${TAG}${NC}"
    else
        echo -e "${GREEN}✓ Built and ready to push: ${TAG}${NC}"
    fi
}

# Build all services
if [ "$BUILD_SERVICES" = "all" ] || [ "$BUILD_SERVICES" = "services" ]; then
    build_service "auth-service" "infrastructure/docker/Dockerfile"
fi

if [ "$BUILD_SERVICES" = "all" ] || [ "$BUILD_SERVICES" = "frontend" ]; then
    build_service "frontend" "infrastructure/docker/Dockerfile.frontend"
fi

echo -e "\n${GREEN}✅ Build complete!${NC}\n"

if [ ! -z "$REGISTRY" ] && [ "$REGISTRY" != "digitrade" ]; then
    echo -e "${YELLOW}📤 To push images to registry:${NC}"
    echo -e "  docker push ${REGISTRY}/auth-service:${VERSION}"
    echo -e "  docker push ${REGISTRY}/frontend:${VERSION}\n"
fi
