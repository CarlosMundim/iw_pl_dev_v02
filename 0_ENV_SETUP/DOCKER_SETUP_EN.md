# Docker Setup Guide

## Windows Installation
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop
2. Enable WSL 2 backend during installation
3. Restart computer after installation

## WSL Integration
1. Open Docker Desktop
2. Go to Settings > Resources > WSL Integration
3. Enable integration with your WSL distribution

## Verify Installation
```bash
# Check Docker version
docker --version
docker-compose --version

# Test Docker
docker run hello-world
```

## Docker Configuration
Create daemon configuration in WSL:
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
```

## Common Docker Commands
```bash
# List containers
docker ps -a

# List images
docker images

# Remove unused containers and images
docker system prune -a

# View logs
docker logs <container-name>

# Execute commands in running container
docker exec -it <container-name> /bin/bash
```

## Docker Compose Usage
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild services
docker-compose build --no-cache
```

## Troubleshooting
- Ensure WSL 2 is properly configured
- Check Docker Desktop is running
- Verify WSL integration is enabled
- Restart Docker Desktop if needed
