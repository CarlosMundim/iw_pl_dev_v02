# VS Code Setup Guide

This guide explains how to install Visual Studio Code (VS Code), add essential extensions, configure recommended settings, and enable a productive environment for the iWORKZ platform.

---

## Installation

* Download and install VS Code from: [https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## Essential Extensions

Install these recommended extensions for web, TypeScript, and container development:

```bash
code --install-extension ms-vscode-remote.remote-wsl
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode-remote.remote-containers
code --install-extension GitHub.github-vscode-theme
code --install-extension PKief.material-icon-theme
```

---

## Settings Configuration

Create a `.vscode/settings.json` file in your project root with these recommended options:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

---

## Workspace Configuration

Create `.vscode/launch.json` to enable debugging and workflow support:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

---

## WSL Integration

* Install the "Remote - WSL" extension for seamless Linux development.
* Open the WSL terminal in VS Code with \`Ctrl+Shift+\`\`.
* To open a project in WSL, use `code .` from your WSL terminal.

---

> **Tip:** For best results, always keep VS Code and your extensions up to date, and use `.vscode` workspace settings for team consistency.
