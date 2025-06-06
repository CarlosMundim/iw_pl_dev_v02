# Gitセットアップガイド

このガイドは、iWORKZ開発向けの推奨グローバル設定、SSHキーのセットアップ、便利なエイリアス、リポジトリ初期設定についてまとめています。

---

## グローバル設定

ユーザー情報、デフォルトブランチ、エディタを設定します。

```bash
# ユーザー名・メールアドレスの設定
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# デフォルトブランチ名をmainに設定
git config --global init.defaultBranch main

# デフォルトエディタ（Visual Studio Code）を設定
git config --global core.editor "code --wait"
```

---

## SSHキーのセットアップ

安全なSSHキーを生成し、Git操作用に登録します。

```bash
# SSHキーを生成（推奨: ed25519）
ssh-keygen -t ed25519 -C "your.email@example.com"

# ssh-agentを起動
eval "$(ssh-agent -s)"

# 鍵をエージェントに追加
ssh-add ~/.ssh/id_ed25519

# 公開鍵を表示（クリップボードへコピーし、GitHub/GitLab等へ登録）
cat ~/.ssh/id_ed25519.pub
```

---

## よく使うGitエイリアス

日常作業を効率化するための便利なエイリアス例：

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

## リポジトリ初期設定

iWORKZプラットフォームのリポジトリをクローンし、必要に応じてupstreamを追加します。

```bash
# iWORKZプラットフォームのリポジトリをクローン
git clone git@github.com:your-org/iworkz-platform.git
cd iworkz-platform

# フォーク運用の場合、オリジナルリポジトリのupstreamを追加
git remote add upstream git@github.com:original-org/iworkz-platform.git
```

---

> **ヒント：** プライベートリポジトリにはHTTPSではなくSSHキーを使用してください。`.env`ファイルや機密情報はバージョン管理に絶対コミットしないでください。
