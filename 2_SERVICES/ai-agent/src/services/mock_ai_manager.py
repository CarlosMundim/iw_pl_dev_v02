"""
Mock AI Manager - Returns realistic responses without external API calls
Perfect for development and demo purposes with zero costs
"""

import asyncio
import time
import random
import json
from typing import Dict, List, Optional, Any, Union
import hashlib

from src.config.settings import get_settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)
settings = get_settings()


class MockAIManager:
    """Mock AI manager that simulates AI responses without external API calls"""
    
    def __init__(self):
        self.settings = settings
        
        # Mock performance metrics
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_tokens": 0,
            "avg_response_time": 45.2  # Simulated average
        }
        
        # Preloaded skill categories for realistic responses
        self.skill_categories = {
            "technical": [
                "Python", "JavaScript", "React", "Node.js", "PostgreSQL", "Docker", 
                "AWS", "Kubernetes", "TypeScript", "Java", "C++", "Go", "Rust",
                "Machine Learning", "Data Science", "AI/ML", "TensorFlow", "PyTorch",
                "DevOps", "CI/CD", "Jenkins", "GitLab", "Terraform", "Ansible"
            ],
            "soft": [
                "Leadership", "Communication", "Project Management", "Team Collaboration",
                "Problem Solving", "Critical Thinking", "Adaptability", "Time Management",
                "Strategic Planning", "Mentoring", "Public Speaking", "Negotiation"
            ],
            "certification": [
                "AWS Certified", "PMP", "Scrum Master", "Google Cloud Professional",
                "Azure Certified", "CPA", "Six Sigma", "CISSP", "CISA", "CompTIA"
            ],
            "language": [
                "English", "Spanish", "French", "German", "Mandarin", "Japanese",
                "Portuguese", "Italian", "Dutch", "Russian", "Arabic"
            ],
            "domain": [
                "E-commerce", "Fintech", "Healthcare", "EdTech", "SaaS", "Mobile Apps",
                "Web Development", "Data Analytics", "Cybersecurity", "IoT", "Blockchain"
            ]
        }
        
        # Mock job analysis templates
        self.job_analysis_templates = {
            "Software Engineer": {
                "department": "Engineering",
                "level": "mid",
                "employment_type": "full-time",
                "required_experience_years": 3,
                "education_requirements": ["Bachelor's in Computer Science or related field"],
                "location_requirements": "remote",
                "industry": "Technology",
                "company_size": "medium"
            },
            "Data Scientist": {
                "department": "Data Science",
                "level": "senior",
                "employment_type": "full-time",
                "required_experience_years": 5,
                "education_requirements": ["Master's in Data Science, Statistics, or related field"],
                "location_requirements": "hybrid",
                "industry": "Technology",
                "company_size": "large"
            },
            "Product Manager": {
                "department": "Product",
                "level": "mid",
                "employment_type": "full-time",
                "required_experience_years": 4,
                "education_requirements": ["Bachelor's in Business, Engineering, or related field"],
                "location_requirements": "onsite",
                "industry": "Technology",
                "company_size": "medium"
            }
        }
        
        # Mock compliance rules by jurisdiction
        self.compliance_rules = {
            "UK": {
                "working_hours": {"max_weekly": 48, "overtime_rules": "EU Working Time Directive"},
                "minimum_wage": {"amount": 10.42, "currency": "GBP", "effective_date": "2023-04-01"},
                "visa_requirements": ["Right to Work check required", "Tier 2 visa supported"],
                "data_protection": "GDPR compliant",
                "employment_law": "UK Employment Rights Act 1996"
            },
            "DE": {
                "working_hours": {"max_weekly": 48, "max_daily": 8},
                "minimum_wage": {"amount": 12.00, "currency": "EUR", "effective_date": "2023-01-01"},
                "visa_requirements": ["EU Blue Card eligible", "Work permit required for non-EU"],
                "data_protection": "GDPR compliant",
                "employment_law": "German Employment Protection Act"
            },
            "AU": {
                "working_hours": {"max_weekly": 38, "overtime_threshold": 38},
                "minimum_wage": {"amount": 21.38, "currency": "AUD", "effective_date": "2023-07-01"},
                "visa_requirements": ["Work visa required", "Temporary Skill Shortage visa supported"],
                "data_protection": "Privacy Act 1988",
                "employment_law": "Fair Work Act 2009"
            }
        }
    
    async def initialize(self):
        """Initialize mock AI manager"""
        logger.info("Initializing Mock AI Manager (Demo Mode - Zero API Costs)")
        await asyncio.sleep(0.1)  # Simulate initialization time
        logger.info("✅ Mock AI Manager ready - All responses are simulated")
    
    async def cleanup(self):
        """Cleanup mock AI manager"""
        logger.info("Mock AI Manager cleanup completed")
    
    async def health_check(self) -> Dict[str, Any]:
        """Mock health check - always healthy"""
        return {
            "status": "healthy",
            "mode": "mock",
            "models": {
                "mock_chat": "healthy",
                "mock_embedding": "healthy",
                "mock_skills": "healthy"
            },
            "metrics": self.metrics,
            "cost": "Zero - All responses are mocked"
        }
    
    async def warm_up_models(self):
        """Mock model warm-up"""
        logger.info("Mock models are always ready - no warm-up needed")
    
    async def chat_completion(self, prompt: str, model: str = None, 
                            max_tokens: int = None, temperature: float = None,
                            system_prompt: str = None, user_id: str = None) -> Dict[str, Any]:
        """Generate mock chat completion"""
        start_time = time.time()
        
        # Simulate processing time
        await asyncio.sleep(random.uniform(0.5, 1.5))
        
        # Generate realistic mock response based on system prompt
        if system_prompt and "skills extraction" in system_prompt.lower():
            content = self._generate_mock_skills_response(prompt)
        elif system_prompt and "job description" in system_prompt.lower():
            content = self._generate_mock_job_analysis(prompt)
        elif system_prompt and "match explanation" in system_prompt.lower():
            content = self._generate_mock_match_explanation(prompt)
        else:
            content = self._generate_mock_chat_response(prompt)
        
        # Mock token usage
        prompt_tokens = len(prompt.split()) * 1.3  # Rough estimation
        completion_tokens = len(content.split()) * 1.3
        total_tokens = int(prompt_tokens + completion_tokens)
        
        # Update metrics
        duration = (time.time() - start_time) * 1000
        self._update_metrics(True, total_tokens, duration)
        
        return {
            "content": content,
            "model": f"mock-{model or 'gpt-3.5-turbo'}",
            "usage": {
                "prompt_tokens": int(prompt_tokens),
                "completion_tokens": int(completion_tokens),
                "total_tokens": total_tokens
            },
            "finish_reason": "stop"
        }
    
    async def generate_embedding(self, text: str, model: str = None, 
                               use_local: bool = False, user_id: str = None) -> List[float]:
        """Generate mock embedding vector"""
        await asyncio.sleep(random.uniform(0.1, 0.3))  # Simulate processing
        
        # Create deterministic but realistic embedding based on text hash
        text_hash = hashlib.md5(text.encode()).hexdigest()
        random.seed(int(text_hash[:8], 16))
        
        # Generate 384-dimensional embedding (typical for sentence transformers)
        embedding = [random.uniform(-1, 1) for _ in range(384)]
        
        # Normalize to unit vector
        magnitude = sum(x**2 for x in embedding) ** 0.5
        embedding = [x / magnitude for x in embedding]
        
        self._update_metrics(True, len(text.split()), 200)
        return embedding
    
    async def calculate_similarity(self, text1: str, text2: str, 
                                 use_local: bool = False) -> float:
        """Calculate mock similarity score"""
        # Simple mock similarity based on common words
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 or not words2:
            return 0.0
        
        common = len(words1.intersection(words2))
        total = len(words1.union(words2))
        
        # Add some randomness and normalization
        similarity = (common / total) * random.uniform(0.8, 1.2)
        return min(max(similarity, 0.0), 1.0)
    
    async def extract_skills_from_text(self, text: str, 
                                     user_id: str = None) -> List[Dict[str, Any]]:
        """Extract mock skills from text"""
        # Look for mentions of known skills
        text_lower = text.lower()
        found_skills = []
        
        for category, skills in self.skill_categories.items():
            for skill in skills:
                if skill.lower() in text_lower:
                    found_skills.append({
                        "skill": skill,
                        "category": category,
                        "confidence": random.uniform(0.7, 0.95),
                        "context": f"Mentioned in {category} context"
                    })
        
        # Add some random skills if none found
        if not found_skills:
            categories = list(self.skill_categories.keys())
            for _ in range(random.randint(2, 5)):
                category = random.choice(categories)
                skill = random.choice(self.skill_categories[category])
                found_skills.append({
                    "skill": skill,
                    "category": category,
                    "confidence": random.uniform(0.6, 0.85),
                    "context": "Inferred from experience description"
                })
        
        return found_skills[:10]  # Limit to 10 skills
    
    async def analyze_job_description(self, job_description: str, 
                                    user_id: str = None) -> Dict[str, Any]:
        """Mock job description analysis"""
        await asyncio.sleep(random.uniform(0.5, 1.0))
        
        # Try to detect job type from description
        desc_lower = job_description.lower()
        job_type = "Software Engineer"  # Default
        
        if any(word in desc_lower for word in ["data", "analyst", "scientist", "ml", "ai"]):
            job_type = "Data Scientist"
        elif any(word in desc_lower for word in ["product", "manager", "pm"]):
            job_type = "Product Manager"
        elif any(word in desc_lower for word in ["designer", "ui", "ux"]):
            job_type = "UX Designer"
        
        # Get base template
        template = self.job_analysis_templates.get(job_type, self.job_analysis_templates["Software Engineer"])
        
        # Extract skills from description
        skills = await self.extract_skills_from_text(job_description, user_id)
        required_skills = [s["skill"] for s in skills[:5]]
        preferred_skills = [s["skill"] for s in skills[5:8]]
        
        # Generate mock salary range
        base_salary = random.randint(60000, 150000)
        
        return {
            "title": job_type,
            "department": template["department"],
            "level": template["level"],
            "employment_type": template["employment_type"],
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "required_experience_years": template["required_experience_years"],
            "education_requirements": template["education_requirements"],
            "key_responsibilities": [
                "Collaborate with cross-functional teams",
                "Develop and maintain software solutions",
                "Participate in code reviews and technical discussions",
                "Contribute to system architecture decisions"
            ],
            "salary_range": {
                "min": base_salary,
                "max": base_salary + random.randint(20000, 40000),
                "currency": "USD"
            },
            "location_requirements": template["location_requirements"],
            "industry": template["industry"],
            "company_size": template["company_size"]
        }
    
    async def generate_match_explanation(self, job_data: Dict, talent_data: Dict, 
                                       match_scores: Dict, user_id: str = None) -> str:
        """Generate mock match explanation"""
        await asyncio.sleep(random.uniform(0.3, 0.8))
        
        overall_score = match_scores.get('overall_score', 0.75)
        
        if overall_score >= 0.8:
            tone = "excellent"
            opening = "This candidate is an excellent match for this position."
        elif overall_score >= 0.6:
            tone = "good"
            opening = "This candidate shows strong potential for this role."
        else:
            tone = "moderate"
            opening = "This candidate has some relevant qualifications but may need development."
        
        explanations = [
            opening,
            f"Their skill set aligns well with {random.randint(70, 90)}% of the job requirements.",
            f"Experience level matches {random.randint(60, 85)}% of expectations.",
            "Strong background in relevant technologies and methodologies."
        ]
        
        if overall_score < 0.7:
            explanations.append("Some skill gaps may require additional training or mentoring.")
        
        return " ".join(explanations)
    
    async def check_compliance(self, job_data: Dict, jurisdiction: str = "UK") -> Dict[str, Any]:
        """Mock compliance checking"""
        await asyncio.sleep(random.uniform(0.2, 0.6))
        
        rules = self.compliance_rules.get(jurisdiction, self.compliance_rules["UK"])
        
        # Generate mock compliance results
        issues = []
        recommendations = []
        
        # Random chance of finding issues
        if random.random() < 0.3:  # 30% chance of issues
            issues.append({
                "type": "salary_compliance",
                "severity": "medium",
                "description": f"Salary may be below minimum wage requirements for {jurisdiction}",
                "regulation": rules.get("employment_law", "Local employment law")
            })
            recommendations.append("Review salary against local minimum wage requirements")
        
        if random.random() < 0.2:  # 20% chance of visa issues
            issues.append({
                "type": "visa_requirements",
                "severity": "high",
                "description": "Job posting should specify visa sponsorship availability",
                "regulation": "Immigration law requirements"
            })
            recommendations.append("Add visa sponsorship information to job posting")
        
        return {
            "jurisdiction": jurisdiction,
            "status": "compliant" if not issues else "issues_found",
            "confidence_score": random.uniform(0.85, 0.98),
            "issues_found": issues,
            "recommendations": recommendations,
            "regulations_checked": [
                rules.get("employment_law", "Employment law"),
                rules.get("data_protection", "Data protection law"),
                "Immigration requirements"
            ],
            "last_updated": "2024-01-15T10:30:00Z"
        }
    
    def _generate_mock_skills_response(self, text: str) -> str:
        """Generate mock JSON skills response"""
        skills = []
        categories = list(self.skill_categories.keys())
        
        for _ in range(random.randint(3, 8)):
            category = random.choice(categories)
            skill = random.choice(self.skill_categories[category])
            skills.append({
                "skill": skill,
                "category": category,
                "confidence": round(random.uniform(0.7, 0.95), 2),
                "context": "mentioned in experience section"
            })
        
        return json.dumps(skills, indent=2)
    
    def _generate_mock_job_analysis(self, text: str) -> str:
        """Generate mock job analysis JSON"""
        analysis = {
            "title": "Software Engineer",
            "department": "Engineering",
            "level": "mid",
            "employment_type": "full-time",
            "required_skills": ["Python", "React", "PostgreSQL"],
            "preferred_skills": ["AWS", "Docker", "Kubernetes"],
            "required_experience_years": 3,
            "education_requirements": ["Bachelor's degree in Computer Science"],
            "key_responsibilities": [
                "Develop web applications",
                "Collaborate with team members",
                "Write clean, maintainable code"
            ],
            "salary_range": {"min": 80000, "max": 120000, "currency": "USD"},
            "location_requirements": "remote",
            "industry": "Technology",
            "company_size": "medium"
        }
        return json.dumps(analysis, indent=2)
    
    def _generate_mock_chat_response(self, prompt: str) -> str:
        """Generate mock general chat response"""
        responses = [
            "Thank you for your question. Based on the information provided, I can help you with that.",
            "I understand what you're looking for. Let me provide you with a comprehensive response.",
            "That's an interesting point. Here's my analysis of the situation.",
            "Based on current market trends and best practices, I recommend the following approach."
        ]
        return random.choice(responses)
    
    def _generate_mock_match_explanation(self, context: str) -> str:
        """Generate mock match explanation"""
        return self._generate_mock_chat_response(context)
    
    def _update_metrics(self, success: bool, tokens: int, duration: float):
        """Update mock metrics"""
        self.metrics["total_requests"] += 1
        
        if success:
            self.metrics["successful_requests"] += 1
            self.metrics["total_tokens"] += tokens
        else:
            self.metrics["failed_requests"] += 1
        
        # Update average response time
        total_requests = self.metrics["total_requests"]
        current_avg = self.metrics["avg_response_time"]
        self.metrics["avg_response_time"] = (
            (current_avg * (total_requests - 1) + duration) / total_requests
        )
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get mock AI service metrics"""
        return {
            **self.metrics,
            "mode": "mock",
            "cost": "$0.00",
            "models_loaded": {
                "mock_chat": True,
                "mock_embedding": True,
                "mock_skills": True,
                "mock_compliance": True
            },
            "api_calls_saved": self.metrics["total_requests"],
            "estimated_cost_saved": f"${self.metrics['total_requests'] * 0.002:.2f}"
        }