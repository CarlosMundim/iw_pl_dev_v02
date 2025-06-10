from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Dict, List, Optional
import os
import json
import uuid
import logging
from datetime import datetime

from .models import (
    ComplianceCheckRequest,
    ComplianceCheckResult,
    BulkComplianceRequest,
    BulkComplianceResult,
    ComplianceJurisdiction,
    ComplianceType,
    ComplianceStatus,
    JurisdictionInfo
)
from .services.compliance_service import ComplianceService
from .services.jurisdiction_service import JurisdictionService
from .services.rules_engine import RulesEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="iWORKZ Compliance Engine",
    description="Advanced regulatory compliance automation and verification service for global workforce management",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
compliance_service = ComplianceService()
jurisdiction_service = JurisdictionService()
rules_engine = RulesEngine()

# Dependency injection
async def get_compliance_service():
    return compliance_service

async def get_jurisdiction_service():
    return jurisdiction_service

# Health and status endpoints
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "compliance-engine",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.get("/status")
async def get_status():
    return {
        "service": "iWORKZ Compliance Engine",
        "status": "operational",
        "supported_jurisdictions": [j.value for j in ComplianceJurisdiction],
        "compliance_types": [t.value for t in ComplianceType],
        "features": [
            "real-time-compliance-checking",
            "multi-jurisdiction-support", 
            "violation-detection",
            "recommendation-engine",
            "bulk-processing",
            "comprehensive-reporting"
        ],
        "endpoints": [
            "/health", 
            "/status", 
            "/api/v1/check",
            "/api/v1/bulk-check",
            "/api/v1/jurisdictions",
            "/api/v1/rules",
            "/api/v1/validate",
            "/api/v1/reports/summary"
        ]
    }

# Main compliance endpoints
@app.post("/api/v1/check", response_model=ComplianceCheckResult)
async def perform_compliance_check(
    request: ComplianceCheckRequest,
    service: ComplianceService = Depends(get_compliance_service)
):
    """Perform comprehensive compliance check for given jurisdiction and data"""
    try:
        logger.info(f"Starting compliance check for {request.jurisdiction} - {request.compliance_type}")
        result = await service.perform_compliance_check(request)
        logger.info(f"Compliance check completed: {result.check_id}")
        return result
    except Exception as e:
        logger.error(f"Compliance check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")

@app.post("/api/v1/bulk-check")
async def perform_bulk_compliance_check(
    request: BulkComplianceRequest,
    background_tasks: BackgroundTasks,
    service: ComplianceService = Depends(get_compliance_service)
):
    """Perform bulk compliance checks"""
    try:
        batch_id = request.batch_id or str(uuid.uuid4())
        
        if len(request.requests) > 100:
            raise HTTPException(
                status_code=400, 
                detail="Bulk requests limited to 100 items per batch"
            )
        
        # Process smaller batches immediately, larger ones in background
        if len(request.requests) <= 10:
            results = []
            for req in request.requests:
                try:
                    result = await service.perform_compliance_check(req)
                    results.append(result)
                except Exception as e:
                    logger.error(f"Individual check failed: {e}")
                    continue
            
            return BulkComplianceResult(
                batch_id=batch_id,
                status=ComplianceStatus.COMPLETED,
                total_requests=len(request.requests),
                completed=len(results),
                failed=len(request.requests) - len(results),
                results=results,
                started_at=datetime.now(),
                completed_at=datetime.now(),
                summary={
                    "compliant": len([r for r in results if r.compliant]),
                    "non_compliant": len([r for r in results if not r.compliant]),
                    "average_confidence": sum(r.confidence_score for r in results) / len(results) if results else 0
                }
            )
        else:
            # Process in background for larger batches
            background_tasks.add_task(process_bulk_compliance, batch_id, request.requests, service)
            
            return {
                "batch_id": batch_id,
                "status": "processing",
                "message": "Bulk compliance check started in background",
                "total_requests": len(request.requests),
                "estimated_completion": "5-10 minutes"
            }
            
    except Exception as e:
        logger.error(f"Bulk compliance check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Bulk check failed: {str(e)}")

@app.get("/api/v1/jurisdictions")
async def get_supported_jurisdictions(
    jurisdiction_service: JurisdictionService = Depends(get_jurisdiction_service)
):
    """Get comprehensive information about supported jurisdictions"""
    jurisdictions = []
    
    for jurisdiction in ComplianceJurisdiction:
        info = await jurisdiction_service.get_jurisdiction_info(jurisdiction)
        jurisdictions.append(info)
    
    return {
        "total_jurisdictions": len(jurisdictions),
        "jurisdictions": jurisdictions,
        "compliance_types": [t.value for t in ComplianceType]
    }

@app.get("/api/v1/jurisdictions/{jurisdiction}")
async def get_jurisdiction_details(
    jurisdiction: ComplianceJurisdiction,
    jurisdiction_service: JurisdictionService = Depends(get_jurisdiction_service)
):
    """Get detailed information about a specific jurisdiction"""
    try:
        info = await jurisdiction_service.get_jurisdiction_info(jurisdiction)
        applicable_rules = await rules_engine.get_applicable_rules(jurisdiction, None, None)
        
        return {
            **info,
            "total_rules": len(applicable_rules),
            "rules_by_type": {
                comp_type.value: len([r for r in applicable_rules if r.compliance_type == comp_type])
                for comp_type in ComplianceType
            }
        }
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Jurisdiction not found: {str(e)}")

@app.get("/api/v1/rules")
async def get_compliance_rules(
    jurisdiction: Optional[ComplianceJurisdiction] = None,
    compliance_type: Optional[ComplianceType] = None,
    entity_type: Optional[str] = None
):
    """Get compliance rules with optional filtering"""
    try:
        all_rules = await rules_engine.get_applicable_rules(jurisdiction, compliance_type, entity_type)
        
        return {
            "total_rules": len(all_rules),
            "filters": {
                "jurisdiction": jurisdiction.value if jurisdiction else "all",
                "compliance_type": compliance_type.value if compliance_type else "all",
                "entity_type": entity_type or "all"
            },
            "rules": [
                {
                    "rule_id": rule.rule_id,
                    "name": rule.name,
                    "jurisdiction": rule.jurisdiction.value,
                    "compliance_type": rule.compliance_type.value,
                    "description": rule.description,
                    "severity": rule.severity.value,
                    "last_updated": rule.last_updated.isoformat(),
                    "source_url": rule.source_url
                }
                for rule in all_rules
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch rules: {str(e)}")

@app.post("/api/v1/validate")
async def validate_compliance_data(data: Dict):
    """Validate compliance data format and completeness"""
    required_fields = ["jurisdiction", "compliance_type", "entity_type"]
    missing_fields = [field for field in required_fields if field not in data]
    
    # Validate jurisdiction
    jurisdiction_valid = True
    try:
        if data.get("jurisdiction"):
            ComplianceJurisdiction(data["jurisdiction"])
    except ValueError:
        jurisdiction_valid = False
        missing_fields.append("valid_jurisdiction")
    
    # Validate compliance type
    compliance_type_valid = True
    try:
        if data.get("compliance_type"):
            ComplianceType(data["compliance_type"])
    except ValueError:
        compliance_type_valid = False
        missing_fields.append("valid_compliance_type")
    
    data_quality_score = 1.0
    if missing_fields:
        data_quality_score = max(0.0, 1.0 - (len(missing_fields) * 0.2))
    
    return {
        "valid": len(missing_fields) == 0,
        "missing_fields": missing_fields,
        "data_quality_score": round(data_quality_score, 2),
        "validations": {
            "jurisdiction": jurisdiction_valid,
            "compliance_type": compliance_type_valid,
            "required_fields": len([f for f in required_fields if f not in missing_fields]) == len(required_fields)
        },
        "recommendations": [] if len(missing_fields) == 0 else [
            f"Provide missing or correct field: {field}" for field in missing_fields
        ]
    }

@app.get("/api/v1/reports/summary")
async def get_compliance_summary():
    """Get compliance status summary with enhanced metrics"""
    # In production, this would query actual compliance data
    return {
        "summary": {
            "total_checks": 2847,
            "compliant_entities": 2456,
            "non_compliant_entities": 391,
            "compliance_rate": 86.3,
            "average_confidence_score": 0.891
        },
        "jurisdiction_breakdown": {
            "UK": {"checks": 542, "compliance_rate": 89.1},
            "EU": {"checks": 634, "compliance_rate": 87.4},
            "US": {"checks": 721, "compliance_rate": 83.2},
            "AU": {"checks": 398, "compliance_rate": 91.2},
            "CA": {"checks": 287, "compliance_rate": 88.5},
            "JP": {"checks": 156, "compliance_rate": 94.2},
            "SG": {"checks": 79, "compliance_rate": 92.4},
            "KR": {"checks": 30, "compliance_rate": 86.7}
        },
        "top_violations": [
            {"rule": "gdpr_compliance", "count": 67, "severity": "critical"},
            {"rule": "minimum_wage_compliance", "count": 45, "severity": "high"},
            {"rule": "working_time_directive", "count": 38, "severity": "medium"},
            {"rule": "holiday_entitlement", "count": 31, "severity": "high"},
            {"rule": "equal_opportunity_requirements", "count": 28, "severity": "high"}
        ],
        "compliance_trends": {
            "last_30_days": {"checks": 892, "compliance_rate": 88.1},
            "last_7_days": {"checks": 234, "compliance_rate": 89.7},
            "yesterday": {"checks": 41, "compliance_rate": 92.7}
        },
        "last_updated": datetime.now().isoformat()
    }

# Background task for bulk processing
async def process_bulk_compliance(batch_id: str, requests: List[ComplianceCheckRequest], service: ComplianceService):
    """Process bulk compliance checks in background"""
    logger.info(f"Starting background bulk processing for batch {batch_id}")
    
    results = []
    for i, request in enumerate(requests):
        try:
            result = await service.perform_compliance_check(request)
            results.append(result)
            logger.info(f"Processed {i+1}/{len(requests)} requests in batch {batch_id}")
        except Exception as e:
            logger.error(f"Failed to process request {i+1} in batch {batch_id}: {e}")
            continue
    
    logger.info(f"Completed background bulk processing for batch {batch_id}: {len(results)} successful")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("COMPLIANCE_PORT", 8003))
    uvicorn.run(app, host="0.0.0.0", port=port)