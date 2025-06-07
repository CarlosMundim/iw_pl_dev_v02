# Compliance AI Prompts

## Purpose
AI prompt templates and guidelines used to power automated compliance validation agents.

## Core Compliance Prompt Template

### Job Posting Compliance Review
```
Given the following job posting intended for {COUNTRIES}, review and flag any statements or requirements that may be non-compliant with local employment laws and regulations. For each flagged item, explain why and suggest compliant alternatives.

**Job Posting:**
{JOB_POSTING_CONTENT}

**Countries/Regions:** {TARGET_COUNTRIES}

**Review Areas:**
1. Discriminatory language or requirements
2. Working hours and overtime compliance
3. Minimum wage and compensation requirements
4. Benefits and leave entitlements
5. Visa and work authorization requirements
6. Industry-specific regulations
7. Data protection and privacy compliance

**Output Format:**
- Compliance Status: [COMPLIANT/NON_COMPLIANT/REQUIRES_REVIEW]
- Flagged Issues: [List with explanations]
- Suggested Corrections: [Specific recommendations]
- Risk Level: [LOW/MEDIUM/HIGH]
- Additional Notes: [Context-specific guidance]
```

### Contract Review Prompt
```
Review the following employment contract for compliance with {JURISDICTION} employment laws. Focus on:

**Contract Content:**
{CONTRACT_TEXT}

**Compliance Check Areas:**
1. Notice periods and termination clauses
2. Working time regulations
3. Holiday and sick leave provisions
4. Compensation and benefits structure
5. Data protection clauses
6. Non-compete and confidentiality terms
7. Dispute resolution mechanisms

**Output Requirements:**
- Legal compliance assessment
- Risk areas identification
- Mandatory clause recommendations
- Jurisdiction-specific requirements
```

### Candidate Eligibility Verification
```
Assess the work eligibility of the following candidate for position in {TARGET_COUNTRY}:

**Candidate Profile:**
{CANDIDATE_DATA}

**Position Requirements:**
{JOB_REQUIREMENTS}

**Verification Areas:**
1. Visa and work permit status
2. Professional qualifications recognition
3. Right to work documentation
4. Background check requirements
5. Industry-specific certifications
6. Language proficiency requirements

**Assessment Output:**
- Eligibility Status: [ELIGIBLE/INELIGIBLE/CONDITIONAL]
- Required Documentation: [List]
- Additional Steps: [Verification process]
- Timeline Estimate: [Processing duration]
```

## Advanced Prompt Patterns

### Multi-Jurisdiction Analysis
```
System: You are a compliance expert specializing in international employment law. Analyze the following scenario across multiple jurisdictions simultaneously.

User: Compare employment law requirements for {POSITION_TYPE} across {COUNTRY_LIST}. Highlight key differences in:
- Mandatory benefits
- Working hour limits
- Termination procedures
- Tax implications
- Visa requirements

Provide a comparative matrix and recommendations for standardization where possible.
```

### Regulatory Update Integration
```
System: You have access to the latest regulatory updates. When reviewing compliance, reference current legislation and recent changes.

User: Given these recent regulatory changes: {REGULATORY_UPDATES}
How do they affect our current compliance approach for {SPECIFIC_SCENARIO}?

Provide:
- Impact assessment
- Required policy updates
- Implementation timeline
- Risk mitigation strategies
```

## Prompt Engineering Guidelines

### Best Practices
1. **Specificity**: Always include specific jurisdictions and regulatory frameworks
2. **Context**: Provide relevant business context and risk tolerance
3. **Structured Output**: Request standardized response formats for consistency
4. **Validation**: Include confidence scores and uncertainty indicators
5. **References**: Ask for specific regulation citations where applicable

### Error Handling
- Include fallback responses for unknown jurisdictions
- Request human review for high-risk or ambiguous cases
- Provide confidence levels for all assessments
- Flag when information may be outdated

### Integration Points
- Connect with live regulatory databases
- Interface with document parsing systems
- Link to human expert escalation workflows
- Integrate with audit logging systems

## Expansion Areas

### Planned Prompt Categories
- **KYC Verification**: Identity document validation prompts
- **Contract Generation**: Template creation with compliance safeguards
- **Policy Updates**: Automated policy revision recommendations
- **Training Content**: Compliance education material generation
- **Incident Response**: Breach notification and remediation guidance

### Industry-Specific Prompts
- **Healthcare**: Medical licensing and certification validation
- **Financial Services**: Regulatory compliance for fintech roles
- **Construction**: Safety regulations and certification requirements
- **Technology**: Data protection and intellectual property compliance

## Usage Analytics

Track prompt effectiveness through:
- Accuracy metrics vs. human expert review
- False positive/negative rates
- Processing time and efficiency gains
- User satisfaction and adoption rates
- Regulatory audit success rates

---

## Further Reading

- [Business Context](../1_DOCUMENTATION/BUSINESS_CONTEXT.md)
- [Compliance Engine Service](../2_SERVICES/compliance-engine/README.md)
- [Security Protocols](../5_SECURITY/SECURITY_PROTOCOLS.md)
