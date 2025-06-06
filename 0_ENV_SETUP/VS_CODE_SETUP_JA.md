# VS Codeセットアップガイド

このガイドでは、Visual Studio Code（VS Code）のインストール方法、必須拡張機能の導入、推奨設定・ワークスペース構成、およびiWORKZ開発向けの生産的な環境構築手順を解説します。

---

## インストール

* 公式サイトからVS Codeをダウンロード・インストール：[https://code.visualstudio.com/](https://code.visualstudio.com/)

---

## 必須拡張機能

Web・TypeScript・コンテナ開発に推奨される拡張機能を以下コマンドで導入してください：

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

## 設定ファイル

プロジェクトルートに`.vscode/settings.json`ファイルを作成し、以下の推奨オプションを設定してください：

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

## ワークスペース構成

デバッグや開発ワークフローをサポートするため、`.vscode/launch.json`を作成します：

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

## WSL連携

* 「Remote - WSL」拡張機能を導入し、Linux開発をシームレスに実現します。
* VS Code上でWSLターミナルを\`Ctrl+Shift+\`\`で起動。
* プロジェクトディレクトリでWSLターミナルから`code .`でVS Codeを開きます。

---

> **ヒント：** VS Codeおよび拡張機能は常に最新版にアップデートし、`.vscode`ワークスペース設定を活用してチームの設定統一を図りましょう。
