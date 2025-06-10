import uuid
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import json
import logging

from ..models import (
    ComplianceCheckRequest,
    ComplianceCheckResult,
    ComplianceViolation,
    ComplianceRecommendation,
    ComplianceJurisdiction,
    ComplianceType,
    ViolationSeverity,
    ComplianceStatus,
    JobPosting,
    EmploymentContract,
    CandidateData
)
from .rules_engine import RulesEngine
from .jurisdiction_service import JurisdictionService

logger = logging.getLogger(__name__)

class ComplianceService:
    def __init__(self):
        self.rules_engine = RulesEngine()
        self.jurisdiction_service = JurisdictionService()
        
    async def perform_compliance_check(self, request: ComplianceCheckRequest) -> ComplianceCheckResult:
        """Perform comprehensive compliance check"""
        start_time = datetime.now()
        check_id = str(uuid.uuid4())
        
        try:
            # Get applicable rules for jurisdiction and compliance type
            applicable_rules = await self.rules_engine.get_applicable_rules(
                request.jurisdiction,
                request.compliance_type,
                request.entity_type
            )
            
            # Perform compliance validation
            violations = []
            checks_performed = []
            
            for rule in applicable_rules:
                try:
                    rule_violations = await self._check_rule_compliance(
                        rule, 
                        request.data, 
                        request.jurisdiction,
                        request.entity_type
                    )
                    violations.extend(rule_violations)
                    checks_performed.append(rule.rule_id)
                except Exception as e:
                    logger.error(f"Error checking rule {rule.rule_id}: {e}")
                    continue
            
            # Calculate compliance status
            is_compliant = len(violations) == 0
            confidence_score = self._calculate_confidence_score(violations, applicable_rules)
            risk_score = self._calculate_risk_score(violations)
            
            # Generate recommendations
            recommendations = await self._generate_recommendations(
                violations, 
                request.jurisdiction, 
                request.compliance_type,
                request.entity_type
            )
            
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            
            return ComplianceCheckResult(
                check_id=check_id,
                status=ComplianceStatus.COMPLETED,
                compliant=is_compliant,
                jurisdiction=request.jurisdiction,
                compliance_type=request.compliance_type,
                entity_type=request.entity_type,
                checks_performed=checks_performed,
                violations=violations,
                recommendations=recommendations,
                confidence_score=confidence_score,
                risk_score=risk_score,
                processing_time_ms=int(processing_time),
                checked_at=start_time,
                expires_at=start_time + timedelta(days=30),
                metadata={
                    "total_rules_checked": len(applicable_rules),
                    "urgency": request.urgency,
                    "additional_context": request.additional_context
                }
            )
            
        except Exception as e:
            logger.error(f"Compliance check failed: {e}")
            raise
    
    async def _check_rule_compliance(
        self, 
        rule: Any, 
        data: Any, 
        jurisdiction: ComplianceJurisdiction,
        entity_type: str
    ) -> List[ComplianceViolation]:
        """Check compliance against a specific rule"""
        violations = []
        
        try:
            if entity_type == "job_posting":
                violations.extend(await self._check_job_posting_compliance(rule, data, jurisdiction))
            elif entity_type == "employment_contract":
                violations.extend(await self._check_contract_compliance(rule, data, jurisdiction))
            elif entity_type == "candidate_data":
                violations.extend(await self._check_candidate_data_compliance(rule, data, jurisdiction))
            else:
                violations.extend(await self._check_generic_compliance(rule, data, jurisdiction))
                
        except Exception as e:
            logger.error(f"Rule compliance check failed for {rule.rule_id}: {e}")
        
        return violations
    
    async def _check_job_posting_compliance(
        self, 
        rule: Any, 
        job_posting: Dict[str, Any], 
        jurisdiction: ComplianceJurisdiction
    ) -> List[ComplianceViolation]:
        """Check job posting compliance"""
        violations = []
        
        # Minimum wage compliance
        if rule.rule_id == "minimum_wage_compliance":
            min_wage = await self.jurisdiction_service.get_minimum_wage(jurisdiction)
            if job_posting.get("salary_min") and job_posting["salary_min"] < min_wage:
                violations.append(ComplianceViolation(
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    severity=ViolationSeverity.HIGH,
                    description=f"Salary below minimum wage requirement of {min_wage}",
                    field_name="salary_min",
                    current_value=str(job_posting.get("salary_min")),
                    required_value=str(min_wage),
                    remediation_steps=[
                        f"Increase minimum salary to at least {min_wage}",
                        "Review local minimum wage regulations",
                        "Update job posting with compliant salary range"
                    ],
                    legal_reference=rule.source_url
                ))
        
        # Working hours compliance
        elif rule.rule_id == "working_time_directive":
            max_hours = await self.jurisdiction_service.get_max_working_hours(jurisdiction)
            if job_posting.get("working_hours") and job_posting["working_hours"] > max_hours:
                violations.append(ComplianceViolation(
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    severity=ViolationSeverity.MEDIUM,
                    description=f"Working hours exceed legal maximum of {max_hours} hours per week",
                    field_name="working_hours",
                    current_value=str(job_posting.get("working_hours")),
                    required_value=str(max_hours),
                    remediation_steps=[
                        f"Reduce working hours to maximum {max_hours} per week",
                        "Consider flexible working arrangements",
                        "Review overtime compensation policies"
                    ],
                    legal_reference=rule.source_url
                ))
        
        # Equal opportunity compliance
        elif rule.rule_id == "equal_opportunity_requirements":
            if not job_posting.get("equal_opportunity_statement"):
                violations.append(ComplianceViolation(
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    severity=ViolationSeverity.MEDIUM,
                    description="Missing equal opportunity employment statement",
                    field_name="equal_opportunity_statement",
                    current_value="None",
                    required_value="Required equal opportunity statement",
                    remediation_steps=[
                        "Add equal opportunity employment statement",
                        "Review anti-discrimination policies",
                        "Ensure inclusive language in job description"
                    ],
                    legal_reference=rule.source_url
                ))
        
        # Visa sponsorship compliance
        elif rule.rule_id == "immigration_compliance":
            if jurisdiction in [ComplianceJurisdiction.US, ComplianceJurisdiction.UK, ComplianceJurisdiction.AU]:
                if job_posting.get("visa_sponsorship") and not job_posting.get("sponsor_license"):
                    violations.append(ComplianceViolation(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=ViolationSeverity.HIGH,
                        description="Visa sponsorship offered without proper licensing",
                        field_name="sponsor_license",
                        current_value="Not specified",
                        required_value="Valid sponsor license required",
                        remediation_steps=[
                            "Obtain proper sponsor license",
                            "Remove visa sponsorship claim",
                            "Consult immigration lawyer"
                        ],
                        legal_reference=rule.source_url
                    ))
        
        return violations
    
    async def _check_contract_compliance(
        self, 
        rule: Any, 
        contract: Dict[str, Any], 
        jurisdiction: ComplianceJurisdiction
    ) -> List[ComplianceViolation]:
        """Check employment contract compliance"""
        violations = []
        
        # Probation period compliance
        if rule.rule_id == "probation_period_limits":
            max_probation = await self.jurisdiction_service.get_max_probation_period(jurisdiction)
            if contract.get("probation_period") and contract["probation_period"] > max_probation:
                violations.append(ComplianceViolation(
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    severity=ViolationSeverity.MEDIUM,
                    description=f"Probation period exceeds legal maximum of {max_probation} days",
                    field_name="probation_period",
                    current_value=str(contract.get("probation_period")),
                    required_value=str(max_probation),
                    remediation_steps=[
                        f"Reduce probation period to maximum {max_probation} days",
                        "Review employment law requirements",
                        "Update contract template"
                    ],
                    legal_reference=rule.source_url
                ))
        
        # Holiday entitlement compliance
        elif rule.rule_id == "holiday_entitlement":
            min_holidays = await self.jurisdiction_service.get_min_holiday_entitlement(jurisdiction)
            if contract.get("holiday_entitlement") and contract["holiday_entitlement"] < min_holidays:
                violations.append(ComplianceViolation(
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    severity=ViolationSeverity.HIGH,
                    description=f"Holiday entitlement below legal minimum of {min_holidays} days",
                    field_name="holiday_entitlement",
                    current_value=str(contract.get("holiday_entitlement")),
                    required_value=str(min_holidays),
                    remediation_steps=[
                        f"Increase holiday entitlement to minimum {min_holidays} days",
                        "Review statutory holiday requirements",
                        "Update all employee contracts"
                    ],
                    legal_reference=rule.source_url
                ))
        
        # Notice period compliance
        elif rule.rule_id == "notice_period_requirements":
            min_notice = await self.jurisdiction_service.get_min_notice_period(jurisdiction)
            if contract.get("notice_period") and contract["notice_period"] < min_notice:
                violations.append(ComplianceViolation(
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    severity=ViolationSeverity.MEDIUM,
                    description=f"Notice period below legal minimum of {min_notice} days",
                    field_name="notice_period",
                    current_value=str(contract.get("notice_period")),
                    required_value=str(min_notice),
                    remediation_steps=[
                        f"Increase notice period to minimum {min_notice} days",
                        "Review termination procedures",
                        "Ensure mutual notice requirements"
                    ],
                    legal_reference=rule.source_url
                ))
        
        return violations
    
    async def _check_candidate_data_compliance(
        self, 
        rule: Any, 
        candidate_data: Dict[str, Any], 
        jurisdiction: ComplianceJurisdiction
    ) -> List[ComplianceViolation]:
        """Check candidate data protection compliance"""
        violations = []
        
        # GDPR/Data protection compliance
        if rule.rule_id == "gdpr_compliance":
            if jurisdiction in [ComplianceJurisdiction.UK, ComplianceJurisdiction.EU]:
                if not candidate_data.get("data_processing_consent"):
                    violations.append(ComplianceViolation(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=ViolationSeverity.CRITICAL,
                        description="Missing explicit consent for data processing",
                        field_name="data_processing_consent",
                        current_value="False",
                        required_value="True",
                        remediation_steps=[
                            "Obtain explicit consent for data processing",
                            "Implement consent management system",
                            "Provide clear privacy notice"
                        ],
                        legal_reference=rule.source_url
                    ))
        
        # Age verification compliance
        elif rule.rule_id == "age_verification":
            if candidate_data.get("date_of_birth"):
                birth_date = datetime.fromisoformat(candidate_data["date_of_birth"])
                age = (datetime.now() - birth_date).days / 365.25
                min_age = await self.jurisdiction_service.get_min_working_age(jurisdiction)
                
                if age < min_age:
                    violations.append(ComplianceViolation(
                        rule_id=rule.rule_id,
                        rule_name=rule.name,
                        severity=ViolationSeverity.CRITICAL,
                        description=f"Candidate below minimum working age of {min_age}",
                        field_name="date_of_birth",
                        current_value=f"Age: {age:.1f}",
                        required_value=f"Minimum age: {min_age}",
                        remediation_steps=[
                            "Verify candidate age with documentation",
                            "Review child labor laws",
                            "Implement age verification process"
                        ],
                        legal_reference=rule.source_url
                    ))
        
        # Right to work compliance
        elif rule.rule_id == "right_to_work":
            if not candidate_data.get("work_authorization"):
                violations.append(ComplianceViolation(
                    rule_id=rule.rule_id,
                    rule_name=rule.name,
                    severity=ViolationSeverity.HIGH,
                    description="Work authorization status not verified",
                    field_name="work_authorization",
                    current_value="Not specified",
                    required_value="Valid work authorization required",
                    remediation_steps=[
                        "Verify right to work documentation",
                        "Implement I-9/right to work process",
                        "Maintain proper records"
                    ],
                    legal_reference=rule.source_url
                ))
        
        return violations
    
    async def _check_generic_compliance(
        self, 
        rule: Any, 
        data: Dict[str, Any], 
        jurisdiction: ComplianceJurisdiction
    ) -> List[ComplianceViolation]:
        """Check generic compliance rules"""
        violations = []
        
        # This would contain generic compliance checks that apply to multiple entity types
        # For now, returning empty list as specific implementations are above
        
        return violations
    
    def _calculate_confidence_score(self, violations: List[ComplianceViolation], rules: List[Any]) -> float:
        """Calculate confidence score based on violations and rules checked"""
        if not rules:
            return 0.0
        
        # Base confidence is high if we checked many rules
        base_confidence = min(0.9, 0.5 + (len(rules) * 0.05))
        
        # Reduce confidence based on severity and number of violations
        violation_penalty = 0.0
        for violation in violations:
            if violation.severity == ViolationSeverity.CRITICAL:
                violation_penalty += 0.3
            elif violation.severity == ViolationSeverity.HIGH:
                violation_penalty += 0.2
            elif violation.severity == ViolationSeverity.MEDIUM:
                violation_penalty += 0.1
            else:
                violation_penalty += 0.05
        
        confidence = max(0.0, base_confidence - violation_penalty)
        return round(confidence, 3)
    
    def _calculate_risk_score(self, violations: List[ComplianceViolation]) -> float:
        """Calculate risk score based on violations"""
        if not violations:
            return 0.0
        
        risk_score = 0.0
        for violation in violations:
            if violation.severity == ViolationSeverity.CRITICAL:
                risk_score += 0.4
            elif violation.severity == ViolationSeverity.HIGH:
                risk_score += 0.3
            elif violation.severity == ViolationSeverity.MEDIUM:
                risk_score += 0.2
            else:
                risk_score += 0.1
        
        return min(1.0, risk_score)
    
    async def _generate_recommendations(
        self, 
        violations: List[ComplianceViolation], 
        jurisdiction: ComplianceJurisdiction,
        compliance_type: ComplianceType,
        entity_type: str
    ) -> List[ComplianceRecommendation]:
        """Generate compliance recommendations"""
        recommendations = []
        
        if not violations:
            # General good practice recommendations
            recommendations.append(ComplianceRecommendation(
                recommendation_id=str(uuid.uuid4()),
                category="best_practice",
                priority="low",
                title="Maintain Current Compliance Standards",
                description="Continue following current practices to maintain compliance",
                implementation_steps=[
                    "Schedule regular compliance reviews",
                    "Monitor regulatory changes",
                    "Maintain documentation"
                ],
                estimated_effort="low",
                cost_impact="none",
                compliance_benefit="Ongoing compliance maintenance"
            ))
        else:
            # Generate recommendations based on violations
            critical_violations = [v for v in violations if v.severity == ViolationSeverity.CRITICAL]
            if critical_violations:
                recommendations.append(ComplianceRecommendation(
                    recommendation_id=str(uuid.uuid4()),
                    category="urgent_action",
                    priority="critical",
                    title="Address Critical Compliance Violations",
                    description="Immediate action required to address critical compliance issues",
                    implementation_steps=[
                        "Stop current process until violations are resolved",
                        "Consult legal counsel",
                        "Implement immediate corrective measures"
                    ],
                    estimated_effort="high",
                    cost_impact="medium",
                    compliance_benefit="Avoid legal penalties and regulatory action",
                    deadline=datetime.now() + timedelta(days=7)
                ))
            
            # Policy review recommendation
            if len(violations) > 3:
                recommendations.append(ComplianceRecommendation(
                    recommendation_id=str(uuid.uuid4()),
                    category="policy_review",
                    priority="high",
                    title="Comprehensive Policy Review",
                    description="Multiple violations indicate need for policy review",
                    implementation_steps=[
                        "Conduct full compliance audit",
                        "Review and update policies",
                        "Implement staff training",
                        "Establish monitoring procedures"
                    ],
                    estimated_effort="high",
                    cost_impact="medium",
                    compliance_benefit="Systematic compliance improvement"
                ))
            
            # Training recommendation
            recommendations.append(ComplianceRecommendation(
                recommendation_id=str(uuid.uuid4()),
                category="training",
                priority="medium",
                title="Staff Compliance Training",
                description="Enhance team understanding of compliance requirements",
                implementation_steps=[
                    "Develop compliance training program",
                    "Schedule regular training sessions",
                    "Create compliance checklists",
                    "Implement certification process"
                ],
                estimated_effort="medium",
                cost_impact="low",
                compliance_benefit="Reduced future violations through education"
            ))
        
        return recommendations