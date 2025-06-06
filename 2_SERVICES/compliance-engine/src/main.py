from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
import json
from datetime import datetime

app = FastAPI(
    title="iWORKZ Compliance Engine",
    description="Regulatory compliance automation and verification service",
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
class ComplianceCheckRequest(BaseModel):
    jurisdiction: str
    entity_type: str
    data: Dict
    rules: Optional[List[str]] = None

class ComplianceResult(BaseModel):
    status: str
    compliant: bool
    jurisdiction: str
    checks_performed: List[str]
    violations: List[Dict]
    recommendations: List[str]
    confidence_score: float

# Health and status endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "compliance-engine",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/status")
async def get_status():
    return {
        "service": "iWORKZ Compliance Engine",
        "status": "operational",
        "supported_jurisdictions": ["UK", "EU", "US", "AU", "CA"],
        "compliance_types": ["employment", "data-protection", "financial", "safety"],
        "endpoints": ["/health", "/status", "/api/v1/check", "/api/v1/jurisdictions"]
    }

# Mock compliance rules
MOCK_RULES = {
    "UK": {
        "employment": [
            "minimum_wage_compliance",
            "working_time_directive", 
            "holiday_entitlement",
            "equal_pay_requirements"
        ],
        "data_protection": [
            "gdpr_compliance",
            "data_retention_policies",
            "consent_management"
        ]
    },
    "EU": {
        "employment": [
            "working_time_directive",
            "equal_treatment_directive",
            "health_safety_requirements"
        ],
        "data_protection": [
            "gdpr_compliance",
            "data_minimization",
            "right_to_be_forgotten"
        ]
    },
    "US": {
        "employment": [
            "flsa_compliance",
            "eeoc_requirements",
            "ada_compliance"
        ],
        "data_protection": [
            "ccpa_compliance",
            "hipaa_requirements"
        ]
    }
}

@app.post("/api/v1/check", response_model=ComplianceResult)
async def perform_compliance_check(request: ComplianceCheckRequest):
    """Perform compliance check for given jurisdiction and data"""
    try:
        jurisdiction = request.jurisdiction.upper()
        
        if jurisdiction not in MOCK_RULES:
            raise HTTPException(status_code=400, f"Unsupported jurisdiction: {jurisdiction}")
        
        # Mock compliance check logic
        applicable_rules = MOCK_RULES[jurisdiction].get(request.entity_type, [])
        
        # Simulate compliance violations (random for demo)
        import random
        violations = []
        if random.random() < 0.3:  # 30% chance of violations
            violations = [
                {
                    "rule": random.choice(applicable_rules),
                    "severity": random.choice(["low", "medium", "high"]),
                    "description": "Mock compliance violation detected",
                    "required_action": "Review and remediate"
                }
            ]
        
        is_compliant = len(violations) == 0
        confidence = random.uniform(0.8, 0.95)
        
        recommendations = [
            "Implement regular compliance monitoring",
            "Update policies and procedures",
            "Conduct staff training on regulatory requirements"
        ] if not is_compliant else [
            "Maintain current compliance standards",
            "Monitor regulatory changes"
        ]
        
        return ComplianceResult(
            status="completed",
            compliant=is_compliant,
            jurisdiction=jurisdiction,
            checks_performed=applicable_rules,
            violations=violations,
            recommendations=recommendations,
            confidence_score=round(confidence, 2)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")

@app.get("/api/v1/jurisdictions")
async def get_supported_jurisdictions():
    """Get list of supported jurisdictions and their compliance types"""
    return {
        "jurisdictions": list(MOCK_RULES.keys()),
        "details": MOCK_RULES
    }

@app.post("/api/v1/validate")
async def validate_compliance_data(data: Dict):
    """Validate compliance data format and completeness"""
    required_fields = ["entity_name", "jurisdiction", "compliance_type"]
    missing_fields = [field for field in required_fields if field not in data]
    
    return {
        "valid": len(missing_fields) == 0,
        "missing_fields": missing_fields,
        "data_quality_score": 0.95 if len(missing_fields) == 0 else 0.5,
        "recommendations": [] if len(missing_fields) == 0 else [
            f"Provide missing field: {field}" for field in missing_fields
        ]
    }

@app.get("/api/v1/reports/summary")
async def get_compliance_summary():
    """Get compliance status summary"""
    return {
        "total_checks": 1247,
        "compliant_entities": 1156,
        "non_compliant_entities": 91,
        "compliance_rate": 92.7,
        "top_violations": [
            {"rule": "gdpr_compliance", "count": 23},
            {"rule": "minimum_wage_compliance", "count": 18},
            {"rule": "working_time_directive", "count": 15}
        ],
        "last_updated": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("COMPLIANCE_PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)