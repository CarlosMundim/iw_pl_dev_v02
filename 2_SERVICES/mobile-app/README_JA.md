# モバイルアプリ

## 概要

React Nativeで開発されたiOSおよびAndroid向けのクロスプラットフォーム・モバイルアプリケーションです。

## 技術スタック

* **フレームワーク**: React Native 0.72+
* **言語**: TypeScript
* **ナビゲーション**: React Navigation 6
* **状態管理**: Redux Toolkit + RTK Query
* **スタイリング**: Styled Components + React Native Paper
* **プッシュ通知**: Firebase Cloud Messaging
* **アナリティクス**: Firebase Analytics

## 開発セットアップ

```bash
# 依存関係のインストール
npm install

# iOSセットアップ（macOSのみ）
cd ios && pod install && cd ..

# Metroバンドラー起動
npm start

# iOSシミュレーターで実行
npm run ios

# Androidエミュレーターで実行
npm run android

# APK生成
npm run build:android

# IPA生成
npm run build:ios
```

## 主な機能

* React Nativeによるネイティブパフォーマンス
* オフラインファースト設計
* プッシュ通知対応
* 生体認証対応
* カメラ・ファイルアクセス
* リアルタイムメッセージング
* 音声入力機能

## プラットフォーム別機能

### iOS

* Appleサインイン連携
* Siriショートカット対応
* 触覚フィードバック
* Face ID / Touch ID認証

### Android

* Googleサインイン連携
* Android Autoサポート
* 指紋認証対応
* アダプティブアイコン

## 開発ツール

* **Flipper**: デバッグ・検査
* **Reactotron**: 状態管理デバッグ
* **Fastlane**: 自動デプロイ
* **CodePush**: OTAアップデート

## テスト

* **ユニットテスト**: Jest + React Native Testing Library
* **E2Eテスト**: Detox
* **実機テスト**: BrowserStack / Firebase Test Lab
* **パフォーマンス**: Flipper Performance Monitor

## ビルド＆デプロイ

* **iOS**: Xcode + App Store Connect
* **Android**: Android Studio + Google Play Console
* **CI/CD**: GitHub Actions + Fastlane
* **ベータテスト**: TestFlight（iOS）+ Firebase App Distribution
