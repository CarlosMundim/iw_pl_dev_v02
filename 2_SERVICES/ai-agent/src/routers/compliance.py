"""
Compliance Checking Router
AI-powered regulatory compliance verification for multiple jurisdictions
"""

import time
import uuid
from typing import List, Dict, Any, Optional, Literal
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from enum import Enum

from src.services.ai_manager import AIManager
from src.config.database import DatabaseManager
from src.config.redis_client import RedisManager
from src.utils.logger import setup_logger, log_compliance_check

logger = setup_logger(__name__)
router = APIRouter()


class EntityType(str, Enum):
    TALENT = "talent"
    EMPLOYER = "employer"
    JOB_POSTING = "job_posting"
    CONTRACT = "contract"


class ComplianceStatus(str, Enum):
    COMPLIANT = "compliant"
    NON_COMPLIANT = "non_compliant"
    REQUIRES_REVIEW = "requires_review"
    INSUFFICIENT_DATA = "insufficient_data"


class IssueSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class ComplianceIssue(BaseModel):
    rule_category: str
    rule_name: str
    severity: IssueSeverity
    description: str
    recommendation: str
    affected_fields: List[str] = []


class ComplianceCheckRequest(BaseModel):
    entity_type: EntityType
    entity_id: str
    jurisdiction: str = Field(..., description="Jurisdiction code (UK, DE, AU, US, CA, FR, NL, SG, JP)")
    check_types: List[str] = Field(default=["all"], description="Specific compliance checks to run")
    include_recommendations: bool = Field(default=True)
    use_cached_results: bool = Field(default=True)


class ComplianceCheckResponse(BaseModel):
    check_id: str
    entity_type: EntityType
    entity_id: str
    jurisdiction: str
    status: ComplianceStatus
    overall_score: float = Field(..., description="Compliance score (0-1)")
    confidence_level: float = Field(..., description="AI confidence in assessment")
    issues_found: List[ComplianceIssue] = []
    recommendations: List[str] = []
    checked_at: str
    processing_time_ms: float
    cached: bool = False


class BulkComplianceRequest(BaseModel):
    entity_ids: List[str] = Field(..., max_items=50)
    entity_type: EntityType
    jurisdiction: str
    check_types: List[str] = Field(default=["all"])


class BulkComplianceResponse(BaseModel):
    total_entities: int
    processed_entities: int
    processing_time_ms: float
    results: List[ComplianceCheckResponse]


class ComplianceRule(BaseModel):
    rule_category: str
    rule_name: str
    description: str
    jurisdiction: str
    severity: IssueSeverity
    parameters: Dict[str, Any] = {}


# Dependency injection
async def get_ai_manager() -> AIManager:
    from src.main import app
    if not hasattr(app.state, 'ai_manager') or app.state.ai_manager is None:
        raise HTTPException(status_code=503, detail="AI Manager not initialized")
    return app.state.ai_manager


@router.post("/check", response_model=ComplianceCheckResponse)
async def check_compliance(
    request: ComplianceCheckRequest,
    background_tasks: BackgroundTasks,
    ai_manager: AIManager = Depends(get_ai_manager)
):
    """
    Perform comprehensive compliance check for an entity in a specific jurisdiction
    """
    start_time = time.time()
    check_id = str(uuid.uuid4())
    
    try:
        logger.info(f"Starting compliance check {check_id} for {request.entity_type} {request.entity_id} in {request.jurisdiction}")
        
        db_manager = DatabaseManager()
        redis_manager = RedisManager()
        
        # Validate jurisdiction
        from src.config.settings import get_settings
        settings = get_settings()
        if request.jurisdiction.upper() not in settings.supported_jurisdictions:
            raise HTTPException(
                status_code=400, 
                detail=f"Jurisdiction {request.jurisdiction} not supported"
            )
        
        # Check cache first
        cache_key = f"compliance:{request.entity_type}:{request.entity_id}:{request.jurisdiction}"
        cached_result = None
        
        if request.use_cached_results:
            cached_result = await redis_manager.get(cache_key)
        
        if cached_result and request.use_cached_results:
            cached_result['cached'] = True
            cached_result['processing_time_ms'] = (time.time() - start_time) * 1000
            return ComplianceCheckResponse(**cached_result)
        
        # Get entity data
        entity_data = await get_entity_data(request.entity_type, request.entity_id, db_manager)
        if not entity_data:
            raise HTTPException(status_code=404, detail=f"{request.entity_type} not found")
        
        # Get compliance rules for jurisdiction
        compliance_rules = await db_manager.get_compliance_rules(request.jurisdiction)
        if not compliance_rules:
            raise HTTPException(
                status_code=400, 
                detail=f"No compliance rules found for jurisdiction {request.jurisdiction}"
            )
        
        # Filter rules by check types
        if "all" not in request.check_types:
            compliance_rules = [
                rule for rule in compliance_rules 
                if rule['rule_category'] in request.check_types
            ]
        
        # Perform AI-powered compliance analysis
        compliance_result = await analyze_compliance(
            entity_data, compliance_rules, request.jurisdiction, ai_manager
        )
        
        # Prepare response
        processing_time = (time.time() - start_time) * 1000
        
        response = ComplianceCheckResponse(
            check_id=check_id,
            entity_type=request.entity_type,
            entity_id=request.entity_id,
            jurisdiction=request.jurisdiction,
            status=compliance_result['status'],
            overall_score=compliance_result['overall_score'],
            confidence_level=compliance_result['confidence_level'],
            issues_found=compliance_result['issues'],
            recommendations=compliance_result['recommendations'] if request.include_recommendations else [],
            checked_at=time.strftime('%Y-%m-%dT%H:%M:%SZ'),
            processing_time_ms=processing_time,
            cached=False
        )
        
        # Cache the result (without processing time and cached flag)
        cache_data = response.dict()
        cache_data.pop('processing_time_ms', None)
        cache_data.pop('cached', None)
        await redis_manager.set(cache_key, cache_data, ttl=86400)  # Cache for 24h
        
        # Save to database in background
        background_tasks.add_task(
            save_compliance_check,
            db_manager,
            check_id,
            request,
            compliance_result
        )
        
        # Log the result
        log_compliance_check(
            logger, request.entity_id, request.jurisdiction, 
            len(compliance_result['issues']), processing_time, check_id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Compliance check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk-check", response_model=BulkComplianceResponse)
async def bulk_compliance_check(
    request: BulkComplianceRequest,
    ai_manager: AIManager = Depends(get_ai_manager)
):
    """
    Perform compliance checks for multiple entities
    """
    start_time = time.time()
    
    try:
        logger.info(f"Starting bulk compliance check for {len(request.entity_ids)} entities")
        
        results = []
        
        for entity_id in request.entity_ids:
            try:
                check_request = ComplianceCheckRequest(
                    entity_type=request.entity_type,
                    entity_id=entity_id,
                    jurisdiction=request.jurisdiction,
                    check_types=request.check_types,
                    use_cached_results=True
                )
                
                result = await check_compliance(
                    check_request, 
                    BackgroundTasks(),
                    ai_manager
                )
                results.append(result)
                
            except Exception as e:
                logger.error(f"Failed to check compliance for entity {entity_id}: {e}")
                # Continue with other entities
                continue
        
        processing_time = (time.time() - start_time) * 1000
        
        return BulkComplianceResponse(
            total_entities=len(request.entity_ids),
            processed_entities=len(results),
            processing_time_ms=processing_time,
            results=results
        )
        
    except Exception as e:
        logger.error(f"Bulk compliance check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/rules/{jurisdiction}")
async def get_compliance_rules(jurisdiction: str):
    """
    Get all compliance rules for a specific jurisdiction
    """
    try:
        db_manager = DatabaseManager()
        rules = await db_manager.get_compliance_rules(jurisdiction)
        
        return {
            "jurisdiction": jurisdiction.upper(),
            "total_rules": len(rules),
            "rules": [
                ComplianceRule(**rule) for rule in rules
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get compliance rules: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jurisdictions")
async def get_supported_jurisdictions():
    """
    Get list of supported jurisdictions
    """
    from src.config.settings import get_settings
    settings = get_settings()
    
    jurisdiction_details = {
        "UK": {"name": "United Kingdom", "code": "UK", "region": "Europe"},
        "DE": {"name": "Germany", "code": "DE", "region": "Europe"},
        "AU": {"name": "Australia", "code": "AU", "region": "Asia-Pacific"},
        "US": {"name": "United States", "code": "US", "region": "North America"},
        "CA": {"name": "Canada", "code": "CA", "region": "North America"},
        "FR": {"name": "France", "code": "FR", "region": "Europe"},
        "NL": {"name": "Netherlands", "code": "NL", "region": "Europe"},
        "SG": {"name": "Singapore", "code": "SG", "region": "Asia-Pacific"},
        "JP": {"name": "Japan", "code": "JP", "region": "Asia-Pacific"}
    }
    
    return {
        "supported_jurisdictions": [
            jurisdiction_details.get(code, {"name": code, "code": code, "region": "Unknown"})
            for code in settings.supported_jurisdictions
        ]
    }


async def get_entity_data(entity_type: EntityType, entity_id: str, 
                         db_manager: DatabaseManager) -> Optional[Dict[str, Any]]:
    """Get entity data based on type"""
    try:
        if entity_type == EntityType.TALENT:
            return await db_manager.get_talent_profile(entity_id)
        elif entity_type == EntityType.EMPLOYER:
            query = """
            SELECT e.*, p.email, p.first_name, p.last_name
            FROM users.employers e
            JOIN users.profiles p ON e.profile_id = p.id
            WHERE e.id = :entity_id
            """
            result = await db_manager.execute_query(query, {"entity_id": entity_id})
            return dict(result[0]) if result else None
        elif entity_type == EntityType.JOB_POSTING:
            return await db_manager.get_job_posting(entity_id)
        elif entity_type == EntityType.CONTRACT:
            query = """
            SELECT * FROM contracts.agreements
            WHERE id = :entity_id
            """
            result = await db_manager.execute_query(query, {"entity_id": entity_id})
            return dict(result[0]) if result else None
        else:
            return None
            
    except Exception as e:
        logger.error(f"Failed to get entity data: {e}")
        return None


async def analyze_compliance(entity_data: Dict[str, Any], rules: List[Dict], 
                           jurisdiction: str, ai_manager: AIManager) -> Dict[str, Any]:
    """Perform AI-powered compliance analysis"""
    try:
        issues = []
        recommendations = []
        rule_scores = []
        
        for rule in rules:
            # Analyze each rule using AI
            rule_analysis = await analyze_compliance_rule(
                entity_data, rule, ai_manager
            )
            
            if not rule_analysis['compliant']:
                issue = ComplianceIssue(
                    rule_category=rule['rule_category'],
                    rule_name=rule['rule_name'],
                    severity=IssueSeverity(rule['severity']),
                    description=rule_analysis['issue_description'],
                    recommendation=rule_analysis['recommendation'],
                    affected_fields=rule_analysis.get('affected_fields', [])
                )
                issues.append(issue)
            
            rule_scores.append(rule_analysis['compliance_score'])
            
            if rule_analysis['recommendation']:
                recommendations.append(rule_analysis['recommendation'])
        
        # Calculate overall compliance score
        overall_score = sum(rule_scores) / len(rule_scores) if rule_scores else 0.0
        
        # Determine compliance status
        critical_issues = [i for i in issues if i.severity == IssueSeverity.CRITICAL]
        high_issues = [i for i in issues if i.severity == IssueSeverity.HIGH]
        
        if critical_issues:
            status = ComplianceStatus.NON_COMPLIANT
        elif high_issues or overall_score < 0.7:
            status = ComplianceStatus.REQUIRES_REVIEW
        elif overall_score < 0.5:
            status = ComplianceStatus.NON_COMPLIANT
        elif overall_score >= 0.8:
            status = ComplianceStatus.COMPLIANT
        else:
            status = ComplianceStatus.REQUIRES_REVIEW
        
        # Calculate confidence based on data completeness
        data_completeness = calculate_data_completeness(entity_data)
        confidence_level = min(0.95, data_completeness * 0.8 + 0.2)
        
        return {
            'status': status,
            'overall_score': round(overall_score, 3),
            'confidence_level': round(confidence_level, 3),
            'issues': issues,
            'recommendations': list(set(recommendations))  # Remove duplicates
        }
        
    except Exception as e:
        logger.error(f"Compliance analysis failed: {e}")
        return {
            'status': ComplianceStatus.INSUFFICIENT_DATA,
            'overall_score': 0.0,
            'confidence_level': 0.1,
            'issues': [],
            'recommendations': ["Unable to perform compliance analysis due to system error"]
        }


async def analyze_compliance_rule(entity_data: Dict[str, Any], rule: Dict, 
                                ai_manager: AIManager) -> Dict[str, Any]:
    """Analyze a specific compliance rule using AI"""
    try:
        # Create context for AI analysis
        entity_context = create_entity_context(entity_data)
        rule_context = f"""
        Rule Category: {rule['rule_category']}
        Rule Name: {rule['rule_name']}
        Description: {rule['rule_description']}
        Severity: {rule['severity']}
        Parameters: {rule.get('rule_parameters', {})}
        """
        
        prompt = f"""
        Entity Data:
        {entity_context}
        
        Compliance Rule:
        {rule_context}
        
        Analyze if the entity data complies with this rule. Return a JSON response with:
        {{
            "compliant": true/false,
            "compliance_score": 0.0-1.0,
            "issue_description": "description if non-compliant",
            "recommendation": "specific recommendation",
            "affected_fields": ["list", "of", "fields"],
            "explanation": "brief explanation"
        }}
        """
        
        system_prompt = """
        You are a regulatory compliance expert. Analyze the provided entity data against 
        the compliance rule and determine if it meets the requirements. Be thorough but 
        practical in your assessment. Consider both letter and spirit of the rule.
        Return only the JSON response, no other text.
        """
        
        result = await ai_manager.chat_completion(
            prompt=prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=1000
        )
        
        import json
        analysis = json.loads(result['content'])
        return analysis
        
    except Exception as e:
        logger.error(f"Rule analysis failed: {e}")
        return {
            'compliant': False,
            'compliance_score': 0.0,
            'issue_description': f"Unable to analyze rule: {rule['rule_name']}",
            'recommendation': "Manual review required",
            'affected_fields': [],
            'explanation': "System error during analysis"
        }


def create_entity_context(entity_data: Dict[str, Any]) -> str:
    """Create formatted context string from entity data"""
    context_lines = []
    
    for key, value in entity_data.items():
        if value is not None and value != "":
            if isinstance(value, (list, dict)):
                context_lines.append(f"{key}: {json.dumps(value)}")
            else:
                context_lines.append(f"{key}: {value}")
    
    return "\n".join(context_lines)


def calculate_data_completeness(entity_data: Dict[str, Any]) -> float:
    """Calculate how complete the entity data is"""
    total_fields = len(entity_data)
    if total_fields == 0:
        return 0.0
    
    complete_fields = sum(
        1 for value in entity_data.values() 
        if value is not None and value != "" and value != []
    )
    
    return complete_fields / total_fields


async def save_compliance_check(db_manager: DatabaseManager, check_id: str,
                              request: ComplianceCheckRequest, result: Dict[str, Any]):
    """Save compliance check to database"""
    try:
        check_data = {
            'id': check_id,
            'entity_type': request.entity_type.value,
            'entity_id': request.entity_id,
            'jurisdiction': request.jurisdiction.upper(),
            'check_type': ','.join(request.check_types),
            'status': result['status'].value,
            'results': json.dumps({
                'overall_score': result['overall_score'],
                'confidence_level': result['confidence_level'],
                'issues_count': len(result['issues'])
            }),
            'issues_found': json.dumps([issue.dict() for issue in result['issues']]),
            'recommendations': json.dumps(result['recommendations']),
            'confidence_score': result['confidence_level'],
            'checked_by': 'ai_agent'
        }
        
        await db_manager.save_compliance_check(check_data)
        
    except Exception as e:
        logger.error(f"Failed to save compliance check to database: {e}")