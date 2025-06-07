# PostgreSQL データベースサービス

## 概要

ACID準拠、高度なクエリ、そして高いパフォーマンスを実現するiWORKZプラットフォームの主要なデータベースサービスです。

## データベース構成

* **バージョン**：PostgreSQL 15以上
* **拡張機能**：uuid-ossp、pgcrypto、pg\_stat\_statements
* **コネクションプーリング**：PgBouncer
* **レプリケーション**：マスター-スレーブ構成
* **バックアップ**：自動日次バックアップ

## 開発セットアップ

```bash
# PostgreSQLコンテナ起動
docker-compose up db-postgres -d

# データベースへ接続
psql -h localhost -p 5432 -U iworkz_user -d iworkz

# マイグレーション実行
npm run db:migrate

# 開発データのシード
npm run db:seed

# データベースのリセット
npm run db:reset
```

## スキーマ概要

### 主要テーブル

```sql
-- ユーザーと認証
users
user_profiles
user_sessions
user_preferences

-- 求人と応募
jobs
job_requirements
applications
application_status

-- マッチングと推薦
matches
recommendations
match_feedback

-- 資格と検証
credentials
credential_verifications
skill_assessments

-- コミュニケーション
messages
conversations
notifications

-- 分析とログ
user_activities
system_logs
performance_metrics
```

## データベーススキーマ

### usersテーブル

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'candidate',
    status user_status NOT NULL DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

### jobsテーブル

```sql
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB,
    location JSONB,
    salary_range JSONB,
    employment_type employment_type NOT NULL,
    experience_level experience_level NOT NULL,
    status job_status NOT NULL DEFAULT 'draft',
    posted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT valid_salary_range CHECK (
        (salary_range->>'min')::numeric <= (salary_range->>'max')::numeric
    )
);

CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_location ON jobs USING GIN(location);
CREATE INDEX idx_jobs_requirements ON jobs USING GIN(requirements);
```

## カスタムタイプ

```sql
-- 型安全性を高める列挙型\CREATE TYPE user_role AS ENUM ('candidate', 'employer', 'admin', 'moderator');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'deleted');
CREATE TYPE job_status AS ENUM ('draft', 'published', 'closed', 'archived');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'junior', 'mid', 'senior', 'executive');
CREATE TYPE application_status AS ENUM ('pending', 'reviewing', 'shortlisted', 'rejected', 'hired');
```

## データベース関数

### 更新タイムスタンプ関数

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 対象テーブルにトリガーを設定
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 検索関数

```sql
-- 求人の全文検索
CREATE INDEX idx_jobs_search ON jobs USING GIN(
    to_tsvector('english', title || ' ' || description)
);

-- 求人検索関数
CREATE OR REPLACE FUNCTION search_jobs(search_term TEXT)
RETURNS TABLE(
    job_id UUID,
    title VARCHAR(255),
    description TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        j.id,
        j.title,
        j.description,
        ts_rank(to_tsvector('english', j.title || ' ' || j.description),
                plainto_tsquery('english', search_term)) as rank
    FROM jobs j
    WHERE to_tsvector('english', j.title || ' ' || j.description)
          @@ plainto_tsquery('english', search_term)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

## パフォーマンス最適化

### インデックス戦略

* B-treeインデックス：完全一致や範囲検索
* GINインデックス：JSONB・全文検索
* パーシャルインデックス：条件付きクエリ向け
* 複合インデックス：複数列検索

### クエリ最適化

* EXPLAIN ANALYZEで実行計画を確認
* WHERE句の順序を最適化
* プリペアドステートメントの活用
* 定期的なVACUUMとANALYZEの実施

## バックアップとリカバリ

```bash
# バックアップ作成
pg_dump -h localhost -p 5432 -U iworkz_user iworkz > backup.sql

# 圧縮バックアップ
pg_dump -h localhost -p 5432 -U iworkz_user iworkz | gzip > backup.sql.gz

# バックアップからリストア
psql -h localhost -p 5432 -U iworkz_user -d iworkz < backup.sql

# ポイントインタイムリカバリ設定
wal_level = replica
archive_mode = on
archive_command = 'cp %p /var/lib/postgresql/archive/%f'
```

## 監視とメンテナンス

* **pg\_stat\_statements**：クエリ性能の追跡
* **コネクション監視**：接続数やロック状況
* **ディスク使用量**：テーブル・インデックスサイズ
* **クエリ分析**：スロークエリ特定
* **ヘルスチェック**：DB接続性・性能モニタリング
