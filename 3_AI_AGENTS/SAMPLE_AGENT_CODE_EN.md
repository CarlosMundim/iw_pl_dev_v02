# Sample Agent Code

## Job Matching AI Agent

### Core Matching Algorithm

```python
# job_matcher.py
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple
import pandas as pd

class JobMatcher:
    def __init__(self):
        self.skill_vectorizer = TfidfVectorizer(stop_words='english')
        self.text_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.skill_weights = {
            'required': 1.0,
            'preferred': 0.7,
            'nice_to_have': 0.3
        }
    
    def calculate_match_score(
        self,
        candidate: Dict,
        job: Dict
    ) -> Dict[str, float]:
        """Calculate comprehensive match score between candidate and job."""
        
        # Skill matching (40% weight)
        skill_score = self._calculate_skill_match(
            candidate['skills'],
            job['requirements']['skills']
        )
        
        # Experience matching (30% weight)
        experience_score = self._calculate_experience_match(
            candidate['experience'],
            job['requirements']['experience']
        )
        
        # Education matching (15% weight)
        education_score = self._calculate_education_match(
            candidate['education'],
            job['requirements']['education']
        )
        
        # Location matching (10% weight)
        location_score = self._calculate_location_match(
            candidate['location'],
            job['location']
        )
        
        # Text similarity (5% weight)
        text_score = self._calculate_text_similarity(
            candidate['summary'],
            job['description']
        )
        
        # Calculate weighted overall score
        overall_score = (
            skill_score * 0.40 +
            experience_score * 0.30 +
            education_score * 0.15 +
            location_score * 0.10 +
            text_score * 0.05
        )
        
        return {
            'overall_score': min(overall_score, 100),
            'skill_score': skill_score,
            'experience_score': experience_score,
            'education_score': education_score,
            'location_score': location_score,
            'text_score': text_score,
            'recommendation': self._get_recommendation(overall_score)
        }
    
    def _calculate_skill_match(
        self,
        candidate_skills: List[Dict],
        job_skills: List[Dict]
    ) -> float:
        """Calculate skill matching score."""
        if not job_skills:
            return 80.0  # Default score if no specific skills required
        
        total_weight = 0
        matched_weight = 0
        
        for job_skill in job_skills:
            skill_name = job_skill['name'].lower()
            requirement_level = job_skill.get('level', 'intermediate')
            importance = job_skill.get('importance', 'required')
            
            weight = self.skill_weights.get(importance, 0.5)
            total_weight += weight
            
            # Find matching candidate skill
            candidate_skill = next(
                (cs for cs in candidate_skills
                 if cs['name'].lower() == skill_name),
                None
            )
            
            if candidate_skill:
                # Calculate level match
                level_match = self._calculate_skill_level_match(
                    candidate_skill.get('level', 'beginner'),
                    requirement_level
                )
                matched_weight += weight * level_match
        
        return (matched_weight / total_weight * 100) if total_weight > 0 else 0
    
    def _calculate_skill_level_match(
        self,
        candidate_level: str,
        required_level: str
    ) -> float:
        """Calculate how well candidate skill level matches requirement."""
        level_hierarchy = {
            'beginner': 1,
            'intermediate': 2,
            'advanced': 3,
            'expert': 4
        }
        
        candidate_value = level_hierarchy.get(candidate_level.lower(), 1)
        required_value = level_hierarchy.get(required_level.lower(), 2)
        
        if candidate_value >= required_value:
            return 1.0
        elif candidate_value == required_value - 1:
            return 0.7
        else:
            return 0.3
    
    def _calculate_experience_match(
        self,
        candidate_exp: List[Dict],
        job_requirements: Dict
    ) -> float:
        """Calculate experience matching score."""
        required_years = job_requirements.get('min_years', 0)
        required_roles = job_requirements.get('roles', [])
        
        # Calculate total years of experience
        total_years = sum(exp.get('duration_years', 0) for exp in candidate_exp)
        
        # Years score (0-100)
        years_score = min(total_years / max(required_years, 1) * 100, 100)
        
        # Role relevance score
        role_score = 0
        if required_roles:
            relevant_years = 0
            for exp in candidate_exp:
                exp_title = exp.get('title', '').lower()
                if any(role.lower() in exp_title for role in required_roles):
                    relevant_years += exp.get('duration_years', 0)
            
            role_score = min(relevant_years / max(required_years, 1) * 100, 100)
        else:
            role_score = years_score
        
        return (years_score * 0.4 + role_score * 0.6)
    
    def _calculate_location_match(
        self,
        candidate_location: Dict,
        job_location: Dict
    ) -> float:
        """Calculate location compatibility score."""
        # Remote work handling
        if job_location.get('remote', False):
            return 100.0
        
        if candidate_location.get('willing_to_relocate', False):
            return 90.0
        
        # Same city
        if (candidate_location.get('city', '').lower() ==
            job_location.get('city', '').lower()):
            return 100.0
        
        # Same state/region
        if (candidate_location.get('state', '').lower() ==
            job_location.get('state', '').lower()):
            return 75.0
        
        # Same country
        if (candidate_location.get('country', '').lower() ==
            job_location.get('country', '').lower()):
            return 50.0
        
        return 20.0
    
    def _get_recommendation(self, score: float) -> str:
        """Get hiring recommendation based on overall score."""
        if score >= 85:
            return "Strong Match - Recommend Interview"
        elif score >= 70:
            return "Good Match - Consider for Interview"
        elif score >= 55:
            return "Potential Match - Review Carefully"
        else:
            return "Poor Match - Consider Other Candidates"

# Usage Example
def main():
    matcher = JobMatcher()
    
    # Sample candidate
    candidate = {
        'id': 'candidate_123',
        'name': 'John Doe',
        'skills': [
            {'name': 'Python', 'level': 'advanced', 'years': 5},
            {'name': 'JavaScript', 'level': 'intermediate', 'years': 3},
            {'name': 'React', 'level': 'advanced', 'years': 4},
            {'name': 'SQL', 'level': 'intermediate', 'years': 3}
        ],
        'experience': [
            {
                'title': 'Senior Software Engineer',
                'company': 'Tech Corp',
                'duration_years': 3,
                'description': 'Developed web applications using React and Python'
            },
            {
                'title': 'Software Engineer',
                'company': 'StartupXYZ',
                'duration_years': 2,
                'description': 'Full-stack development with modern technologies'
            }
        ],
        'education': [
            {
                'degree': 'Bachelor',
                'field': 'Computer Science',
                'institution': 'State University'
            }
        ],
        'location': {
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'USA',
            'willing_to_relocate': False
        },
        'summary': 'Experienced software engineer with expertise in web development'
    }
    
    # Sample job
    job = {
        'id': 'job_456',
        'title': 'Senior Full Stack Developer',
        'company': 'Innovation Labs',
        'description': 'Looking for experienced developer to build scalable web applications',
        'requirements': {
            'skills': [
                {'name': 'Python', 'level': 'advanced', 'importance': 'required'},
                {'name': 'React', 'level': 'intermediate', 'importance': 'required'},
                {'name': 'JavaScript', 'level': 'intermediate', 'importance': 'required'},
                {'name': 'Docker', 'level': 'intermediate', 'importance': 'preferred'}
            ],
            'experience': {
                'min_years': 4,
                'roles': ['Software Engineer', 'Full Stack Developer']
            },
            'education': {
                'min_level': 'Bachelor',
                'fields': ['Computer Science', 'Engineering']
            }
        },
        'location': {
            'city': 'San Francisco',
            'state': 'CA',
            'country': 'USA',
            'remote': False
        }
    }
    
    # Calculate match
    match_result = matcher.calculate_match_score(candidate, job)
    
    print(f"Match Results:")
    print(f"Overall Score: {match_result['overall_score']:.1f}%")
    print(f"Skill Match: {match_result['skill_score']:.1f}%")
    print(f"Experience Match: {match_result['experience_score']:.1f}%")
    print(f"Education Match: {match_result['education_score']:.1f}%")
    print(f"Location Match: {match_result['location_score']:.1f}%")
    print(f"Recommendation: {match_result['recommendation']}")

if __name__ == "__main__":
    main()
```

# \[The file continues with Resume Analysis Agent, Voice Assistant Integration, and Multi-Language Support Agent as above.]
