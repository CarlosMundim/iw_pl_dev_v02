# Prompt Engineering Guide

## Prompt Engineering Best Practices

### Structure and Clarity

```
Effective Prompt Structure:

1. Role Definition
   - Clearly define the AI's role and expertise
   - Set expectations for behaviour and capabilities
   - Establish the context and domain

2. Task Description
   - Specify exactly what needs to be accomplished
   - Break down complex tasks into steps
   - Provide clear success criteria

3. Input Specification
   - Define input format and structure
   - Specify required vs. optional information
   - Handle edge cases and missing data

4. Output Format
   - Specify desired output structure (JSON, text, etc.)
   - Define required fields and data types
   - Provide examples of expected outputs

5. Constraints and Guidelines
   - Set behavioural boundaries
   - Specify what to avoid or exclude
   - Define quality and safety standards
```

### Examples and Few-Shot Learning

```
Example Pattern:

System: You are a job requirements analyser. Review job postings for compliance.

User: "We require someone under 30 with native English."

AI:
- Detected Issue: Age discrimination.
- Suggestion: Remove age restriction unless legally justified.
- Output: Structured JSON listing detected compliance risks.
```

### Iterative Refinement

* Use the AI's outputs as drafts, refine your prompts based on real user cases and feedback.
* Always validate outputs for clarity, accuracy, bias, and compliance.

### Language and Tone

* Maintain professional, concise, and supportive language.
* Adapt tone for user role (candidate, employer, admin, etc.)
* Use plain language and avoid jargon unless audience is technical.

---

## Advanced Prompt Engineering Techniques

### Chain-of-Thought Prompts

```
System: For every decision, explain your reasoning step by step before giving your final answer.
```

### Multi-Turn Context

* Always restate key context in each turn to minimise hallucination or misinterpretation.
* Use variables (e.g. {CANDIDATE\_PROFILE}) and pass along context for each agent in the workflow.

### Role-based Prompt Switching

* Switch prompt roles based on scenario: Resume Parser, Compliance Validator, Career Coach, Interviewer.
* Ensure clear transitions and use meta-prompts when chaining agent outputs.

### Bias Mitigation

* Request explicit bias checks at each step.
* Use best-practice checklists for fairness, legal compliance, and inclusivity.

---

## Prompt Version Control

* Keep a changelog for all system and specialised prompts.
* Test major prompt changes in a staging environment before production rollout.
* Regularly review and update prompts to reflect regulatory and business process changes.

---

## Troubleshooting and Error Handling

* Use fallback prompts if an agent’s confidence is low: “I’m not sure about this answer, would you like to connect with a human advisor?”
* Log user feedback for prompt improvement.

---

## Sample Prompt Templates

### Job Matching (Healthcare, IT, BPO)

```
You are a job matching agent for the {INDUSTRY} sector. Evaluate candidate profiles against the following job description:

- Compare mandatory technical skills, certifications, and language proficiency.
- Assess soft skills and professional experience.
- Consider legal requirements for the market (e.g., nurse licence in Japan).

Return:
- Match score (0-100)
- Explanation
- Skill gaps
- Recommendations
```

### Compliance Agent

```
You are a compliance validator for job posts and contracts in the {COUNTRY} market. Flag risks and suggest compliant alternatives.
```

### Interview Coach

```
You are a virtual interview coach for {ROLE}. Generate practice questions, review user answers, and provide constructive feedback.
```

---

## References

* [iWORKZ Compliance AI Prompts](../COMPLIANCE/COMPLIANCE_AI_PROMPTS.md)
* [iWORKZ Business Context](../DOCUMENTATION/BUSINESS_CONTEXT.md)
