# サーチサービス（Elasticsearch）

## 概要

求人、候補者、各種コンテンツに対して高速かつスケーラブルな全文検索機能を提供します。

## 技術スタック

* **エンジン**: Elasticsearch 8.8以上
* **クライアントライブラリ**: @elastic/elasticsearch（Node.js）、elasticsearch-py（Python）
* **分析**: Kibanaによるデータ可視化
* **モニタリング**: Elastic APM
* **セキュリティ**: X-Pack Security機能

## 開発セットアップ

```bash
# Elasticsearchコンテナの起動
docker-compose up search -d

# クラスタの準備待機
curl -X GET "localhost:9200/_cluster/health?wait_for_status=yellow&timeout=50s"

# インデックスとマッピングの作成
npm run search:setup

# サンプルデータのインデックス
npm run search:seed

# クラスタ状態確認
curl -X GET "localhost:9200/_cluster/health?pretty"
```

## インデックス設定

### 求人インデックス

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "job_analyzer",
        "fields": {
          "keyword": { "type": "keyword" },
          "suggest": { "type": "completion" }
        }
      },
      "description": {
        "type": "text",
        "analyzer": "job_analyzer"
      },
      "requirements": {
        "type": "nested",
        "properties": {
          "skill": { "type": "keyword" },
          "level": { "type": "keyword" },
          "required": { "type": "boolean" }
        }
      },
      "location": {
        "properties": {
          "city": { "type": "keyword" },
          "country": { "type": "keyword" },
          "coordinates": { "type": "geo_point" },
          "remote": { "type": "boolean" }
        }
      },
      "salary": {
        "properties": {
          "min": { "type": "integer" },
          "max": { "type": "integer" },
          "currency": { "type": "keyword" }
        }
      },
      "employment_type": { "type": "keyword" },
      "experience_level": { "type": "keyword" },
      "company": {
        "properties": {
          "name": { "type": "keyword" },
          "size": { "type": "keyword" },
          "industry": { "type": "keyword" }
        }
      },
      "posted_date": { "type": "date" },
      "expires_date": { "type": "date" },
      "status": { "type": "keyword" }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "job_analyzer": {
          "tokenizer": "standard",
          "filter": ["lowercase", "job_synonym", "stop"]
        }
      },
      "filter": {
        "job_synonym": {
          "type": "synonym",
          "synonyms": [
            "js,javascript",
            "react,reactjs",
            "node,nodejs",
            "ai,artificial intelligence,machine learning,ml"
          ]
        }
      }
    }
  }
}
```

### 候補者インデックス

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "name": { "type": "text" },
      "email": { "type": "keyword" },
      "skills": {
        "type": "nested",
        "properties": {
          "name": { "type": "keyword" },
          "level": { "type": "keyword" },
          "years_experience": { "type": "integer" }
        }
      },
      "experience": {
        "type": "nested",
        "properties": {
          "title": { "type": "text" },
          "company": { "type": "keyword" },
          "duration_months": { "type": "integer" },
          "description": { "type": "text" }
        }
      },
      "education": {
        "type": "nested",
        "properties": {
          "degree": { "type": "keyword" },
          "field": { "type": "keyword" },
          "institution": { "type": "keyword" },
          "graduation_year": { "type": "integer" }
        }
      },
      "location": {
        "properties": {
          "city": { "type": "keyword" },
          "country": { "type": "keyword" },
          "coordinates": { "type": "geo_point" },
          "willing_to_relocate": { "type": "boolean" }
        }
      },
      "preferences": {
        "properties": {
          "salary_expectation": { "type": "integer_range" },
          "employment_types": { "type": "keyword" },
          "remote_preference": { "type": "keyword" }
        }
      },
      "availability": { "type": "keyword" },
      "last_active": { "type": "date" }
    }
  }
}
```

## サーチクエリ例

### 求人検索

```javascript
const jobSearchQuery = {
  query: {
    bool: {
      must: [
        {
          multi_match: {
            query: searchTerm,
            fields: ["title^2", "description", "requirements.skill"],
            type: "best_fields"
          }
        }
      ],
      filter: [
        { terms: { employment_type: filters.employmentTypes } },
        { range: { salary.min: { gte: filters.minSalary } } },
        { geo_distance: {
            distance: filters.maxDistance,
            "location.coordinates": filters.userLocation
          }
        }
      ]
    }
  },
  sort: [
    { _score: { order: "desc" } },
    { posted_date: { order: "desc" } }
  ],
  highlight: {
    fields: {
      title: {},
      description: { fragment_size: 150 }
    }
  },
  aggs: {
    employment_types: { terms: { field: "employment_type" } },
    experience_levels: { terms: { field: "experience_level" } },
    companies: { terms: { field: "company.name", size: 10 } }
  }
};
```

### 候補者検索

```javascript
const candidateSearchQuery = {
  query: {
    bool: {
      must: [
        {
          nested: {
            path: "skills",
            query: {
              bool: {
                must: [
                  { terms: { "skills.name": requiredSkills } },
                  { range: { "skills.years_experience": { gte: minExperience } } }
                ]
              }
            }
          }
        }
      ],
      should: [
        {
          nested: {
            path: "experience",
            query: {
              match: { "experience.title": jobTitle }
            }
          }
        }
      ],
      filter: [
        { geo_distance: {
            distance: "50km",
            "location.coordinates": jobLocation
          }
        },
        { range: { last_active: { gte: "now-30d" } } }
      ]
    }
  },
  sort: [
    { _score: { order: "desc" } },
    { last_active: { order: "desc" } }
  ]
};
```

## 高度な機能

### オートコンプリート

```javascript
const suggestionQuery = {
  suggest: {
    job_title_suggest: {
      prefix: userInput,
      completion: {
        field: "title.suggest",
        size: 10,
        contexts: {
          location: [userLocation]
        }
      }
    }
  }
};
```

### セマンティック検索

```javascript
// ベクトル検索によるセマンティック類似
const semanticQuery = {
  knn: {
    field: "description_vector",
    query_vector: await generateEmbedding(searchQuery),
    k: 50,
    num_candidates: 500
  },
  query: {
    bool: {
      filter: filters
    }
  }
};
```

## パフォーマンス最適化

### インデックステンプレート

```json
{
  "index_patterns": ["jobs-*"] ,
  "template": {
    "settings": {
      "number_of_shards": 2,
      "number_of_replicas": 1,
      "refresh_interval": "30s",
      "index.max_result_window": 50000
    }
  }
}
```

### サーチパフォーマンス

* 可能な限りfilterを活用
* 結果キャッシュの導入
* 集計の最適化（cardinality制限）
* インデックスエイリアスでゼロダウンタイム再インデックス
* 遅いクエリの監視と最適化

## データパイプライン

### リアルタイムインデックス

```javascript
// 新しい求人投稿のインデックス登録
await esClient.index({
  index: 'jobs',
  id: job.id,
  body: transformJobForIndex(job)
});

// 候補者プロフィールの更新
await esClient.update({
  index: 'candidates',
  id: candidate.id,
  body: {
    doc: transformCandidateForIndex(candidate)
  }
});
```

### バルク操作

```javascript
// パフォーマンス向上のためバルクインデックス
const bulkBody = jobs.flatMap(job => [
  { index: { _index: 'jobs', _id: job.id } },
  transformJobForIndex(job)
]);

await esClient.bulk({ body: bulkBody });
```

## モニタリングと運用保守

### ヘルスチェック

```bash
# クラスタヘルス
curl "localhost:9200/_cluster/health?pretty"

# インデックス統計
curl "localhost:9200/_cat/indices?v"

# ノード統計
curl "localhost:9200/_nodes/stats?pretty"
```

### パフォーマンス監視

* クエリ実行時間
* インデックスサイズと増加傾向
* メモリ・CPU使用量
* サーチスループットとレイテンシ
* 失敗したクエリ分析

## セキュリティ設定

```yaml
# X-Pack Security 設定
xpack.security.enabled: true
xpack.security.enrollment.enabled: true

# APIキー認証
xpack.security.authc.api_key.enabled: true

# ロールベースアクセス制御
xpack.security.authc.realms.native.native1.order: 0
```
