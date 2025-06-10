from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
from datetime import datetime
from enum import Enum

class ComplianceJurisdiction(str, Enum):
    UK = "UK"
    EU = "EU"
    US = "US"
    AU = "AU"
    CA = "CA"
    JP = "JP"
    SG = "SG"
    KR = "KR"

class ComplianceType(str, Enum):
    EMPLOYMENT = "employment"
    DATA_PROTECTION = "data_protection"
    FINANCIAL = "financial"
    SAFETY = "safety"
    IMMIGRATION = "immigration"
    TAX = "tax"

class ViolationSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ComplianceStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class JobPosting(BaseModel):
    title: str
    description: str
    requirements: List[str]
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: str = "USD"
    employment_type: str = "full-time"
    working_hours: Optional[float] = None
    location: str
    remote_work: bool = False
    benefits: List[str] = []
    company_name: str
    company_size: Optional[str] = None
    industry: Optional[str] = None
    visa_sponsorship: bool = False
    equal_opportunity_statement: Optional[str] = None

class EmploymentContract(BaseModel):
    employee_name: str
    employer_name: str
    position: str
    start_date: datetime
    salary: float
    currency: str = "USD"
    working_hours: float = 40.0
    overtime_rate: Optional[float] = None
    probation_period: Optional[int] = None
    notice_period: Optional[int] = None
    holiday_entitlement: Optional[int] = None
    benefits: List[str] = []
    termination_conditions: List[str] = []
    confidentiality_clause: bool = False
    non_compete_clause: bool = False

class CandidateData(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    nationality: Optional[str] = None
    work_authorization: List[str] = []
    address: Optional[str] = None
    emergency_contact: Optional[Dict[str, str]] = None
    medical_information: Optional[Dict[str, Any]] = None
    background_check_consent: bool = False
    data_processing_consent: bool = False
    marketing_consent: bool = False

class ComplianceRule(BaseModel):
    rule_id: str
    name: str
    jurisdiction: ComplianceJurisdiction
    compliance_type: ComplianceType
    description: str
    requirements: List[str]
    penalties: List[str]
    enforcement_authority: str
    last_updated: datetime
    effective_date: datetime
    source_url: Optional[str] = None
    severity: ViolationSeverity = ViolationSeverity.MEDIUM

class ComplianceViolation(BaseModel):
    rule_id: str
    rule_name: str
    severity: ViolationSeverity
    description: str
    field_name: Optional[str] = None
    current_value: Optional[str] = None
    required_value: Optional[str] = None
    remediation_steps: List[str]
    deadline: Optional[datetime] = None
    fine_amount: Optional[float] = None
    legal_reference: Optional[str] = None

class ComplianceRecommendation(BaseModel):
    recommendation_id: str
    category: str
    priority: str
    title: str
    description: str
    implementation_steps: List[str]
    estimated_effort: str  # "low", "medium", "high"
    cost_impact: str  # "none", "low", "medium", "high"
    compliance_benefit: str
    deadline: Optional[datetime] = None

class ComplianceCheckRequest(BaseModel):
    jurisdiction: ComplianceJurisdiction
    compliance_type: ComplianceType
    entity_type: str = Field(..., description="Type of entity being checked (job_posting, contract, candidate_data)")
    data: Union[JobPosting, EmploymentContract, CandidateData, Dict[str, Any]]
    rules: Optional[List[str]] = None
    additional_context: Optional[Dict[str, Any]] = None
    urgency: str = Field(default="normal", description="normal, high, critical")

class ComplianceCheckResult(BaseModel):
    check_id: str
    status: ComplianceStatus
    compliant: bool
    jurisdiction: ComplianceJurisdiction
    compliance_type: ComplianceType
    entity_type: str
    checks_performed: List[str]
    violations: List[ComplianceViolation]
    recommendations: List[ComplianceRecommendation]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    risk_score: float = Field(..., ge=0.0, le=1.0)
    processing_time_ms: int
    checked_at: datetime
    expires_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class BulkComplianceRequest(BaseModel):
    requests: List[ComplianceCheckRequest]
    batch_id: Optional[str] = None
    priority: str = Field(default="normal", description="normal, high, critical")
    notification_webhook: Optional[str] = None

class BulkComplianceResult(BaseModel):
    batch_id: str
    status: ComplianceStatus
    total_requests: int
    completed: int
    failed: int
    results: List[ComplianceCheckResult]
    started_at: datetime
    completed_at: Optional[datetime] = None
    summary: Dict[str, Any]

class ComplianceReport(BaseModel):
    report_id: str
    report_type: str
    jurisdiction: Optional[ComplianceJurisdiction] = None
    date_range: Dict[str, datetime]
    total_checks: int
    compliant_entities: int
    non_compliant_entities: int
    compliance_rate: float
    top_violations: List[Dict[str, Any]]
    trends: List[Dict[str, Any]]
    recommendations: List[str]
    generated_at: datetime
    generated_by: str

class JurisdictionInfo(BaseModel):
    jurisdiction: ComplianceJurisdiction
    name: str
    country_code: str
    compliance_types: List[ComplianceType]
    key_regulations: List[str]
    enforcement_agencies: List[str]
    data_protection_authority: Optional[str] = None
    minimum_wage: Optional[Dict[str, float]] = None
    working_time_limits: Optional[Dict[str, int]] = None
    mandatory_benefits: List[str] = []
    holiday_requirements: Optional[int] = None
    last_updated: datetime

class ComplianceAuditLog(BaseModel):
    log_id: str
    check_id: str
    action: str
    user_id: Optional[str] = None
    timestamp: datetime
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ComplianceAlert(BaseModel):
    alert_id: str
    alert_type: str
    severity: ViolationSeverity
    jurisdiction: ComplianceJurisdiction
    title: str
    description: str
    affected_entities: List[str]
    action_required: bool
    deadline: Optional[datetime] = None
    created_at: datetime
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None

class ComplianceConfiguration(BaseModel):
    jurisdiction: ComplianceJurisdiction
    compliance_type: ComplianceType
    enabled_rules: List[str]
    disabled_rules: List[str] = []
    custom_thresholds: Dict[str, float] = {}
    notification_settings: Dict[str, bool] = {}
    auto_remediation: bool = False
    escalation_rules: List[Dict[str, Any]] = []
    last_updated: datetime
    updated_by: str

class ComplianceMetrics(BaseModel):
    period: str
    total_checks: int
    compliance_rate: float
    average_processing_time: float
    top_violations: List[Dict[str, Any]]
    jurisdiction_breakdown: Dict[str, Dict[str, Any]]
    trend_data: List[Dict[str, Any]]
    performance_metrics: Dict[str, float]
    calculated_at: datetime