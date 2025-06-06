# Git Setup Guide

This guide covers recommended global configuration, SSH setup, common aliases, and initial repository setup for iWORKZ development.

---

## Global Configuration

Set your user information, preferred default branch, and default editor:

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Set default editor (Visual Studio Code)
git config --global core.editor "code --wait"
```

---

## SSH Key Setup

Generate and add a secure SSH key for Git operations:

```bash
# Generate SSH key (recommended: ed25519)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/id_ed25519

# Show public key (copy to clipboard and add to GitHub/GitLab, etc.)
cat ~/.ssh/id_ed25519.pub
```

---

## Useful Git Aliases

Set common aliases to streamline daily workflows:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

---

## Repository Setup

Clone and configure the iWORKZ platform repository:

```bash
# Clone the iWORKZ platform repository
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# If working from a fork, set up upstream to sync with the original repository
git remote add upstream git@github.com:original-org/iworkz-platform.git
```

---

> **Tip:** Always use SSH keys (not HTTPS) for private repositories. Never commit `.env` files or secrets to version control.
