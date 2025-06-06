# Matching Engine Service

## Overview
The iWORKZ Matching Engine is a Node.js/Express microservice responsible for intelligent job-candidate matching using AI-powered algorithms. It processes candidate profiles against job requirements and returns compatibility scores with detailed reasoning.

## Tech Stack  
- **Language**: Node.js 18+
- **Framework**: Express.js
- **ML Libraries**: scikit-learn, pandas, numpy
- **Vector Computing**: FAISS, Annoy
- **Graph Processing**: NetworkX
- **Database**: PostgreSQL + Redis
- **Queue System**: Celery
- **Monitoring**: MLflow, Weights & Biases

## Development Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize matching models
python scripts/init_models.py

# Start matching service
uvicorn main:app --reload --port 8002

# Run performance tests
python tests/test_matching_performance.py
```

## Matching Algorithm Components
### Skill Matching
- Exact skill matches with weighted scoring
- Semantic similarity using embeddings
- Skill level assessment and gaps
- Experience requirement matching

### Location Matching
- Geographic proximity calculation
- Remote work preference handling
- Timezone compatibility
- Travel requirement assessment

### Compensation Matching
- Salary range compatibility
- Benefits package alignment
- Equity and bonus considerations
- Cost of living adjustments

### Cultural Fit Assessment
- Company culture analysis
- Work style preferences
- Team dynamics compatibility
- Value alignment scoring

## Machine Learning Models
### Feature Engineering
```python
# Candidate features
candidate_vector = [
    skills_embedding,      # 512-dim
    experience_years,      # scalar
    education_level,       # categorical
    location_coords,       # 2-dim
    salary_expectation,    # scalar
    work_preferences,      # 10-dim
    soft_skills_score,     # scalar
]

# Job features
job_vector = [
    requirements_embedding, # 512-dim
    seniority_level,       # categorical
    company_size,          # categorical
    location_coords,       # 2-dim
    salary_range,          # 2-dim
    company_culture,       # 10-dim
    urgency_score,         # scalar
]
```

### Ranking Models
- **Linear Model**: Fast baseline matching
- **Neural Network**: Deep feature learning
- **Gradient Boosting**: High accuracy ranking
- **Ensemble Model**: Combined predictions

## API Endpoints
```python
POST /matching/find-candidates    # Find candidates for job
POST /matching/find-jobs         # Find jobs for candidate
POST /matching/score-pair        # Score specific job-candidate pair
POST /matching/bulk-match        # Batch matching processing
GET  /matching/recommendations   # Get personalized recommendations
POST /matching/feedback         # Submit matching feedback
GET  /matching/metrics          # Matching performance metrics
```

## Matching Pipeline
1. **Data Ingestion**: Job and candidate profiles
2. **Feature Extraction**: Convert profiles to vectors
3. **Candidate Filtering**: Initial compatibility screening
4. **Similarity Computation**: Vector similarity calculation
5. **ML Scoring**: Advanced model predictions
6. **Ranking**: Sort by relevance and fit
7. **Post-processing**: Apply business rules
8. **Result Delivery**: Return ranked matches

## Performance Optimization
- **Indexing**: FAISS for fast vector search
- **Caching**: Redis for frequent queries
- **Batching**: Efficient bulk processing
- **Parallel Processing**: Multi-threading for scalability
- **Model Optimization**: Quantization and pruning

## Evaluation Metrics
- **Precision@K**: Relevance of top-k matches
- **Recall@K**: Coverage of relevant matches
- **NDCG**: Normalized discounted cumulative gain
- **AUC**: Area under ROC curve
- **Mean Reciprocal Rank**: Average position of first relevant result

## A/B Testing Framework
- Model comparison and evaluation
- Feature importance analysis
- Performance monitoring
- Automated model selection
- Gradual rollout capabilities

## Configuration
```bash
# Model Settings
MODEL_VERSION=v2.1.0
SIMILARITY_THRESHOLD=0.7
MAX_CANDIDATES_PER_JOB=100
MAX_JOBS_PER_CANDIDATE=50

# Performance Settings
BATCH_SIZE=1000
PARALLEL_WORKERS=4
CACHE_TTL=3600

# Feature Weights
SKILL_WEIGHT=0.4
EXPERIENCE_WEIGHT=0.2
LOCATION_WEIGHT=0.15
SALARY_WEIGHT=0.15
CULTURE_WEIGHT=0.1
```