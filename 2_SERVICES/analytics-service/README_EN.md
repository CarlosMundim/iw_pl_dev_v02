# Analytics Service

## Overview

The iWORKZ Analytics Service is a FastAPI-based microservice that provides comprehensive platform analytics, real-time metrics, dashboard data, and business intelligence for the iWORKZ platform.

## Features

* **Real-time Dashboards**: Live platform metrics and KPIs
* **User Analytics**: Engagement, retention, and acquisition metrics
* **Job Performance**: Posting success rates and time-to-fill analytics
* **Matching Intelligence**: Algorithm performance and success metrics
* **Revenue Analytics**: Business metrics and growth tracking
* **Chart Generation**: Dynamic chart data for visualisations
* **Export Capabilities**: Report generation and data export
* **Predictive Insights**: Growth forecasting and trend analysis

## Tech Stack

* **Framework**: FastAPI (Python 3.11+)
* **Data Processing**: Pandas, NumPy for analytics computation
* **Database**: PostgreSQL for structured data, Redis for caching
* **Visualisation**: Plotly for chart generation
* **Templates**: Jinja2 for report templating

## Key Metrics

* **Placement Success**: Time-to-hire, retention rates, satisfaction scores
* **Platform Usage**: User engagement, feature adoption, session analytics
* **Compliance**: Audit trail completeness, regulatory adherence
* **Financial**: Revenue per client, cost per placement, ROI metrics
* **Operational**: System performance, API response times, error rates

## Dashboard Categories

* **Executive Dashboard**: High-level KPIs and business metrics
* **Client Portal**: Placement tracking and workforce analytics
* **Operations Dashboard**: System health and performance monitoring
* **Compliance Dashboard**: Regulatory compliance status and alerts

## Getting Started

### Prerequisites

* Python 3.11+
* pip
* Docker (for containerised deployment)

### Local Development

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start development server
uvicorn src.main:app --reload --port 8004

# Service available at http://localhost:8004
# API docs at http://localhost:8004/docs
```

### Docker Deployment

```bash
# Build image
docker build -t iworkz-analytics-service .

# Run container
docker run -p 8004:8004 -e ANALYTICS_PORT=8004 iworkz-analytics-service
```

## API Endpoints

### Health & Status

* `GET /health` - Service health check
* `GET /status` - Service capabilities

### Dashboard APIs

* `GET /api/v1/dashboard` - Main dashboard overview data
* `GET /api/v1/metrics/users` - Detailed user analytics
* `GET /api/v1/metrics/jobs` - Job performance metrics
* `GET /api/v1/metrics/matching` - Matching algorithm performance
* `GET /api/v1/metrics/revenue` - Business and revenue analytics

### Chart APIs

* `GET /api/v1/charts/user-growth` - User growth chart data
* `GET /api/v1/charts/job-categories` - Job categories distribution

### Reports & Export

* `GET /api/v1/reports/summary` - Comprehensive analytics summary
* `GET /api/v1/export/{report_type}` - Export reports in various formats

### Response Example

```json
{
  "total_users": 1347,
  "total_jobs": 892,
  "total_matches": 3247,
  "success_rate": 0.89,
  "revenue": 67430.50,
  "growth_rate": 0.18
}
```

## Configuration

### Environment Variables

* `ANALYTICS_PORT` - Service port (default: 8004)
* `POSTGRES_HOST` - Database host
* `POSTGRES_DB` - Database name
* `POSTGRES_USER` - Database user
* `POSTGRES_PASSWORD` - Database password
* `REDIS_URL` - Redis connection URL

## Development Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest

# Run with auto-reload
uvicorn src.main:app --reload --port 8004

# Check test coverage
pytest --cov=src tests/
```

**See also:** [Business Context](/1_DOCUMENTATION/BUSINESS_CONTEXT.md)
