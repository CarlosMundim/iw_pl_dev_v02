# Compliance Engine Service

## Overview

The iWORKZ Compliance Engine is a FastAPI-based microservice that automates regulatory compliance validation for job postings, employment contracts, and candidate data across multiple jurisdictions (JP, SK, SG, UK, EU, US, AU, CA).

## Features

* **Multi-Jurisdiction Support**: Japan, South Korea, Singapore, UK, EU, US, Australia, Canada compliance
* **Employment Law Validation**: Working hours, minimum wage, benefits compliance
* **Data Protection Compliance**: APPI, PIPA, PDPA, GDPR, CCPA, local privacy regulations
* **Real-time Compliance Checking**: Instant validation with confidence scoring
* **Violation Detection**: Automated identification of compliance issues
* **Recommendation Engine**: Actionable remediation suggestions
* **RESTful API**: Clean endpoints for integration

## Tech Stack

* **Framework**: FastAPI (Python 3.11+)
* **Database**: PostgreSQL with compliance data models
* **Caching**: Redis for regulatory rule caching
* **Validation**: Pydantic for data validation
* **Documentation**: Auto-generated OpenAPI/Swagger docs

## Getting Started

### Prerequisites

* Python 3.11+
* pip
* Docker (for containerized deployment)

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn src.main:app --reload --port 8003

# Service available at http://localhost:8003
# API docs at http://localhost:8003/docs
```

### Docker Deployment

```bash
# Build image
docker build -t iworkz-compliance-engine .

# Run container
docker run -p 8003:8003 -e COMPLIANCE_PORT=8003 iworkz-compliance-engine
```

## API Endpoints

### Health & Status

* `GET /health` - Service health check
* `GET /status` - Service capabilities and supported jurisdictions

### Compliance APIs

* `POST /api/v1/check` - Perform compliance validation
* `GET /api/v1/jurisdictions` - Get supported jurisdictions and rules
* `POST /api/v1/validate` - Validate compliance data format
* `GET /api/v1/reports/summary` - Get compliance status summary

### Request Example

```json
POST /api/v1/check
{
  "jurisdiction": "UK",
  "entity_type": "employment",
  "data": {
    "entity_name": "Tech Corp Ltd",
    "job_posting": {...}
  }
}
```

### Response Format

```json
{
  "status": "completed",
  "compliant": true,
  "jurisdiction": "UK",
  "checks_performed": ["minimum_wage_compliance", "working_time_directive"],
  "violations": [],
  "recommendations": ["Maintain current compliance standards"],
  "confidence_score": 0.92
}
```

## Supported Jurisdictions

### Currently Implemented

* **UK**: Employment law, GDPR, working time directive
* **EU**: Working time directive, equal treatment, GDPR
* **US**: FLSA, EEOC, ADA, CCPA compliance
* **AU**: Fair Work Act, privacy regulations
* **CA**: Employment standards, PIPEDA

### Compliance Types

* **Employment**: Wage, hours, benefits, equal opportunity
* **Data Protection**: GDPR, CCPA, privacy regulations
* **Financial**: Payroll tax, social security
* **Safety**: Workplace health and safety requirements

## Configuration

### Environment Variables

* `COMPLIANCE_PORT` - Service port (default: 8003)
* `POSTGRES_HOST` - Database host
* `POSTGRES_DB` - Database name
* `POSTGRES_USER` - Database user
* `POSTGRES_PASSWORD` - Database password
* `OPENAI_API_KEY` - AI service integration
* `AI_SERVICE_URL` - AI Agent service endpoint

## Integration Points

* **Backend API**: Compliance validation requests
* **AI Agent**: Enhanced document analysis and rule interpretation
* **Database**: Regulatory rules storage and compliance history
* **External APIs**: Government regulatory data feeds

## Development Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest

# Run with auto-reload
uvicorn src.main:app --reload --port 8003

# Check compliance coverage
pytest --cov=src tests/
```

**See also:** [Compliance AI Prompts](/3_AI_AGENTS/COMPLIANCE_AI_PROMPTS.md)
