# AI Agent Service

## Overview

Core AI/ML service providing intelligent recommendations, natural language processing, and automated decision-making capabilities.

## Tech Stack

* **Language**: Python 3.11+
* **Framework**: FastAPI
* **AI/ML**: OpenAI GPT, Anthropic Claude, HuggingFace
* **Vector Database**: Pinecone / Weaviate
* **Queue System**: Celery + Redis
* **ML Pipeline**: MLflow
* **Deployment**: Docker + Kubernetes

## Development Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload --port 8001

# Run tests
pytest

# Train models
python scripts/train_models.py
```

## AI Capabilities

### Natural Language Processing

* Resume parsing and skill extraction
* Job description analysis
* Sentiment analysis for feedback
* Multi-language support

### Machine Learning Models

* Job-candidate matching algorithm
* Salary prediction models
* Career path recommendations
* Skill gap analysis

### AI Integrations

* **OpenAI GPT**: Text generation and analysis
* **Anthropic Claude**: Complex reasoning tasks
* **HuggingFace**: Custom model deployment
* **Google Cloud AI**: Vision and translation APIs

## API Endpoints

```python
POST /ai/match-candidates
POST /ai/analyze-resume
POST /ai/generate-job-description
POST /ai/predict-salary
POST /ai/recommend-skills
GET  /ai/model-status
POST /ai/feedback/process
```

## Model Training Pipeline

1. **Data Collection**: Automated data gathering
2. **Data Preprocessing**: Cleaning and normalization
3. **Feature Engineering**: Relevant feature extraction
4. **Model Training**: ML model development
5. **Model Validation**: Performance evaluation
6. **Model Deployment**: Production deployment
7. **Model Monitoring**: Performance tracking

## Vector Database Integration

* **Embeddings**: Sentence transformers for semantic search
* **Storage**: Efficient vector storage and retrieval
* **Similarity Search**: Fast candidate-job matching
* **Indexing**: Optimized search performance

## Background Tasks

* Model training and retraining
* Batch processing of applications
* Data pipeline orchestration
* Model performance monitoring
* Automated model updates

## Environment Variables

```bash
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
PINECONE_API_KEY=your-pinecone-key
REDIS_URL=redis://localhost:6379
CELERY_BROKER_URL=redis://localhost:6379
MODEL_STORAGE_PATH=/app/models
```
