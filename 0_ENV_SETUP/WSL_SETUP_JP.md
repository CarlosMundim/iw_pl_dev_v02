# WSLセットアップガイド

このガイドでは、iWORKZプラットフォーム開発のためのWindows Subsystem for Linux（WSL）のインストール・設定手順を解説します。

---

## 概要

WSLを活用して、Windows環境で高速かつ信頼性の高いLinux開発環境を構築します。

---

## 前提条件

* Windows 10（バージョン2004以降／ビルド19041以降）、またはWindows 11

---

## インストール手順

### 1. WSLの有効化

管理者権限で以下を実行：

```powershell
wsl --install
```

### 2. Ubuntuディストリビューションのインストール

```powershell
wsl --install -d Ubuntu
```

### 3. Linuxユーザーのセットアップ

* ユーザー名とパスワードを設定
* パッケージを最新化：

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. 開発ツールのインストール

```bash
# Git、curl、wget、build-essentialなど必須ツール
sudo apt install git curl wget build-essential -y

# Node.js（NodeSource経由）
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Dockerのインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 5. WSLの構成

systemd有効化とマウント最適化のため `/etc/wsl.conf` を作成：

```ini
[boot]
systemd=true

[automount]
enabled=true
options="metadata"
```

---

## トラブルシューティング

* WSLのインストールに失敗した場合は「Windowsの機能の有効化」から必要機能を手動でオンにしてください
* 大きな変更後はPCを再起動
* サービス停止や更新時はPowerShellで`wsl --shutdown`を実行しWSLを再起動
