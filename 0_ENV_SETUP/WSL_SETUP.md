# WSL Setup Guide

## Overview
This guide helps you set up Windows Subsystem for Linux (WSL) for the iWORKZ Platform development environment.

## Prerequisites
- Windows 10 version 2004 and higher (Build 19041 and higher) or Windows 11

## Installation Steps

### 1. Enable WSL
```powershell
# Run as Administrator
wsl --install
```

### 2. Install Ubuntu Distribution
```powershell
wsl --install -d Ubuntu
```

### 3. Set up your Linux user
- Create username and password when prompted
- Update packages:
```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Install Essential Development Tools
```bash
# Install Git, curl, and other essentials
sudo apt install git curl wget build-essential -y

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 5. WSL Configuration
Create `/etc/wsl.conf`:
```ini
[boot]
systemd=true

[automount]
enabled=true
options="metadata"
```

## Troubleshooting
- If WSL installation fails, enable Windows features manually
- Restart computer after major changes
- Use `wsl --shutdown` to restart WSL if needed