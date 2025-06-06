# WSL Setup Guide

This guide walks you through installing and configuring Windows Subsystem for Linux (WSL) for optimal iWORKZ platform development.

---

## Overview

Set up a modern Linux development environment alongside Windows, making the most of WSL for fast, reliable workflows.

---

## Prerequisites

* Windows 10 version 2004 or newer (Build 19041+), or Windows 11

---

## Installation Steps

### 1. Enable WSL

Run as Administrator:

```powershell
wsl --install
```

### 2. Install Ubuntu Distribution

```powershell
wsl --install -d Ubuntu
```

### 3. Set Up Your Linux User

* Choose a username and password when prompted
* Update system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. Install Essential Development Tools

```bash
# Install Git, curl, wget, and build essentials
sudo apt install git curl wget build-essential -y

# Install Node.js (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 5. WSL Configuration

Create `/etc/wsl.conf` to enable systemd and optimise mounts:

```ini
[boot]
systemd=true

[automount]
enabled=true
options="metadata"
```

---

## Troubleshooting

* If WSL installation fails, enable required Windows features via "Windows Features" control panel
* Restart your computer after any major changes
* Use `wsl --shutdown` in PowerShell to restart WSL if services hang or updates require a full reset
