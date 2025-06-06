"""
Mock Job-Candidate Matching Router
Provides realistic matching results without external API costs - perfect for demos
"""

import random
import asyncio
import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from src.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()


# Request/Response Models
class MatchRequest(BaseModel):
    job_id: str = Field(..., description="Job ID to match candidates against")
    talent_ids: Optional[List[str]] = Field(None, description="Specific talent IDs to match")
    max_results: int = Field(default=50, le=100, description="Maximum number of results")
    min_score: float = Field(default=0.3, ge=0.0, le=1.0, description="Minimum match score")
    include_explanation: bool = Field(default=True, description="Include AI explanation")


class SkillMatch(BaseModel):
    skill: str
    required: bool
    match_score: float
    confidence: float


class MatchResult(BaseModel):
    talent_id: str
    talent_name: str
    overall_score: float
    skills_score: float
    experience_score: float
    location_score: float
    availability_score: float
    salary_score: float
    confidence_level: float
    skill_matches: List[SkillMatch]
    explanation: Optional[str] = None


class MatchResponse(BaseModel):
    job_id: str
    job_title: str
    total_candidates: int
    matched_candidates: int
    processing_time_ms: float
    matches: List[MatchResult]
    algorithm_version: str = "mock_v2.1.0"


class BulkMatchRequest(BaseModel):
    job_ids: List[str] = Field(..., max_items=10, description="Job IDs to process")
    talent_id: str = Field(..., description="Talent ID to match against jobs")
    min_score: float = Field(default=0.3, ge=0.0, le=1.0, description="Minimum match score")


# Mock data generators
def generate_mock_talent_name() -> str:
    """Generate realistic talent names"""
    first_names = ["Alex", "Sarah", "Michael", "Emma", "David", "Jessica", "Ryan", "Amanda", "Kevin", "Lisa"]
    last_names = ["Johnson", "Smith", "Brown", "Davis", "Wilson", "Garcia", "Miller", "Jones", "Taylor", "Anderson"]
    return f"{random.choice(first_names)} {random.choice(last_names)}"


def generate_mock_skills() -> List[SkillMatch]:
    """Generate realistic skill matches"""
    all_skills = [
        ("Python", True, 0.95, 0.92),
        ("JavaScript", True, 0.88, 0.85),
        ("React", True, 0.92, 0.89),
        ("Node.js", False, 0.85, 0.82),
        ("AWS", False, 0.78, 0.75),
        ("Docker", False, 0.82, 0.79),
        ("PostgreSQL", True, 0.90, 0.87),
        ("Git", False, 0.95, 0.93),
        ("Agile", False, 0.75, 0.72),
        ("Leadership", False, 0.70, 0.68)
    ]
    
    # Select 4-8 random skills
    selected = random.sample(all_skills, random.randint(4, 8))
    
    return [
        SkillMatch(
            skill=skill,
            required=required,
            match_score=score + random.uniform(-0.1, 0.1),  # Add variance
            confidence=confidence + random.uniform(-0.05, 0.05)
        )
        for skill, required, score, confidence in selected
    ]


def calculate_realistic_scores() -> Dict[str, float]:
    """Generate realistic but varied scoring"""
    # Generate base score with realistic distribution
    base_score = random.betavariate(2, 3)  # Slightly skewed toward lower scores
    
    # Add variance to individual components
    variance = 0.15
    
    skills_score = max(0.0, min(1.0, base_score + random.uniform(-variance, variance)))
    experience_score = max(0.0, min(1.0, base_score + random.uniform(-variance, variance)))
    location_score = max(0.0, min(1.0, base_score + random.uniform(-variance, variance)))
    salary_score = max(0.0, min(1.0, base_score + random.uniform(-variance, variance)))
    availability_score = random.choice([1.0, 0.9, 0.8])  # Most people are available
    
    # Calculate weighted overall score
    weights = {
        "skills": 0.35,
        "experience": 0.25,
        "location": 0.15,
        "salary": 0.15,
        "availability": 0.10
    }
    
    overall_score = (
        skills_score * weights["skills"] +
        experience_score * weights["experience"] +
        location_score * weights["location"] +
        salary_score * weights["salary"] +
        availability_score * weights["availability"]
    )
    
    return {
        "overall_score": round(overall_score, 3),
        "skills_score": round(skills_score, 3),
        "experience_score": round(experience_score, 3),
        "location_score": round(location_score, 3),
        "salary_score": round(salary_score, 3),
        "availability_score": round(availability_score, 3),
        "confidence_level": random.uniform(0.75, 0.95)
    }


def generate_match_explanation(scores: Dict[str, float]) -> str:
    """Generate realistic match explanations"""
    overall = scores["overall_score"]
    skills = scores["skills_score"]
    experience = scores["experience_score"]
    
    if overall >= 0.85:
        explanations = [
            f"Excellent match with outstanding skills alignment ({skills:.2f}) and perfect experience fit ({experience:.2f}). This candidate demonstrates strong competency across all required areas.",
            f"Outstanding candidate with {skills:.2f} skills match and {experience:.2f} experience compatibility. Highly recommended for interview process.",
            f"Exceptional fit showing {skills:.2f} technical alignment and {experience:.2f} experience match. Strong potential for success in this role."
        ]
    elif overall >= 0.7:
        explanations = [
            f"Strong match with good skills alignment ({skills:.2f}) and solid experience ({experience:.2f}). Minor gaps can be addressed through onboarding.",
            f"Very good candidate showing {skills:.2f} skills compatibility and {experience:.2f} experience level. Recommended for consideration.",
            f"Solid match with {skills:.2f} technical fit and {experience:.2f} experience alignment. Good potential with some development opportunities."
        ]
    elif overall >= 0.5:
        explanations = [
            f"Moderate match with {skills:.2f} skills alignment and {experience:.2f} experience level. Some skill gaps may require training.",
            f"Decent fit showing {skills:.2f} technical compatibility. Experience level ({experience:.2f}) meets basic requirements with room for growth.",
            f"Reasonable match with {skills:.2f} skills overlap. May need additional mentoring to reach full potential."
        ]
    else:
        explanations = [
            f"Lower match with {skills:.2f} skills alignment and {experience:.2f} experience fit. Significant skill development would be required.",
            f"Limited compatibility showing {skills:.2f} technical overlap. Consider for junior role with extensive training program.",
            f"Basic match with {skills:.2f} skills fit. Would require substantial investment in skill development."
        ]
    
    return random.choice(explanations)


@router.post("/match-candidates", response_model=MatchResponse)
async def match_candidates_to_job(request: MatchRequest):
    """
    Find the best candidate matches for a specific job posting
    Mock implementation provides realistic results without API costs
    """
    start_time = time.time()
    
    try:
        logger.info(f"🎭 Mock matching candidates for job {request.job_id}")
        
        # Simulate processing time based on request size
        processing_delay = min(3.0, 0.5 + (request.max_results * 0.02))
        await asyncio.sleep(processing_delay)
        
        # Generate realistic number of total candidates
        total_candidates = random.randint(50, 200)
        
        # Generate matches based on request
        if request.talent_ids:
            # Specific talents requested
            candidate_pool = len(request.talent_ids)
        else:
            # General search
            candidate_pool = min(total_candidates, request.max_results * 3)
        
        matches = []
        
        for i in range(min(request.max_results, candidate_pool)):
            scores = calculate_realistic_scores()
            
            # Only include if meets minimum score
            if scores["overall_score"] >= request.min_score:
                talent_id = f"talent_{random.randint(1000, 9999)}"
                
                match_result = MatchResult(
                    talent_id=talent_id,
                    talent_name=generate_mock_talent_name(),
                    overall_score=scores["overall_score"],
                    skills_score=scores["skills_score"],
                    experience_score=scores["experience_score"],
                    location_score=scores["location_score"],
                    availability_score=scores["availability_score"],
                    salary_score=scores["salary_score"],
                    confidence_level=scores["confidence_level"],
                    skill_matches=generate_mock_skills(),
                    explanation=generate_match_explanation(scores) if request.include_explanation else None
                )
                
                matches.append(match_result)
        
        # Sort by overall score (descending)
        matches.sort(key=lambda x: x.overall_score, reverse=True)
        
        processing_time = (time.time() - start_time) * 1000
        
        # Mock job titles
        job_titles = [
            "Senior Full Stack Developer",
            "Frontend React Developer", 
            "Backend Python Engineer",
            "DevOps Engineer",
            "Data Scientist",
            "Product Manager",
            "UX Designer"
        ]
        
        return MatchResponse(
            job_id=request.job_id,
            job_title=random.choice(job_titles),
            total_candidates=total_candidates,
            matched_candidates=len(matches),
            processing_time_ms=processing_time,
            matches=matches
        )
        
    except Exception as e:
        logger.error(f"Mock matching failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate mock matches")


@router.post("/match-jobs")
async def match_talent_to_jobs(request: BulkMatchRequest):
    """
    Find the best job matches for a specific talent
    Mock implementation for bulk job matching
    """
    start_time = time.time()
    
    try:
        logger.info(f"🎭 Mock matching jobs for talent {request.talent_id}")
        
        # Simulate processing time
        await asyncio.sleep(len(request.job_ids) * 0.3)
        
        matches = []
        
        for job_id in request.job_ids:
            scores = calculate_realistic_scores()
            
            if scores["overall_score"] >= request.min_score:
                # Mock job data
                job_titles = ["Senior Developer", "Frontend Engineer", "Backend Developer", "DevOps Specialist"]
                companies = ["TechCorp", "InnovateLabs", "DataFlow Inc", "CloudSystems", "AI Solutions"]
                
                match = {
                    "job_id": job_id,
                    "job_title": random.choice(job_titles),
                    "company_name": random.choice(companies),
                    "overall_score": scores["overall_score"],
                    "skills_score": scores["skills_score"],
                    "experience_score": scores["experience_score"],
                    "location_score": scores["location_score"],
                    "salary_score": scores["salary_score"],
                    "confidence_level": scores["confidence_level"]
                }
                matches.append(match)
        
        # Sort by overall score
        matches.sort(key=lambda x: x["overall_score"], reverse=True)
        
        processing_time = (time.time() - start_time) * 1000
        
        return {
            "talent_id": request.talent_id,
            "talent_name": generate_mock_talent_name(),
            "total_jobs": len(request.job_ids),
            "matched_jobs": len(matches),
            "processing_time_ms": processing_time,
            "matches": matches,
            "algorithm_version": "mock_v2.1.0"
        }
        
    except Exception as e:
        logger.error(f"Bulk job matching failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate job matches")


@router.get("/matches/{job_id}")
async def get_cached_matches(
    job_id: str,
    limit: int = Query(default=50, le=100),
    min_score: float = Query(default=0.3, ge=0.0, le=1.0)
):
    """
    Get cached matching results for a job
    Mock implementation returns realistic cached data
    """
    try:
        await asyncio.sleep(0.2)  # Simulate database lookup
        
        # Generate mock cached matches
        num_matches = min(limit, random.randint(10, 30))
        matches = []
        
        for i in range(num_matches):
            scores = calculate_realistic_scores()
            
            if scores["overall_score"] >= min_score:
                match = {
                    "talent_id": f"talent_{random.randint(1000, 9999)}",
                    "talent_name": generate_mock_talent_name(),
                    "overall_score": scores["overall_score"],
                    "skills_score": scores["skills_score"],
                    "experience_score": scores["experience_score"],
                    "location_score": scores["location_score"],
                    "availability_score": scores["availability_score"],
                    "salary_score": scores["salary_score"],
                    "confidence_level": scores["confidence_level"],
                    "explanation": generate_match_explanation(scores),
                    "cached_at": "2024-01-20T10:30:00Z"
                }
                matches.append(match)
        
        # Sort by score
        matches.sort(key=lambda x: x["overall_score"], reverse=True)
        
        return {
            "job_id": job_id,
            "total_matches": len(matches),
            "matches": matches,
            "cache_status": "hit",
            "last_updated": "2024-01-20T10:30:00Z"
        }
        
    except Exception as e:
        logger.error(f"Failed to get cached matches: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve cached matches")


@router.get("/stats")
async def get_matching_stats():
    """
    Get matching algorithm statistics
    Mock implementation with realistic metrics
    """
    return {
        "total_matches_calculated": random.randint(50000, 100000),
        "matches_today": random.randint(500, 1500),
        "average_match_score": round(random.uniform(0.65, 0.75), 3),
        "average_processing_time_ms": round(random.uniform(800, 1500), 1),
        "algorithm_version": "mock_v2.1.0",
        "cache_hit_ratio": round(random.uniform(0.75, 0.90), 3),
        "top_skills": [
            {"skill": "Python", "match_frequency": random.randint(800, 1200)},
            {"skill": "JavaScript", "match_frequency": random.randint(700, 1100)},
            {"skill": "React", "match_frequency": random.randint(600, 1000)},
            {"skill": "Node.js", "match_frequency": random.randint(500, 900)},
            {"skill": "AWS", "match_frequency": random.randint(400, 800)}
        ],
        "score_distribution": {
            "excellent (0.9+)": f"{random.randint(8, 15)}%",
            "very_good (0.8-0.9)": f"{random.randint(15, 25)}%",
            "good (0.7-0.8)": f"{random.randint(25, 35)}%",
            "fair (0.6-0.7)": f"{random.randint(20, 30)}%",
            "poor (<0.6)": f"{random.randint(10, 20)}%"
        },
        "mode": "mock",
        "cost_savings": "$0.00 - All matches generated locally"
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "matching",
        "mode": "mock",
        "algorithms_loaded": [
            "skills_matching_v2.1",
            "experience_scoring_v1.8", 
            "location_compatibility_v1.5",
            "salary_matching_v1.3"
        ],
        "version": "mock_v2.1.0",
        "cost": "$0.00",
        "processing_capacity": "unlimited"
    }