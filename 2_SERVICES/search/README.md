# Search Service (Elasticsearch)

## Overview
Full-text search engine providing fast, scalable search capabilities across jobs, candidates, and content.

## Tech Stack
- **Engine**: Elasticsearch 8.8+
- **Client Libraries**: @elastic/elasticsearch (Node.js), elasticsearch-py (Python)
- **Analytics**: Kibana for data visualization
- **Monitoring**: Elastic APM
- **Security**: X-Pack Security features

## Development Setup
```bash
# Start Elasticsearch container
docker-compose up search -d

# Wait for cluster to be ready
curl -X GET "localhost:9200/_cluster/health?wait_for_status=yellow&timeout=50s"

# Create indexes and mappings
npm run search:setup

# Index sample data
npm run search:seed

# Check cluster status
curl -X GET "localhost:9200/_cluster/health?pretty"
```

## Index Configuration
### Jobs Index
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

### Candidates Index
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

## Search Queries
### Job Search
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

### Candidate Search
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

## Advanced Features
### Auto-completion
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

### Semantic Search
```javascript
// Using vector search for semantic similarity
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

## Performance Optimization
### Index Templates
```json
{
  "index_patterns": ["jobs-*"],
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

### Search Performance
- Use filters instead of queries when possible
- Implement result caching
- Optimize aggregations with cardinality limits
- Use index aliases for zero-downtime reindexing
- Monitor slow queries and optimize

## Data Pipeline
### Real-time Indexing
```javascript
// Index new job posting
await esClient.index({
  index: 'jobs',
  id: job.id,
  body: transformJobForIndex(job)
});

// Update candidate profile
await esClient.update({
  index: 'candidates',
  id: candidate.id,
  body: {
    doc: transformCandidateForIndex(candidate)
  }
});
```

### Bulk Operations
```javascript
// Bulk indexing for better performance
const bulkBody = jobs.flatMap(job => [
  { index: { _index: 'jobs', _id: job.id } },
  transformJobForIndex(job)
]);

await esClient.bulk({ body: bulkBody });
```

## Monitoring and Maintenance
### Health Checks
```bash
# Cluster health
curl "localhost:9200/_cluster/health?pretty"

# Index statistics
curl "localhost:9200/_cat/indices?v"

# Node statistics
curl "localhost:9200/_nodes/stats?pretty"
```

### Performance Monitoring
- Query execution times
- Index size and growth
- Memory and CPU usage
- Search throughput and latency
- Failed query analysis

## Security Configuration
```yaml
# X-Pack Security settings
xpack.security.enabled: true
xpack.security.enrollment.enabled: true

# API key authentication
xpack.security.authc.api_key.enabled: true

# Role-based access control
xpack.security.authc.realms.native.native1.order: 0
```