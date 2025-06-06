# Gitワークフローガイド

## ブランチ戦略

本プロジェクトでは、継続的デプロイを最適化した独自Git Flow戦略を採用しています。

### ブランチ種別

* **main**：本番リリース用コード
* **develop**：新機能統合用ブランチ
* **feature/**\*：新機能や拡張開発
* **bugfix/**\*：develop用のバグ修正
* **hotfix/**\*：本番向けクリティカル修正
* **release/**\*：リリース準備

### ブランチ命名規則

```bash
# 機能追加
feature/user-authentication
feature/ai-matching-algorithm
feature/mobile-app-onboarding

# バグ修正
bugfix/login-redirect-issue
bugfix/database-connection-timeout

# ホットフィックス
hotfix/security-vulnerability-fix
hotfix/payment-processing-error

# リリース
release/v1.2.0
release/v1.2.1
```

---

## ワークフロープロセス

### 機能開発

```bash
# 1. developブランチから開始
git checkout develop
git pull origin develop

# 2. 機能ブランチを作成
git checkout -b feature/new-matching-algorithm

# 3. 適宜コミットしながら作業
git add .
git commit -m "feat: add initial matching algorithm structure"
git commit -m "feat: implement skill-based matching logic"
git commit -m "test: add unit tests for matching algorithm"

# 4. 機能ブランチをプッシュ
git push origin feature/new-matching-algorithm

# 5. developへのプルリクエストを作成
# 6. レビュー＆承認後developへマージ
# 7. 機能ブランチを削除
git branch -d feature/new-matching-algorithm
```

### リリースプロセス

```bash
# 1. developからリリースブランチを作成
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. バージョンやチェンジログを更新
# 3. リリース候補のテスト
# 4. mainへのPRを作成
# 5. 承認後mainへマージ
# 6. リリースタグ作成
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0

# 7. developへマージ
git checkout develop
git merge release/v1.2.0
```

### ホットフィックスプロセス

```bash
# 1. mainからホットフィックス作成
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. 修正内容をコミット
git commit -m "fix: resolve critical security vulnerability"

# 3. mainへのPRを作成
# 4. 承認後mainへマージ＆タグ付け
git tag -a v1.2.1 -m "Hotfix version 1.2.1"

# 5. developへマージ
git checkout develop
git merge hotfix/critical-security-fix
```

---

## コミットメッセージ規則

Conventional Commits仕様を採用しています。

### フォーマット

```
type(scope): description

[optional body]

[optional footer]
```

### 種別

* **feat**：新機能追加
* **fix**：バグ修正
* **docs**：ドキュメント修正
* **style**：コードスタイル・整形等
* **refactor**：リファクタリング
* **test**：テスト追加・修正
* **chore**：メンテナンス作業

### 例

```bash
feat(auth): OAuth2認証を追加
fix(api): DB接続タイムアウト修正
docs(readme): インストール手順を更新
style(frontend): Reactコンポーネントを整形
refactor(matching): アルゴリズムを最適化
test(api): ユーザーエンドポイントの統合テスト追加
chore(deps): Node.js依存パッケージ更新
```

---

## プルリクエストガイドライン

### PRテンプレート

```markdown
## 概要
変更内容の簡単な説明

## 変更種別
- [ ] バグ修正
- [ ] 新機能
- [ ] 互換性のない変更
- [ ] ドキュメント更新

## テスト
- [ ] ユニットテストOK
- [ ] 統合テストOK
- [ ] 手動テスト実施済

## スクリーンショット（該当する場合）
UI変更の画像を添付

## チェックリスト
- [ ] コードがスタイルガイドに準拠
- [ ] セルフレビュー完了
- [ ] ドキュメント更新済
- [ ] マージ競合なし
```

### レビュープロセス

1. **自動チェック**：CI/CDパイプラインが通過していること
2. **コードレビュー**：最低1名がレビュー
3. **テスト**：すべてのテストが通過
4. **ドキュメント**：必要に応じて更新
5. **承認**：マージには承認が必須

---

## Gitフック

### pre-commitフック

```bash
#!/bin/sh
# コミット前にリント・ユニットテストを実行
npm run lint
npm run test:unit
```

### pre-pushフック

```bash
#!/bin/sh
# プッシュ前にフルテスト＆ビルド実行
npm run test
npm run build
```

---

## ベストプラクティス

1. **小さなコミット**：原子性・集中したコミットを心がける
2. **明確なメッセージ**：分かりやすいコミットメッセージ
3. **定期的なプッシュ**：作業内容を頻繁にバックアップ
4. **履歴の整理**：インタラクティブリベースでクリーンアップ
5. **直接プッシュ禁止**：必ずプルリクエスト経由でマージ
6. **最新状態維持**：定期的にupstreamと同期
