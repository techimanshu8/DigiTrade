# Production Deployment Guide

## Overview

This guide covers deploying DigiTrade in production environments using Docker Compose or Kubernetes.

## Prerequisites

- Docker & Docker Compose (for Docker deployment)
- Kubernetes cluster (for K8s deployment)
- PostgreSQL backup strategy
- SSL/TLS certificates
- Monitoring and logging setup

## Environment Variables

Create `.env.prod` with production values:

```env
# Database
DATABASE_URL="postgresql://postgres:SECURE_PASSWORD@postgres:5432/digitrade"
DB_PASSWORD="SECURE_PASSWORD"

# Redis
REDIS_URL="redis://:SECURE_PASSWORD@redis:6379"
REDIS_PASSWORD="SECURE_PASSWORD"

# JWT
JWT_SECRET="VERY_LONG_SECURE_SECRET_KEY"

# Services
NEXT_PUBLIC_API_URL="https://api.digitrade.com"

# AWS
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.xxx"
```

## Docker Compose Deployment

### 1. Build Images

```bash
# Build all services
./scripts/docker-build.sh

# Tag for registry
docker tag digitrade/auth-service:latest myregistry/digitrade/auth-service:1.0.0
docker push myregistry/digitrade/auth-service:1.0.0
```

### 2. Deploy Stack

```bash
# Use production docker-compose
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d

# Verify services
docker-compose -f infrastructure/docker/docker-compose.prod.yml ps

# View logs
docker-compose -f infrastructure/docker/docker-compose.prod.yml logs -f
```

### 3. Database Setup

```bash
# Run migrations
docker-compose -f infrastructure/docker/docker-compose.prod.yml exec auth-service \
  yarn workspace @remit/prisma migrate:deploy

# Seed database (optional)
docker-compose -f infrastructure/docker/docker-compose.prod.yml exec auth-service \
  yarn workspace @remit/prisma seed
```

## Kubernetes Deployment

### 1. Create Namespace and Secrets

```bash
# Apply base configurations
kubectl apply -f infrastructure/kubernetes/base.yaml

# Create secrets
kubectl create secret generic digitrade-secrets \
  --from-literal=DB_PASSWORD='your-secure-password' \
  --from-literal=REDIS_PASSWORD='your-secure-password' \
  --from-literal=JWT_SECRET='your-jwt-secret' \
  -n digitrade

# Update DATABASE_URL secret
kubectl create secret generic database-url \
  --from-literal=DATABASE_URL='postgresql://postgres:password@postgres:5432/digitrade' \
  -n digitrade
```

### 2. Deploy Services

```bash
# Apply service deployments
kubectl apply -f infrastructure/kubernetes/services.yaml

# Check status
kubectl get all -n digitrade

# Monitor pods
kubectl logs -n digitrade -l app=auth-service -f
```

### 3. Database Migrations

```bash
# Create migration job
kubectl run migration \
  --image=digitrade/auth-service:latest \
  --rm -it \
  --restart=Never \
  -n digitrade \
  -- yarn migrate:deploy
```

## Scaling & Load Balancing

### Docker Compose

Update replicas in `docker-compose.prod.yml`:

```yaml
services:
  auth-service:
    deploy:
      replicas: 3
```

### Kubernetes

The services use HPA (Horizontal Pod Autoscaler). Update in `services.yaml`:

```yaml
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        averageUtilization: 70
```

## Database Backups

### PostgreSQL Backups

```bash
# Backup
docker-compose -f infrastructure/docker/docker-compose.prod.yml exec postgres \
  pg_dump -U postgres digitrade > backup.sql

# Restore
docker-compose -f infrastructure/docker/docker-compose.prod.yml exec postgres \
  psql -U postgres digitrade < backup.sql
```

### Automated Backups (Cron)

```bash
# Create backup script
cat > /usr/local/bin/backup-digitrade.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/digitrade"
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f /path/to/docker-compose.prod.yml exec -T postgres \
  pg_dump -U postgres digitrade | gzip > "$BACKUP_DIR/backup_$DATE.sql.gz"
# Keep last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-digitrade.sh

# Add to crontab
0 2 * * * /usr/local/bin/backup-digitrade.sh
```

## Monitoring & Logging

### Prometheus Metrics

Add to services:

```env
PROMETHEUS_PORT=9090
METRICS_ENABLED=true
```

### ELK Stack (Elasticsearch, Logstash, Kibana)

Update `docker-compose.prod.yml`:

```yaml
elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0

kibana:
  image: docker.elastic.co/kibana/kibana:8.0.0
```

### CloudWatch (AWS)

```env
CLOUDWATCH_LOG_GROUP=/digitrade/services
AWS_REGION=us-east-1
```

## SSL/TLS Configuration

### Generate Self-Signed Certificates (Development)

```bash
mkdir -p infrastructure/docker/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout infrastructure/docker/ssl/key.pem \
  -out infrastructure/docker/ssl/cert.pem
```

### Using Let's Encrypt (Production)

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificate
sudo certbot certonly --standalone -d api.digitrade.com

# Copy to docker
sudo cp /etc/letsencrypt/live/api.digitrade.com/fullchain.pem infrastructure/docker/ssl/cert.pem
sudo cp /etc/letsencrypt/live/api.digitrade.com/privkey.pem infrastructure/docker/ssl/key.pem

# Set permissions
sudo chown $USER infrastructure/docker/ssl/*.pem
```

## Health Checks

### Service Health

```bash
# Check individual service
curl http://localhost:3001/health

# All services
for port in 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
  echo "Port $port:"
  curl -s http://localhost:$port/health || echo "DOWN"
done
```

### Database Health

```bash
docker-compose -f infrastructure/docker/docker-compose.prod.yml exec postgres \
  pg_isready -U postgres
```

## Troubleshooting

### Service Not Starting

```bash
# Check logs
docker-compose -f infrastructure/docker/docker-compose.prod.yml logs auth-service

# Check environment
docker-compose -f infrastructure/docker/docker-compose.prod.yml exec auth-service \
  env | grep DATABASE
```

### Database Connection Issues

```bash
# Test connection
docker-compose -f infrastructure/docker/docker-compose.prod.yml exec postgres \
  psql -U postgres -d digitrade -c "SELECT 1"
```

### Memory Leaks

```bash
# Monitor memory usage
docker stats --no-stream

# View container memory
docker inspect auth-service --format='{{.State.Pid}}' | xargs -I {} ps aux | grep {}
```

## Updating Services

### Rolling Update

```bash
# Pull new images
docker pull myregistry/digitrade/auth-service:1.1.0

# Update service
docker-compose -f infrastructure/docker/docker-compose.prod.yml up -d auth-service

# Verify
docker-compose -f infrastructure/docker/docker-compose.prod.yml ps auth-service
```

### Kubernetes Rolling Update

```bash
# Update image
kubectl set image deployment/auth-service \
  auth-service=digitrade/auth-service:1.1.0 \
  -n digitrade

# Monitor rollout
kubectl rollout status deployment/auth-service -n digitrade
```

## Security Best Practices

1. **Secrets Management**
   - Use AWS Secrets Manager or HashiCorp Vault
   - Never commit `.env` files

2. **Network Security**
   - Use VPC/Network isolation
   - Enable firewall rules
   - Use private subnets for databases

3. **Access Control**
   - RBAC in Kubernetes
   - IAM roles in AWS
   - SSH key management

4. **Monitoring**
   - Enable audit logging
   - Monitor for anomalies
   - Set up alerts

## Support

For issues and questions, refer to:
- [MONOREPO.md](../MONOREPO.md)
- [NestJS Documentation](https://docs.nestjs.com)
- [Kubernetes Documentation](https://kubernetes.io/docs)
