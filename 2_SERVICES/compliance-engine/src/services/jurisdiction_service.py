from typing import Dict, Any, Optional
from datetime import datetime
from ..models import ComplianceJurisdiction

class JurisdictionService:
    """Service for jurisdiction-specific compliance data"""
    
    def __init__(self):
        self.jurisdiction_data = self._load_jurisdiction_data()
    
    def _load_jurisdiction_data(self) -> Dict[str, Dict[str, Any]]:
        """Load jurisdiction-specific compliance data"""
        return {
            ComplianceJurisdiction.UK: {
                "minimum_wage": 10.42,  # £ per hour (23+ years)
                "currency": "GBP",
                "max_working_hours": 48,  # per week average
                "max_probation_period": 180,  # days
                "min_holiday_entitlement": 28,  # days
                "min_notice_period": 7,  # days
                "min_working_age": 16,
                "employment_standards": {
                    "overtime_threshold": 48,
                    "rest_between_shifts": 11,  # hours
                    "weekly_rest": 24,  # hours
                    "break_entitlement": {"6_hours": 20}  # minutes
                }
            },
            ComplianceJurisdiction.EU: {
                "minimum_wage": "varies",  # Varies by member state
                "currency": "EUR",
                "max_working_hours": 48,  # per week average
                "max_probation_period": 180,  # days (varies by country)
                "min_holiday_entitlement": 20,  # working days (4 weeks)
                "min_notice_period": 14,  # days
                "min_working_age": 16,
                "employment_standards": {
                    "overtime_threshold": 48,
                    "rest_between_shifts": 11,  # hours
                    "weekly_rest": 24,  # hours
                    "annual_leave": 20  # working days minimum
                }
            },
            ComplianceJurisdiction.US: {
                "minimum_wage": 7.25,  # $ per hour (federal)
                "currency": "USD",
                "max_working_hours": None,  # No federal limit
                "max_probation_period": None,  # No federal limit
                "min_holiday_entitlement": 0,  # No federal requirement
                "min_notice_period": 0,  # At-will employment
                "min_working_age": 14,  # With restrictions
                "employment_standards": {
                    "overtime_threshold": 40,  # hours per week
                    "overtime_rate": 1.5,  # time and a half
                    "child_labor_restrictions": True
                }
            },
            ComplianceJurisdiction.AU: {
                "minimum_wage": 23.23,  # AUD per hour
                "currency": "AUD",
                "max_working_hours": 38,  # ordinary hours per week
                "max_probation_period": 180,  # days
                "min_holiday_entitlement": 20,  # working days (4 weeks)
                "min_notice_period": 7,  # days minimum
                "min_working_age": 13,  # With restrictions
                "employment_standards": {
                    "overtime_threshold": 38,
                    "personal_leave": 10,  # days per year
                    "long_service_leave": True,
                    "superannuation": 11.0  # % of salary
                }
            },
            ComplianceJurisdiction.CA: {
                "minimum_wage": "varies",  # Varies by province
                "currency": "CAD",
                "max_working_hours": 48,  # per week (varies by province)
                "max_probation_period": 90,  # days (varies)
                "min_holiday_entitlement": 10,  # working days (2 weeks)
                "min_notice_period": 14,  # days
                "min_working_age": 14,  # Varies by province
                "employment_standards": {
                    "overtime_threshold": 40,  # hours per week (varies)
                    "stat_holidays": 9,  # minimum federal
                    "employment_insurance": True
                }
            },
            ComplianceJurisdiction.JP: {
                "minimum_wage": 961,  # JPY per hour (national average)
                "currency": "JPY",
                "max_working_hours": 40,  # per week
                "max_probation_period": 180,  # days
                "min_holiday_entitlement": 10,  # days minimum
                "min_notice_period": 30,  # days
                "min_working_age": 15,
                "employment_standards": {
                    "daily_working_hours": 8,
                    "overtime_threshold": 40,
                    "social_insurance": True,
                    "bonus_expectations": True
                }
            },
            ComplianceJurisdiction.SG: {
                "minimum_wage": None,  # No statutory minimum wage
                "currency": "SGD",
                "max_working_hours": 44,  # per week
                "max_probation_period": 180,  # days
                "min_holiday_entitlement": 7,  # days minimum
                "min_notice_period": 7,  # days
                "min_working_age": 13,  # With restrictions
                "employment_standards": {
                    "overtime_threshold": 44,
                    "rest_day": 1,  # per week
                    "cpf_contribution": True,  # Central Provident Fund
                    "work_permit_requirements": True
                }
            },
            ComplianceJurisdiction.KR: {
                "minimum_wage": 9860,  # KRW per hour
                "currency": "KRW",
                "max_working_hours": 52,  # including overtime
                "max_probation_period": 90,  # days
                "min_holiday_entitlement": 15,  # days
                "min_notice_period": 30,  # days
                "min_working_age": 15,
                "employment_standards": {
                    "regular_hours": 40,  # per week
                    "overtime_limit": 12,  # hours per week
                    "severance_pay": True,
                    "national_pension": True
                }
            }
        }
    
    async def get_minimum_wage(self, jurisdiction: ComplianceJurisdiction) -> float:
        """Get minimum wage for jurisdiction"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        min_wage = data.get("minimum_wage")
        
        if isinstance(min_wage, (int, float)):
            return float(min_wage)
        elif min_wage == "varies":
            # Return a reasonable default for varies cases
            return self._get_default_minimum_wage(jurisdiction)
        else:
            return 0.0
    
    async def get_max_working_hours(self, jurisdiction: ComplianceJurisdiction) -> int:
        """Get maximum working hours per week"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        max_hours = data.get("max_working_hours")
        return int(max_hours) if max_hours else 40  # Default to 40 hours
    
    async def get_max_probation_period(self, jurisdiction: ComplianceJurisdiction) -> int:
        """Get maximum probation period in days"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        max_probation = data.get("max_probation_period")
        return int(max_probation) if max_probation else 90  # Default to 90 days
    
    async def get_min_holiday_entitlement(self, jurisdiction: ComplianceJurisdiction) -> int:
        """Get minimum holiday entitlement in days"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        min_holidays = data.get("min_holiday_entitlement")
        return int(min_holidays) if min_holidays else 0
    
    async def get_min_notice_period(self, jurisdiction: ComplianceJurisdiction) -> int:
        """Get minimum notice period in days"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        min_notice = data.get("min_notice_period")
        return int(min_notice) if min_notice else 0
    
    async def get_min_working_age(self, jurisdiction: ComplianceJurisdiction) -> int:
        """Get minimum working age"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        min_age = data.get("min_working_age")
        return int(min_age) if min_age else 16
    
    async def get_employment_standards(self, jurisdiction: ComplianceJurisdiction) -> Dict[str, Any]:
        """Get employment standards for jurisdiction"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        return data.get("employment_standards", {})
    
    async def get_currency(self, jurisdiction: ComplianceJurisdiction) -> str:
        """Get currency for jurisdiction"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        return data.get("currency", "USD")
    
    def _get_default_minimum_wage(self, jurisdiction: ComplianceJurisdiction) -> float:
        """Get default minimum wage for jurisdictions where it varies"""
        defaults = {
            ComplianceJurisdiction.EU: 10.0,  # Average EU minimum wage
            ComplianceJurisdiction.CA: 15.0,  # Average Canadian provincial minimum wage
        }
        return defaults.get(jurisdiction, 10.0)
    
    async def validate_salary_compliance(
        self, 
        jurisdiction: ComplianceJurisdiction, 
        salary: float,
        currency: str,
        working_hours: Optional[float] = None
    ) -> Dict[str, Any]:
        """Validate salary compliance for jurisdiction"""
        min_wage = await self.get_minimum_wage(jurisdiction)
        jurisdiction_currency = await self.get_currency(jurisdiction)
        
        # Convert currency if needed (simplified - in production, use real exchange rates)
        if currency != jurisdiction_currency:
            salary = await self._convert_currency(salary, currency, jurisdiction_currency)
        
        # Calculate hourly rate if needed
        if working_hours:
            hourly_rate = salary / (working_hours * 52)  # Assuming annual salary
        else:
            hourly_rate = salary  # Assuming hourly salary
        
        is_compliant = hourly_rate >= min_wage
        
        return {
            "compliant": is_compliant,
            "minimum_wage": min_wage,
            "offered_rate": hourly_rate,
            "currency": jurisdiction_currency,
            "gap": max(0, min_wage - hourly_rate) if not is_compliant else 0
        }
    
    async def validate_working_hours_compliance(
        self, 
        jurisdiction: ComplianceJurisdiction, 
        weekly_hours: float
    ) -> Dict[str, Any]:
        """Validate working hours compliance"""
        max_hours = await self.get_max_working_hours(jurisdiction)
        is_compliant = weekly_hours <= max_hours if max_hours else True
        
        return {
            "compliant": is_compliant,
            "maximum_hours": max_hours,
            "proposed_hours": weekly_hours,
            "excess_hours": max(0, weekly_hours - max_hours) if max_hours and not is_compliant else 0
        }
    
    async def validate_probation_compliance(
        self, 
        jurisdiction: ComplianceJurisdiction, 
        probation_days: int
    ) -> Dict[str, Any]:
        """Validate probation period compliance"""
        max_probation = await self.get_max_probation_period(jurisdiction)
        is_compliant = probation_days <= max_probation if max_probation else True
        
        return {
            "compliant": is_compliant,
            "maximum_probation": max_probation,
            "proposed_probation": probation_days,
            "excess_days": max(0, probation_days - max_probation) if max_probation and not is_compliant else 0
        }
    
    async def get_jurisdiction_info(self, jurisdiction: ComplianceJurisdiction) -> Dict[str, Any]:
        """Get comprehensive jurisdiction information"""
        data = self.jurisdiction_data.get(jurisdiction, {})
        
        jurisdiction_names = {
            ComplianceJurisdiction.UK: "United Kingdom",
            ComplianceJurisdiction.EU: "European Union",
            ComplianceJurisdiction.US: "United States",
            ComplianceJurisdiction.AU: "Australia",
            ComplianceJurisdiction.CA: "Canada",
            ComplianceJurisdiction.JP: "Japan",
            ComplianceJurisdiction.SG: "Singapore",
            ComplianceJurisdiction.KR: "South Korea"
        }
        
        country_codes = {
            ComplianceJurisdiction.UK: "GB",
            ComplianceJurisdiction.EU: "EU",
            ComplianceJurisdiction.US: "US",
            ComplianceJurisdiction.AU: "AU",
            ComplianceJurisdiction.CA: "CA",
            ComplianceJurisdiction.JP: "JP",
            ComplianceJurisdiction.SG: "SG",
            ComplianceJurisdiction.KR: "KR"
        }
        
        return {
            "jurisdiction": jurisdiction,
            "name": jurisdiction_names.get(jurisdiction, str(jurisdiction)),
            "country_code": country_codes.get(jurisdiction, "XX"),
            "minimum_wage": data.get("minimum_wage"),
            "currency": data.get("currency"),
            "max_working_hours": data.get("max_working_hours"),
            "min_holiday_entitlement": data.get("min_holiday_entitlement"),
            "employment_standards": data.get("employment_standards", {}),
            "last_updated": datetime.now().isoformat()
        }
    
    async def _convert_currency(self, amount: float, from_currency: str, to_currency: str) -> float:
        """Convert currency (simplified - use real exchange rates in production)"""
        # Simplified conversion rates (in production, use real-time exchange rates)
        rates = {
            "USD": 1.0,
            "GBP": 0.79,
            "EUR": 0.85,
            "AUD": 1.35,
            "CAD": 1.25,
            "JPY": 110.0,
            "SGD": 1.35,
            "KRW": 1200.0
        }
        
        if from_currency == to_currency:
            return amount
        
        # Convert to USD first, then to target currency
        usd_amount = amount / rates.get(from_currency, 1.0)
        target_amount = usd_amount * rates.get(to_currency, 1.0)
        
        return target_amount