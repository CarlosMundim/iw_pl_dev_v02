# VS Code Setup Guide

## Installation
Download from: https://code.visualstudio.com/

## Essential Extensions
```bash
# Install via command line
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

## Settings Configuration
Create `.vscode/settings.json` in project root:
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

## Workspace Configuration
Create `.vscode/launch.json`:
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

## WSL Integration
- Install "Remote - WSL" extension
- Open WSL terminal in VS Code: `Ctrl+Shift+`` 
- Open project in WSL: `code .` from WSL terminal