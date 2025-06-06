# Dockerセットアップガイド

このガイドは、Windows上でDocker DesktopとWSL 2をインストール・設定し、動作確認および日常的な開発で使う基本コマンドを解説します。

---

## 1. Windowsへのインストール

1. Docker Desktopをダウンロード：[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. インストーラー実行時、「**WSL 2 バックエンドを有効化**」を選択します。
3. 必要に応じて、WSL 2カーネルのアップデートパッケージのインストールを許可します。
4. インストール後、**パソコンを再起動**してください。

---

## 2. WSL連携の設定

1. 再起動後、**Docker Desktop**を起動します。
2. 「**Settings（設定）**」→「**Resources**」→「**WSL Integration**」へ進みます。
3. 使用するWSLディストリビューション（例：Ubuntu）が有効になっていることを確認します。
4. 設定変更後は「**Apply & Restart**」をクリックしてください。

---

## 3. インストール確認

ターミナル（例：Windows TerminalのUbuntu/WSL）を開き、次のコマンドを実行します：

```bash
# Dockerバージョン確認
docker --version
docker-compose --version

# Docker動作確認
docker run hello-world
```

* 「Hello from Docker!」と表示されれば、インストール成功です。

---

## 4. Dockerデーモン設定（上級者向け・オプション）

ログやパフォーマンスをカスタマイズしたい場合、WSL内でdaemon設定ファイルを作成します：

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
```

* 設定後、Docker Desktopを再起動してください。

---

## 5. よく使うDockerコマンド

```bash
# すべてのコンテナ一覧（停止中含む）
docker ps -a

# イメージ一覧
docker images

# 未使用のコンテナ、ネットワーク、イメージを削除
docker system prune -a

# 特定コンテナのログ表示
docker logs <container-name>

# 起動中のコンテナのシェルにアクセス
docker exec -it <container-name> /bin/bash
```

---

## 6. Docker Composeの使い方

```bash
# すべてのサービスをバックグラウンドで起動
docker-compose up -d

# すべてのサービスを停止
docker-compose down

# すべてのサービスのログをフォロー
docker-compose logs -f

# キャッシュを使わずサービスを再ビルド
docker-compose build --no-cache
```

---

## 7. トラブルシューティングのポイント

* **WSL 2**が正しくインストールされ、デフォルトバージョンになっているか確認
* **Docker Desktop**が実行中か（タスクトレイを確認）
* Docker設定でWSL連携が有効になっているか確認
* Dockerが反応しない場合は**Docker Desktopを再起動**
* 詳細なトラブル対応は公式の[Docker Desktopトラブルシューティングガイド](https://docs.docker.com/desktop/troubleshoot/)を参照

---

**公式ドキュメントはこちら：**
[https://docs.docker.com/desktop/windows/wsl/](https://docs.docker.com/desktop/windows/wsl/)
