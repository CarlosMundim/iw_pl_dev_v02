# General Environment Setup Guide

This guide details the essential steps to set up a robust, productive development environment for the iWORKZ platform on Windows using WSL 2.

---

## Quick Start Checklist

* [ ] Install WSL 2 with Ubuntu (recommended: Ubuntu 22.04 LTS)
* [ ] Set up Git and generate SSH keys
* [ ] Configure PowerShell profile in Windows Terminal
* [ ] Install Visual Studio Code (VS Code) and key extensions (Remote - WSL, Docker, GitLens)
* [ ] Install Docker Desktop with WSL integration
* [ ] Clone the iWORKZ platform repository from your remote (e.g., GitHub)
* [ ] Complete development environment setup and initial dependency installs

---

## Development Workflow

1. **Edit Code in WSL:** Open the project folder in VS Code using the Remote - WSL extension for a native Linux dev experience.
2. **Version Control:** Use the WSL terminal (bash or zsh) for all Git operations.
3. **Docker Services:** Launch backend/frontend/services via `docker-compose` from WSL.
4. **Testing:** Run `npm` or `yarn` scripts inside WSL for automated/unit testing.
5. **Debugging:** Use VS Code’s debugger with workspace launch configurations (see `.vscode/launch.json`).

---

## Environment Variables

Create a `.env.local` file in each service directory as required. Example:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/iworkz
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# AI Services
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# External APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

> **Tip:** Never commit `.env.local` or secrets to your repository.

---

## File System Structure

```
Windows: C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\
WSL:     /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/
```

> **Recommendation:** Store your main project directory in the WSL filesystem (`/home/<user>/...`) for best performance.

---

## Performance Tips

1. **Work inside WSL:** Keep project code within the WSL filesystem to maximise speed and avoid file I/O bottlenecks.
2. **Docker Resources:** Allocate at least 8GB RAM (Settings > Resources) to Docker Desktop for smooth multi-service development.
3. **VS Code:** Use Remote - WSL and other recommended extensions for seamless workflow.
4. **Git:** Set line endings (`core.autocrlf=input`) to prevent issues with Windows/Linux compatibility.

---

## Backup Strategy

* **Code:** Always push to remote Git repositories (GitHub, Azure, etc.)
* **Database:** Schedule regular PostgreSQL backups/dumps.
* **Environment:** Document all configuration steps and keep backups of environment files.
* **Docker:** Export/import critical images as needed for disaster recovery.

---

## Security Considerations

* Store all API keys, secrets, and passwords only in environment files, never in code or version control.
* Use strong, unique passwords for all databases and services.
* Enable 2FA on GitHub and all relevant accounts.
* Apply operating system and dependency security updates regularly.

---

**For detailed documentation and troubleshooting, visit:**
[https://docs.docker.com/desktop/windows/wsl/](https://docs.docker.com/desktop/windows/wsl/)
