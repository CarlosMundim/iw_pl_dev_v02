from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
import json
import random
from datetime import datetime, timedelta

app = FastAPI(
    title="iWORKZ Analytics Service",
    description="Platform analytics, reporting, and dashboard data service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class MetricsRequest(BaseModel):
    metric_type: str
    time_range: str
    filters: Optional[Dict] = None

class DashboardData(BaseModel):
    total_users: int
    total_jobs: int
    total_matches: int
    success_rate: float
    revenue: float
    growth_rate: float

# Health and status endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "analytics-service",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/status")
async def get_status():
    return {
        "service": "iWORKZ Analytics Service",
        "status": "operational",
        "capabilities": ["real-time-metrics", "dashboard-data", "reporting", "charts"],
        "endpoints": ["/health", "/status", "/api/v1/dashboard", "/api/v1/metrics", "/api/v1/charts"]
    }

# Mock analytics data generators
def generate_user_metrics():
    return {
        "total_users": random.randint(1200, 1500),
        "new_users_today": random.randint(15, 45),
        "active_users": random.randint(800, 1200),
        "user_retention_rate": round(random.uniform(0.75, 0.95), 2),
        "avg_session_duration": random.randint(12, 25)  # minutes
    }

def generate_job_metrics():
    return {
        "total_jobs": random.randint(850, 1200),
        "active_jobs": random.randint(600, 900),
        "jobs_posted_today": random.randint(25, 60),
        "avg_time_to_fill": random.randint(8, 18),  # days
        "job_success_rate": round(random.uniform(0.78, 0.92), 2)
    }

def generate_matching_metrics():
    return {
        "total_matches": random.randint(2500, 4000),
        "matches_today": random.randint(45, 120),
        "match_success_rate": round(random.uniform(0.82, 0.94), 2),
        "avg_match_score": round(random.uniform(0.75, 0.95), 2),
        "interviews_scheduled": random.randint(180, 320)
    }

def generate_revenue_metrics():
    return {
        "monthly_revenue": round(random.uniform(45000, 85000), 2),
        "revenue_growth": round(random.uniform(0.12, 0.28), 2),
        "avg_deal_size": round(random.uniform(1200, 2800), 2),
        "customer_ltv": round(random.uniform(8500, 15000), 2),
        "churn_rate": round(random.uniform(0.03, 0.08), 2)
    }

# Dashboard endpoints
@app.get("/api/v1/dashboard", response_model=DashboardData)
async def get_dashboard_data():
    """Get main dashboard overview data"""
    user_metrics = generate_user_metrics()
    job_metrics = generate_job_metrics()
    matching_metrics = generate_matching_metrics()
    revenue_metrics = generate_revenue_metrics()
    
    return DashboardData(
        total_users=user_metrics["total_users"],
        total_jobs=job_metrics["total_jobs"],
        total_matches=matching_metrics["total_matches"],
        success_rate=matching_metrics["match_success_rate"],
        revenue=revenue_metrics["monthly_revenue"],
        growth_rate=revenue_metrics["revenue_growth"]
    )

@app.get("/api/v1/metrics/users")
async def get_user_metrics():
    """Get detailed user analytics"""
    return {
        "timestamp": datetime.now().isoformat(),
        "data": generate_user_metrics(),
        "trends": {
            "weekly_growth": round(random.uniform(0.05, 0.15), 2),
            "top_acquisition_channels": [
                {"channel": "organic_search", "percentage": 35.2},
                {"channel": "social_media", "percentage": 28.7},
                {"channel": "referral", "percentage": 22.1},
                {"channel": "direct", "percentage": 14.0}
            ]
        }
    }

@app.get("/api/v1/metrics/jobs")
async def get_job_metrics():
    """Get job posting and performance analytics"""
    return {
        "timestamp": datetime.now().isoformat(),
        "data": generate_job_metrics(),
        "categories": {
            "technology": random.randint(280, 420),
            "healthcare": random.randint(180, 280),
            "finance": random.randint(120, 200),
            "education": random.randint(100, 180),
            "other": random.randint(150, 250)
        },
        "top_employers": [
            {"company": "TechCorp Ltd", "jobs": random.randint(25, 45)},
            {"company": "HealthCare Plus", "jobs": random.randint(18, 35)},
            {"company": "Finance Solutions", "jobs": random.randint(15, 28)},
            {"company": "EduTech Academy", "jobs": random.randint(12, 25)}
        ]
    }

@app.get("/api/v1/metrics/matching")
async def get_matching_metrics():
    """Get matching algorithm performance data"""
    return {
        "timestamp": datetime.now().isoformat(),
        "data": generate_matching_metrics(),
        "algorithm_performance": {
            "ai_hybrid": {"accuracy": 0.92, "speed_ms": 180},
            "skill_based": {"accuracy": 0.85, "speed_ms": 95},
            "experience_based": {"accuracy": 0.78, "speed_ms": 120}
        },
        "quality_metrics": {
            "false_positive_rate": round(random.uniform(0.05, 0.12), 2),
            "candidate_satisfaction": round(random.uniform(0.82, 0.94), 2),
            "employer_satisfaction": round(random.uniform(0.78, 0.91), 2)
        }
    }

@app.get("/api/v1/metrics/revenue")
async def get_revenue_metrics():
    """Get business and revenue analytics"""
    return {
        "timestamp": datetime.now().isoformat(),
        "data": generate_revenue_metrics(),
        "subscription_tiers": {
            "basic": {"count": random.randint(120, 180), "revenue": random.randint(8000, 12000)},
            "professional": {"count": random.randint(80, 120), "revenue": random.randint(15000, 25000)},
            "enterprise": {"count": random.randint(25, 45), "revenue": random.randint(20000, 35000)}
        },
        "forecasts": {
            "next_month_revenue": round(random.uniform(48000, 92000), 2),
            "annual_projection": round(random.uniform(580000, 980000), 2)
        }
    }

@app.get("/api/v1/charts/user-growth")
async def get_user_growth_chart():
    """Generate user growth chart data"""
    days = [(datetime.now() - timedelta(days=x)).strftime("%Y-%m-%d") for x in range(30, 0, -1)]
    users = [random.randint(800, 1500) for _ in days]
    
    return {
        "chart_type": "line",
        "title": "User Growth (30 Days)",
        "data": {
            "labels": days,
            "datasets": [{
                "label": "Total Users",
                "data": users,
                "borderColor": "#3B82F6",
                "backgroundColor": "rgba(59, 130, 246, 0.1)"
            }]
        }
    }

@app.get("/api/v1/charts/job-categories")
async def get_job_categories_chart():
    """Generate job categories pie chart data"""
    categories = {
        "Technology": random.randint(350, 450),
        "Healthcare": random.randint(200, 300),
        "Finance": random.randint(150, 250),
        "Education": random.randint(100, 200),
        "Other": random.randint(100, 200)
    }
    
    return {
        "chart_type": "pie",
        "title": "Jobs by Category",
        "data": {
            "labels": list(categories.keys()),
            "datasets": [{
                "data": list(categories.values()),
                "backgroundColor": [
                    "#3B82F6", "#10B981", "#F59E0B", 
                    "#EF4444", "#8B5CF6"
                ]
            }]
        }
    }

@app.get("/api/v1/reports/summary")
async def get_analytics_summary():
    """Get comprehensive analytics summary"""
    return {
        "period": "last_30_days",
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "platform_health": "excellent",
            "growth_trend": "positive",
            "user_engagement": "high",
            "revenue_performance": "above_target"
        },
        "key_metrics": {
            **generate_user_metrics(),
            **generate_job_metrics(),
            **generate_matching_metrics(),
            **generate_revenue_metrics()
        },
        "recommendations": [
            "Continue focus on user acquisition through social media",
            "Enhance AI matching algorithm for better accuracy",
            "Expand into healthcare sector based on demand",
            "Implement premium features for enterprise clients"
        ]
    }

@app.get("/api/v1/export/{report_type}")
async def export_report(report_type: str, format: str = "json"):
    """Export analytics reports in various formats"""
    if report_type not in ["users", "jobs", "matching", "revenue", "summary"]:
        raise HTTPException(status_code=400, detail="Invalid report type")
    
    # Mock export data
    export_data = {
        "report_type": report_type,
        "exported_at": datetime.now().isoformat(),
        "format": format,
        "download_url": f"/downloads/{report_type}_{datetime.now().strftime('%Y%m%d')}.{format}",
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    }
    
    return export_data

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ANALYTICS_PORT", 8004))
    uvicorn.run(app, host="0.0.0.0", port=port)