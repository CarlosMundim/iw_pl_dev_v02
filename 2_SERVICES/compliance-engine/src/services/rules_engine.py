from typing import List, Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass
import json

from ..models import ComplianceJurisdiction, ComplianceType, ViolationSeverity

@dataclass
class ComplianceRule:
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
    entity_types: List[str] = None

class RulesEngine:
    def __init__(self):
        self.rules = self._load_compliance_rules()
    
    def _load_compliance_rules(self) -> List[ComplianceRule]:
        """Load compliance rules for all jurisdictions"""
        rules = []
        
        # UK Rules
        rules.extend(self._get_uk_rules())
        
        # EU Rules
        rules.extend(self._get_eu_rules())
        
        # US Rules
        rules.extend(self._get_us_rules())
        
        # Australia Rules
        rules.extend(self._get_au_rules())
        
        # Canada Rules
        rules.extend(self._get_ca_rules())
        
        # Japan Rules
        rules.extend(self._get_jp_rules())
        
        # Singapore Rules
        rules.extend(self._get_sg_rules())
        
        # South Korea Rules
        rules.extend(self._get_kr_rules())
        
        return rules
    
    async def get_applicable_rules(
        self, 
        jurisdiction: ComplianceJurisdiction,
        compliance_type: ComplianceType,
        entity_type: str
    ) -> List[ComplianceRule]:
        """Get applicable rules for jurisdiction, compliance type, and entity type"""
        applicable_rules = []
        
        for rule in self.rules:
            if (rule.jurisdiction == jurisdiction and 
                rule.compliance_type == compliance_type and
                (not rule.entity_types or entity_type in rule.entity_types)):
                applicable_rules.append(rule)
        
        return applicable_rules
    
    def _get_uk_rules(self) -> List[ComplianceRule]:
        """UK compliance rules"""
        return [
            ComplianceRule(
                rule_id="uk_minimum_wage",
                name="National Minimum Wage",
                jurisdiction=ComplianceJurisdiction.UK,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Employers must pay at least the National Minimum Wage",
                requirements=[
                    "Pay at least £10.42 per hour (23+ years)",
                    "Pay at least £10.18 per hour (21-22 years)", 
                    "Pay at least £7.49 per hour (18-20 years)",
                    "Pay at least £5.28 per hour (apprentices)"
                ],
                penalties=["Fine up to £20,000 per worker", "Public naming", "Criminal prosecution"],
                enforcement_authority="HM Revenue and Customs (HMRC)",
                last_updated=datetime(2024, 4, 1),
                effective_date=datetime(2024, 4, 1),
                source_url="https://www.gov.uk/national-minimum-wage-rates",
                severity=ViolationSeverity.HIGH,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="uk_working_time",
                name="Working Time Regulations",
                jurisdiction=ComplianceJurisdiction.UK,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Limits on working hours and rest periods",
                requirements=[
                    "Maximum 48 hours per week average",
                    "11 hours rest between working days",
                    "24 hours rest each week",
                    "20 minutes break for 6+ hour shifts"
                ],
                penalties=["Unlimited fine", "Compensation to workers"],
                enforcement_authority="Health and Safety Executive (HSE)",
                last_updated=datetime(2024, 1, 1),
                effective_date=datetime(1998, 10, 1),
                source_url="https://www.gov.uk/maximum-weekly-working-hours",
                severity=ViolationSeverity.MEDIUM,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="uk_holiday_entitlement",
                name="Holiday Entitlement",
                jurisdiction=ComplianceJurisdiction.UK,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Statutory holiday entitlement for workers",
                requirements=[
                    "5.6 weeks paid holiday per year",
                    "28 days for full-time workers",
                    "Pro-rata for part-time workers"
                ],
                penalties=["Employment tribunal claims", "Compensation payments"],
                enforcement_authority="Employment Tribunals",
                last_updated=datetime(2024, 1, 1),
                effective_date=datetime(1998, 10, 1),
                source_url="https://www.gov.uk/holiday-entitlement-rights",
                severity=ViolationSeverity.HIGH,
                entity_types=["employment_contract"]
            ),
            ComplianceRule(
                rule_id="uk_gdpr",
                name="UK GDPR",
                jurisdiction=ComplianceJurisdiction.UK,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="Data protection requirements for personal data processing",
                requirements=[
                    "Lawful basis for processing",
                    "Explicit consent where required",
                    "Data subject rights",
                    "Privacy notices",
                    "Data protection impact assessments"
                ],
                penalties=["Up to £17.5 million or 4% of turnover"],
                enforcement_authority="Information Commissioner's Office (ICO)",
                last_updated=datetime(2021, 1, 1),
                effective_date=datetime(2021, 1, 1),
                source_url="https://ico.org.uk/for-organisations/guide-to-data-protection/",
                severity=ViolationSeverity.CRITICAL,
                entity_types=["candidate_data", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="uk_equality_act",
                name="Equality Act 2010",
                jurisdiction=ComplianceJurisdiction.UK,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Protection against discrimination in employment",
                requirements=[
                    "No discrimination based on protected characteristics",
                    "Reasonable adjustments for disabilities",
                    "Equal pay for equal work",
                    "Positive action where appropriate"
                ],
                penalties=["Unlimited compensation", "Injunctions"],
                enforcement_authority="Equality and Human Rights Commission",
                last_updated=datetime(2010, 10, 1),
                effective_date=datetime(2010, 10, 1),
                source_url="https://www.equalityhumanrights.com/en/equality-act-2010",
                severity=ViolationSeverity.HIGH,
                entity_types=["job_posting", "employment_contract", "candidate_data"]
            )
        ]
    
    def _get_eu_rules(self) -> List[ComplianceRule]:
        """EU compliance rules"""
        return [
            ComplianceRule(
                rule_id="eu_working_time",
                name="Working Time Directive",
                jurisdiction=ComplianceJurisdiction.EU,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="EU-wide limits on working time",
                requirements=[
                    "Maximum 48 hours per week average",
                    "Minimum 11 hours rest between working days",
                    "Minimum 24 hours rest per week",
                    "4 weeks paid annual leave"
                ],
                penalties=["Varies by member state"],
                enforcement_authority="National authorities",
                last_updated=datetime(2003, 11, 23),
                effective_date=datetime(2003, 11, 23),
                source_url="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32003L0088",
                severity=ViolationSeverity.MEDIUM,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="eu_gdpr",
                name="General Data Protection Regulation",
                jurisdiction=ComplianceJurisdiction.EU,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="Comprehensive data protection regulation",
                requirements=[
                    "Lawful basis for processing",
                    "Data subject consent",
                    "Right to be forgotten",
                    "Data portability",
                    "Privacy by design"
                ],
                penalties=["Up to €20 million or 4% of turnover"],
                enforcement_authority="Data Protection Authorities",
                last_updated=datetime(2018, 5, 25),
                effective_date=datetime(2018, 5, 25),
                source_url="https://gdpr-info.eu/",
                severity=ViolationSeverity.CRITICAL,
                entity_types=["candidate_data", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="eu_equal_treatment",
                name="Equal Treatment Directive",
                jurisdiction=ComplianceJurisdiction.EU,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Equal treatment in employment and occupation",
                requirements=[
                    "No discrimination based on protected grounds",
                    "Equal access to employment",
                    "Equal working conditions",
                    "Equal access to training"
                ],
                penalties=["Varies by member state"],
                enforcement_authority="National equality bodies",
                last_updated=datetime(2000, 11, 27),
                effective_date=datetime(2000, 11, 27),
                source_url="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=celex%3A32000L0078",
                severity=ViolationSeverity.HIGH,
                entity_types=["job_posting", "employment_contract"]
            )
        ]
    
    def _get_us_rules(self) -> List[ComplianceRule]:
        """US compliance rules"""
        return [
            ComplianceRule(
                rule_id="us_flsa",
                name="Fair Labor Standards Act",
                jurisdiction=ComplianceJurisdiction.US,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Federal minimum wage and overtime requirements",
                requirements=[
                    "Federal minimum wage $7.25/hour",
                    "Overtime pay at 1.5x rate for 40+ hours",
                    "Child labor protections",
                    "Recordkeeping requirements"
                ],
                penalties=["Back wages", "Liquidated damages", "Civil penalties up to $2,074 per violation"],
                enforcement_authority="Department of Labor",
                last_updated=datetime(2024, 1, 1),
                effective_date=datetime(1938, 6, 25),
                source_url="https://www.dol.gov/agencies/whd/flsa",
                severity=ViolationSeverity.HIGH,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="us_title_vii",
                name="Title VII Civil Rights Act",
                jurisdiction=ComplianceJurisdiction.US,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Prohibition of employment discrimination",
                requirements=[
                    "No discrimination based on race, color, religion, sex, national origin",
                    "Sexual harassment prevention",
                    "Reasonable accommodation for religious practices"
                ],
                penalties=["Compensatory damages", "Punitive damages", "Injunctive relief"],
                enforcement_authority="Equal Employment Opportunity Commission",
                last_updated=datetime(1964, 7, 2),
                effective_date=datetime(1964, 7, 2),
                source_url="https://www.eeoc.gov/statutes/title-vii-civil-rights-act-1964",
                severity=ViolationSeverity.HIGH,
                entity_types=["job_posting", "employment_contract", "candidate_data"]
            ),
            ComplianceRule(
                rule_id="us_ada",
                name="Americans with Disabilities Act",
                jurisdiction=ComplianceJurisdiction.US,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Disability discrimination protection",
                requirements=[
                    "No discrimination against qualified individuals with disabilities",
                    "Reasonable accommodations",
                    "Accessible workplace",
                    "Medical inquiry restrictions"
                ],
                penalties=["Compensatory damages", "Punitive damages", "Attorney fees"],
                enforcement_authority="Equal Employment Opportunity Commission",
                last_updated=datetime(1990, 7, 26),
                effective_date=datetime(1990, 7, 26),
                source_url="https://www.eeoc.gov/statutes/americans-disabilities-act-1990",
                severity=ViolationSeverity.HIGH,
                entity_types=["job_posting", "employment_contract", "candidate_data"]
            ),
            ComplianceRule(
                rule_id="us_ccpa",
                name="California Consumer Privacy Act",
                jurisdiction=ComplianceJurisdiction.US,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="California privacy rights for personal information",
                requirements=[
                    "Privacy notice disclosure",
                    "Right to know",
                    "Right to delete",
                    "Right to opt-out of sale"
                ],
                penalties=["Civil penalties up to $2,500 per violation", "Private right of action"],
                enforcement_authority="California Attorney General",
                last_updated=datetime(2020, 1, 1),
                effective_date=datetime(2020, 1, 1),
                source_url="https://oag.ca.gov/privacy/ccpa",
                severity=ViolationSeverity.HIGH,
                entity_types=["candidate_data"]
            )
        ]
    
    def _get_au_rules(self) -> List[ComplianceRule]:
        """Australia compliance rules"""
        return [
            ComplianceRule(
                rule_id="au_fair_work",
                name="Fair Work Act",
                jurisdiction=ComplianceJurisdiction.AU,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="National employment law framework",
                requirements=[
                    "National minimum wage $23.23/hour",
                    "4 weeks paid annual leave",
                    "10 days paid personal leave",
                    "National employment standards"
                ],
                penalties=["Civil penalties up to $66,600 for corporations"],
                enforcement_authority="Fair Work Ombudsman",
                last_updated=datetime(2024, 7, 1),
                effective_date=datetime(2009, 7, 1),
                source_url="https://www.fairwork.gov.au/",
                severity=ViolationSeverity.HIGH,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="au_privacy",
                name="Privacy Act",
                jurisdiction=ComplianceJurisdiction.AU,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="Privacy protection for personal information",
                requirements=[
                    "Privacy policy disclosure",
                    "Consent for collection",
                    "Data breach notification",
                    "Individual access rights"
                ],
                penalties=["Civil penalties up to $2.22 million"],
                enforcement_authority="Office of the Australian Information Commissioner",
                last_updated=datetime(2022, 2, 22),
                effective_date=datetime(1988, 12, 21),
                source_url="https://www.oaic.gov.au/privacy/the-privacy-act",
                severity=ViolationSeverity.HIGH,
                entity_types=["candidate_data"]
            )
        ]
    
    def _get_ca_rules(self) -> List[ComplianceRule]:
        """Canada compliance rules"""
        return [
            ComplianceRule(
                rule_id="ca_employment_standards",
                name="Employment Standards",
                jurisdiction=ComplianceJurisdiction.CA,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Provincial employment standards",
                requirements=[
                    "Minimum wage varies by province",
                    "Overtime pay requirements",
                    "Vacation entitlements",
                    "Termination notice"
                ],
                penalties=["Varies by province"],
                enforcement_authority="Provincial employment standards offices",
                last_updated=datetime(2024, 1, 1),
                effective_date=datetime(1996, 9, 4),
                source_url="https://www.canada.ca/en/employment-social-development/services/labour-standards.html",
                severity=ViolationSeverity.MEDIUM,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="ca_pipeda",
                name="Personal Information Protection and Electronic Documents Act",
                jurisdiction=ComplianceJurisdiction.CA,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="Federal privacy law for personal information",
                requirements=[
                    "Consent for collection, use, disclosure",
                    "Privacy policy",
                    "Data breach notification",
                    "Individual access rights"
                ],
                penalties=["Administrative monetary penalties up to $100,000"],
                enforcement_authority="Privacy Commissioner of Canada",
                last_updated=datetime(2019, 11, 1),
                effective_date=datetime(2001, 1, 1),
                source_url="https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/",
                severity=ViolationSeverity.HIGH,
                entity_types=["candidate_data"]
            )
        ]
    
    def _get_jp_rules(self) -> List[ComplianceRule]:
        """Japan compliance rules"""
        return [
            ComplianceRule(
                rule_id="jp_labor_standards",
                name="Labor Standards Act",
                jurisdiction=ComplianceJurisdiction.JP,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Japanese employment law standards",
                requirements=[
                    "8 hours per day, 40 hours per week maximum",
                    "Overtime compensation",
                    "Annual paid leave",
                    "Equal treatment principle"
                ],
                penalties=["Imprisonment or fines"],
                enforcement_authority="Ministry of Health, Labour and Welfare",
                last_updated=datetime(2024, 4, 1),
                effective_date=datetime(1947, 9, 7),
                source_url="https://www.mhlw.go.jp/english/",
                severity=ViolationSeverity.MEDIUM,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="jp_appi",
                name="Act on Protection of Personal Information",
                jurisdiction=ComplianceJurisdiction.JP,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="Personal information protection in Japan",
                requirements=[
                    "Consent for collection and use",
                    "Purpose limitation",
                    "Data subject rights",
                    "Security measures"
                ],
                penalties=["Administrative orders", "Criminal penalties"],
                enforcement_authority="Personal Information Protection Commission",
                last_updated=datetime(2022, 4, 1),
                effective_date=datetime(2005, 4, 1),
                source_url="https://www.ppc.go.jp/en/",
                severity=ViolationSeverity.HIGH,
                entity_types=["candidate_data"]
            )
        ]
    
    def _get_sg_rules(self) -> List[ComplianceRule]:
        """Singapore compliance rules"""
        return [
            ComplianceRule(
                rule_id="sg_employment_act",
                name="Employment Act",
                jurisdiction=ComplianceJurisdiction.SG,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Singapore employment regulations",
                requirements=[
                    "44 hours per week maximum",
                    "Overtime pay for excess hours",
                    "Annual leave entitlements",
                    "Rest day provisions"
                ],
                penalties=["Fines up to S$10,000", "Imprisonment"],
                enforcement_authority="Ministry of Manpower",
                last_updated=datetime(2024, 4, 1),
                effective_date=datetime(1968, 12, 27),
                source_url="https://www.mom.gov.sg/employment-practices/employment-act",
                severity=ViolationSeverity.MEDIUM,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="sg_pdpa",
                name="Personal Data Protection Act",
                jurisdiction=ComplianceJurisdiction.SG,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="Personal data protection in Singapore",
                requirements=[
                    "Consent for collection, use, disclosure",
                    "Purpose limitation",
                    "Data protection measures",
                    "Individual access rights"
                ],
                penalties=["Financial penalties up to S$1 million"],
                enforcement_authority="Personal Data Protection Commission",
                last_updated=datetime(2021, 2, 1),
                effective_date=datetime(2014, 7, 2),
                source_url="https://www.pdpc.gov.sg/",
                severity=ViolationSeverity.HIGH,
                entity_types=["candidate_data"]
            )
        ]
    
    def _get_kr_rules(self) -> List[ComplianceRule]:
        """South Korea compliance rules"""
        return [
            ComplianceRule(
                rule_id="kr_labor_standards",
                name="Labor Standards Act",
                jurisdiction=ComplianceJurisdiction.KR,
                compliance_type=ComplianceType.EMPLOYMENT,
                description="Korean employment law standards",
                requirements=[
                    "40 hours per week maximum",
                    "52 hours including overtime maximum",
                    "Annual paid leave",
                    "Severance pay requirements"
                ],
                penalties=["Imprisonment or fines"],
                enforcement_authority="Ministry of Employment and Labor",
                last_updated=datetime(2024, 1, 1),
                effective_date=datetime(1953, 5, 10),
                source_url="https://www.moel.go.kr/english/",
                severity=ViolationSeverity.MEDIUM,
                entity_types=["job_posting", "employment_contract"]
            ),
            ComplianceRule(
                rule_id="kr_pipa",
                name="Personal Information Protection Act",
                jurisdiction=ComplianceJurisdiction.KR,
                compliance_type=ComplianceType.DATA_PROTECTION,
                description="Personal information protection in Korea",
                requirements=[
                    "Consent for processing",
                    "Purpose limitation",
                    "Data subject rights",
                    "Security measures"
                ],
                penalties=["Administrative fines up to 3% of turnover"],
                enforcement_authority="Personal Information Protection Commission",
                last_updated=datetime(2020, 8, 5),
                effective_date=datetime(2011, 9, 30),
                source_url="https://www.privacy.go.kr/eng/",
                severity=ViolationSeverity.HIGH,
                entity_types=["candidate_data"]
            )
        ]