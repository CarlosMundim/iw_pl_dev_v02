# 一般的な開発環境セットアップガイド

このガイドは、WSL 2を用いてWindows上でiWORKZプラットフォームの堅牢かつ生産的な開発環境を構築するための基本手順を詳しく解説します。

---

## クイックスタート・チェックリスト

* [ ] Ubuntu（推奨：Ubuntu 22.04 LTS）でWSL 2をインストール
* [ ] GitのセットアップとSSH鍵の生成
* [ ] Windows TerminalでPowerShellプロファイルを設定
* [ ] Visual Studio Code（VS Code）と主要拡張機能（Remote - WSL、Docker、GitLens）をインストール
* [ ] Docker DesktopをWSL連携でインストール
* [ ] iWORKZプラットフォームのリポジトリをリモート（例：GitHub）からクローン
* [ ] 開発環境セットアップおよび初期依存パッケージのインストール

---

## 開発ワークフロー

1. **WSLでコード編集**：VS CodeのRemote - WSL拡張でプロジェクトフォルダを開き、Linuxネイティブの開発体験を実現
2. **バージョン管理**：すべてのGit操作はWSL端末（bashまたはzsh）で実施
3. **Dockerサービス**：`docker-compose`でバックエンド／フロントエンド等のサービスをWSLから起動
4. **テスト**：WSL内で`npm`または`yarn`スクリプトを実行し自動テスト／単体テストを実施
5. **デバッグ**：VS Codeのデバッガをワークスペースのlaunch設定（.vscode/launch.json）で活用

---

## 環境変数

各サービスディレクトリに`.env.local`ファイルを作成してください（例）：

```bash
# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/iworkz
REDIS_URL=redis://localhost:6379

# 認証
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# AIサービス
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# 外部API
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

> **ヒント：** `.env.local`や機密情報は絶対にリポジトリへコミットしないでください。

---

## ファイルシステム構成

```
Windows: C:\Users\Carlos\OneDrive\Desktop\iw_pl_dev_v02\
WSL:     /mnt/c/Users/Carlos/OneDrive/Desktop/iw_pl_dev_v02/
```

> **推奨：** プロジェクト本体はWSLファイルシステム（`/home/<user>/...`）内に保存すると最高のパフォーマンスが得られます。

---

## パフォーマンステクニック

1. **WSL内で作業**：コードはWSL内に置くことで速度とファイルI/O効率が大幅アップ
2. **Dockerリソース**：Docker Desktopの設定でRAMを最低8GB割り当てると安定稼働
3. **VS Code**：Remote - WSLなどの推奨拡張を活用しシームレスな開発
4. **Git**：行末コード（`core.autocrlf=input`）を設定しWin/Linux間の不具合防止

---

## バックアップ戦略

* **コード**：必ずリモートGitリポジトリ（GitHub、Azureなど）へプッシュ
* **データベース**：PostgreSQLの定期バックアップ／ダンプを実施
* **環境**：すべての設定手順をドキュメント化し、環境ファイルも安全に保管
* **Docker**：重要なイメージはエクスポート／インポートで災害対策

---

## セキュリティ上の注意

* APIキー・シークレット・パスワードは環境ファイルのみに保存し、コードやバージョン管理には絶対に含めない
* すべてのDBやサービスに強力でユニークなパスワードを設定
* GitHub等すべてのアカウントで2段階認証（2FA）を有効化
* OSや依存ライブラリのセキュリティアップデートを定期的に適用

---

**詳細な公式ドキュメント・トラブルシューティングはこちら：**
[https://docs.docker.com/desktop/windows/wsl/](https://docs.docker.com/desktop/windows/wsl/)
