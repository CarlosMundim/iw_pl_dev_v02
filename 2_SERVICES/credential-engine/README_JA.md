# クレデンシャルエンジンサービス

## 概要

ブロックチェーンベースのクレデンシャル（資格情報）検証・認証サービスであり、iWORKZプラットフォームにおける信頼性と真正性を保証します。

## 技術スタック

* **言語**：Node.js + TypeScript / Python
* **ブロックチェーン**：Ethereum、Polygon、Hyperledger Fabric
* **スマートコントラクト**：Solidity
* **IPFS**：分散ファイルストレージ
* **暗号技術**：Web3.js、ethers.js
* **データベース**：PostgreSQL + MongoDB
* **キューシステム**：Bull Queue + Redis

## 開発セットアップ

```bash
# 依存パッケージインストール
npm install

# ブロックチェーン開発環境セットアップ
npm run setup:blockchain

# スマートコントラクトデプロイ（ローカル）
npm run deploy:local

# サービス起動
npm run dev

# テスト実行
npm test

# ブロックチェーンテスト
npm run test:contracts
```

## 主な機能

### クレデンシャル検証

* 学歴証明書の検証
* 職業資格の検証
* スキル認定の認証
* 職歴の確認
* バックグラウンドチェック連携

### ブロックチェーン統合

* 不変のクレデンシャル記録
* 分散型検証ネットワーク
* スマートコントラクトによる自動化
* マルチシグ検証
* クロスチェーン対応

### デジタルアイデンティティ

* 自己主権型ID（SSI）対応
* ゼロ知識証明による検証
* プライバシー保護検証
* ポータブルなデジタルクレデンシャル
* 同意管理

## スマートコントラクト

### Credential Registry

```solidity
contract CredentialRegistry {
    struct Credential {
        bytes32 id;
        address issuer;
        address holder;
        string credentialType;
        bytes32 dataHash;
        uint256 issuedAt;
        uint256 expiresAt;
        bool revoked;
    }
    
    mapping(bytes32 => Credential) public credentials;
    mapping(address => bool) public authorizedIssuers;
    
    function issueCredential(
        address holder,
        string memory credentialType,
        bytes32 dataHash,
        uint256 expiresAt
    ) external onlyAuthorizedIssuer returns (bytes32);
    
    function verifyCredential(bytes32 credentialId)
        external view returns (bool);
    
    function revokeCredential(bytes32 credentialId)
        external onlyIssuer(credentialId);
}
```

## APIエンドポイント

```typescript
POST /credentials/issue          // 新規クレデンシャル発行
POST /credentials/verify         // クレデンシャルの真正性検証
GET  /credentials/:id           // クレデンシャル詳細取得
POST /credentials/revoke        // クレデンシャルの取り消し
GET  /credentials/holder/:address // 保有者のクレデンシャル取得
POST /credentials/batch-verify  // 一括検証
GET  /credentials/issuer/:address // 発行者のクレデンシャル一覧
POST /credentials/zkproof       // ゼロ知識証明による検証
```

## 検証プロセス

1. **クレデンシャル提出**：ユーザーが書類を提出
2. **書類分析**：AIによるドキュメント検証
3. **発行元確認**：発行機関へ連絡
4. **ブロックチェーン記録**：検証情報をオンチェーンに保存
5. **IPFS保管**：暗号化書類を分散保存
6. **証明書発行**：デジタル証明書生成
7. **通知**：関係者に通知
8. **継続モニタリング**：取り消しを検出

## 対応クレデンシャル種別

### 学歴

* 卒業証書・学位
* 成績証明書
* コース修了証
* 職業訓練

### 職業資格

* 勤務証明書
* スキル認定
* 業界資格
* 業績評価

### 本人確認

* 政府発行ID
* 専門資格
* バックグラウンドチェック
* 推薦状

## セキュリティ機能

* **暗号ハッシュ**：SHA-256による書類フィンガープリント
* **デジタル署名**：RSA/ECDSAによる署名検証
* **暗号化**：AES-256で機密データを保護
* **アクセス制御**：ロールベースの権限管理
* **監査証跡**：不変の検証履歴
* **不正検知**：機械学習による詐欺検出

## 連携パートナー

### 教育機関

* 大学・高等教育機関
* オンライン学習プラットフォーム
* 職業訓練センター
* 資格認定団体

### 検証サービス

* バックグラウンドチェック会社
* 政府機関
* 業界団体
* 雇用主検証サービス

## 環境変数

```bash
# ブロックチェーン設定
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-key
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your-private-key
CONTRACT_ADDRESS=0x1234567890abcdef

# IPFS設定
IPFS_API_URL=https://ipfs.infura.io:5001
IPFS_GATEWAY=https://gateway.ipfs.io

# 外部API
CLEARINGHOUSE_API_KEY=your-clearinghouse-key
EDUCATION_VERIFY_KEY=your-education-verify-key
```
