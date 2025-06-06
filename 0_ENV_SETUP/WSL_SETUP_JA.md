# WSLセットアップガイド

このガイドでは、iWORKZプラットフォーム開発環境向けにWindows Subsystem for Linux（WSL）の最適なセットアップ手順を解説します。

---

## 概要

このガイドは、iWORKZプラットフォームのためにWindows Subsystem for Linux（WSL）をセットアップする方法をまとめています。

---

## 前提条件

* Windows 10 バージョン2004以降（ビルド19041以上）、またはWindows 11

---

## インストール手順

### 1. WSLの有効化

```powershell
# 管理者として実行
wsl --install
```

### 2. Ubuntuディストリビューションのインストール

```powershell
wsl --install -d Ubuntu
```

### 3. Linuxユーザーのセットアップ

* プロンプトに従い、ユーザー名とパスワードを作成します。
* パッケージを最新化：

```bash
sudo apt update && sudo apt upgrade -y
```

### 4. 必須開発ツールのインストール

```bash
# Git、curl、build-essentialのインストール
sudo apt install git curl wget build-essential -y

# Node.js（NodeSource経由）
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Dockerのインストール
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 5. WSLの設定

システム拡張用に`/etc/wsl.conf`を作成：

```ini
[boot]
systemd=true

[automount]
enabled=true
options="metadata"
```

---

## トラブルシューティング

* WSLのインストールに失敗する場合は、Windowsの「Windowsの機能の有効化または無効化」でWSLおよび仮想マシンプラットフォームが有効か確認
* 主要な変更後はPCを再起動
* 問題が解決しない場合は`wsl --shutdown`でWSLを完全に再起動
