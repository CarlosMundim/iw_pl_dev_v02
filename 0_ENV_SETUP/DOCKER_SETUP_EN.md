# Docker Setup Guide

This guide will help you install and configure Docker Desktop on Windows with WSL 2, verify your setup, and use essential Docker commands for daily development.

---

## 1. Windows Installation

1. Download Docker Desktop: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Run the installer and select **“Enable WSL 2 backend”** during installation.
3. When prompted, allow the installer to install the required WSL 2 kernel update package.
4. After installation, **restart your computer** to complete setup.

---

## 2. WSL Integration

1. Launch **Docker Desktop** after reboot.
2. Go to **Settings** → **Resources** → **WSL Integration**.
3. Make sure your preferred WSL distribution (e.g., Ubuntu) is enabled for integration.
4. Click **Apply & Restart** if you change any settings.

---

## 3. Verify Installation

Open your terminal (e.g., Windows Terminal with Ubuntu/WSL) and run the following commands:

```bash
# Check Docker version
docker --version
docker-compose --version

# Test Docker functionality
docker run hello-world
```

* If “Hello from Docker!” appears, your installation is successful.

---

## 4. Docker Daemon Configuration (Optional, for advanced users)

To customise logging and performance, create a Docker daemon configuration in WSL:

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

* After making changes, restart Docker Desktop for the new settings to apply.

---

## 5. Common Docker Commands

```bash
# List all containers (including stopped)
docker ps -a

# List all images
docker images

# Remove unused containers, networks, and images
docker system prune -a

# View logs for a specific container
docker logs <container-name>

# Access a running container’s shell
docker exec -it <container-name> /bin/bash
```

---

## 6. Docker Compose Usage

```bash
# Start all services in the background
docker-compose up -d

# Stop all running services
docker-compose down

# View and follow logs for all services
docker-compose logs -f

# Rebuild services without using cache
docker-compose build --no-cache
```

---

## 7. Troubleshooting Tips

* Ensure **WSL 2** is properly installed and set as default version.
* Confirm **Docker Desktop** is running (check system tray).
* Verify WSL integration is enabled in Docker settings.
* If Docker is unresponsive, **restart Docker Desktop**.
* For persistent issues, check the official [Docker Desktop Troubleshooting Guide](https://docs.docker.com/desktop/troubleshoot/).

---

**For further assistance, visit the official Docker documentation:**
[https://docs.docker.com/desktop/windows/wsl/](https://docs.docker.com/desktop/windows/wsl/)
