# PowerShellセットアップガイド

このガイドでは、PowerShell Coreのインストール方法、Windows Terminalの設定、便利なモジュール追加、開発者向けプロファイルカスタマイズ手順を解説します。

---

## PowerShell Coreのインストール

* 公式リリースページからダウンロード：[https://github.com/PowerShell/PowerShell/releases](https://github.com/PowerShell/PowerShell/releases)
* Windows用インストール手順に従ってセットアップしてください。

---

## Windows Terminalのセットアップ

1. Microsoft StoreからWindows Terminalをインストールします。
2. Windows Terminalを起動し、下矢印 > \[設定]を選択。
3. デフォルトプロファイルをPowerShell（PowerShell Core）に設定します。
4. 外観やキーボードショートカットは好みに合わせてカスタマイズ可能です。

---

## 基本モジュールのインストール

開発効率を上げるため、以下のモジュールを導入しましょう：

```powershell
# コマンドライン拡張
Install-Module -Name PSReadLine -Force
Install-Module -Name Terminal-Icons -Force
Install-Module -Name z -Force

# Docker管理
Install-Module -Name DockerMsftProvider -Force
```

---

## プロファイル設定

エイリアスや関数を使いやすく設定するには、PowerShellプロファイルを作成／編集します：

```powershell
# プロファイルの有無を確認
Test-Path $PROFILE

# 存在しなければ新規作成
if (!(Test-Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force
}

# プロファイルを編集
notepad $PROFILE
```

より快適な開発体験のため、プロファイルに以下を追加：

```powershell
# モジュール読み込み
Import-Module Terminal-Icons
Import-Module z

# PSReadLineオプション設定
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle ListView

# エイリアス
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name grep -Value Select-String

# 関数
function Get-GitStatus { git status }
Set-Alias -Name gs -Value Get-GitStatus
```

---

## WSL連携

PowerShellからWSLやLinuxコマンドを直接使う方法：

```powershell
# WSLシェルの起動
wsl

# PowerShellからLinuxコマンド実行
wsl ls -la
wsl git status
```

---

> **ヒント：** 最新の機能を活用するため、PowerShell・Windows Terminal・各種モジュールは定期的にアップデートしましょう。
