# WSL Setup Guide

This guide helps you set up Windows Subsystem for Linux (WSL) for an optimal iWORKZ Platform development environment.

---

## Overview

This guide helps you set up Windows Subsystem for Linux (WSL) for the iWORKZ Platform development environment.

---

## Prerequisites

* Windows 10 version 2004 or higher (Build 19041+), or Windows 11

---

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

### 3. Set Up Your Linux User

* When prompted, create a Linux username and password.
* Update your system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Install Essential Development Tools

```bash
# Install Git, curl, and build tools
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

Create `/etc/wsl.conf` for system enhancements:

```ini
[boot]
systemd=true

[automount]
enabled=true
options="metadata"
```

---

## Troubleshooting

* If WSL installation fails, ensure Windows features (WSL & Virtual Machine Platform) are enabled in Windows Features.
* Restart your computer after major changes.
* Use `wsl --shutdown` to fully restart WSL if issues persist.
