"""
Job-Candidate Matching Router
Advanced AI-powered matching algorithms with comprehensive scoring
"""

import time
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Query
from pydantic import BaseModel, Field
import numpy as np

from src.services.ai_manager import AIManager
from src.config.database import DatabaseManager, get_db_session
from src.config.redis_client import RedisManager
from src.utils.logger import setup_logger, log_matching_result

logger = setup_logger(__name__)
router = APIRouter()


# Request/Response Models
class MatchRequest(BaseModel):
    job_id: str = Field(..., description="Job ID to match candidates against")
    talent_ids: Optional[List[str]] = Field(None, description="Specific talent IDs to match (optional)")
    max_results: int = Field(default=50, le=100, description="Maximum number of results")
    min_score: float = Field(default=0.3, ge=0.0, le=1.0, description="Minimum match score")
    include_explanation: bool = Field(default=True, description="Include AI explanation")
    use_cached_results: bool = Field(default=True, description="Use cached results if available")


class SkillMatch(BaseModel):
    skill: str
    required: bool
    candidate_proficiency: Optional[float] = None
    match_score: float


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
    cached: bool = False


class MatchResponse(BaseModel):
    job_id: str
    job_title: str
    total_candidates: int
    matched_candidates: int
    processing_time_ms: float
    matches: List[MatchResult]


class BulkMatchRequest(BaseModel):
    job_ids: List[str] = Field(..., max_items=10, description="Job IDs to process")
    talent_id: str = Field(..., description="Talent ID to match against jobs")
    min_score: float = Field(default=0.3, ge=0.0, le=1.0, description="Minimum match score")


class BulkMatchResponse(BaseModel):
    talent_id: str
    talent_name: str
    total_jobs: int
    matched_jobs: int
    processing_time_ms: float
    matches: List[Dict[str, Any]]


# Dependency injection
async def get_ai_manager() -> AIManager:
    from src.main import app
    if not hasattr(app.state, 'ai_manager') or app.state.ai_manager is None:
        raise HTTPException(status_code=503, detail="AI Manager not initialized")
    return app.state.ai_manager


@router.post("/match-candidates", response_model=MatchResponse)
async def match_candidates_to_job(
    request: MatchRequest,
    background_tasks: BackgroundTasks,
    ai_manager: AIManager = Depends(get_ai_manager)
):
    """
    Find the best candidate matches for a specific job posting
    """
    start_time = time.time()
    request_id = f"match_{request.job_id}_{int(time.time())}"
    
    try:
        logger.info(f"Starting candidate matching for job {request.job_id}")
        
        db_manager = DatabaseManager()
        redis_manager = RedisManager()
        
        # Get job details
        job_data = await db_manager.get_job_posting(request.job_id)
        if not job_data:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Analyze job description if not cached
        job_analysis_key = f"job_analysis:{request.job_id}"
        job_analysis = await redis_manager.get(job_analysis_key)
        
        if not job_analysis:
            job_analysis = await ai_manager.analyze_job_description(
                job_data['description'],
                user_id=str(job_data.get('employer_id'))
            )
            await redis_manager.set(job_analysis_key, job_analysis, ttl=86400)  # Cache for 24h
        
        # Get candidate pool
        if request.talent_ids:
            # Specific talents requested
            talent_query = """
            SELECT t.*, p.first_name, p.last_name, p.email, 
                   t.skills, t.total_experience_years, t.current_location,
                   t.salary_expectation_min, t.salary_expectation_max,
                   t.availability_status, t.remote_work_preference
            FROM users.talents t
            JOIN users.profiles p ON t.profile_id = p.id
            WHERE t.id = ANY(:talent_ids) AND p.is_active = true
            """
            candidates = await db_manager.execute_query(
                talent_query, 
                {"talent_ids": request.talent_ids}
            )
        else:
            # Get active candidates matching basic criteria
            talent_query = """
            SELECT t.*, p.first_name, p.last_name, p.email,
                   t.skills, t.total_experience_years, t.current_location,
                   t.salary_expectation_min, t.salary_expectation_max,
                   t.availability_status, t.remote_work_preference
            FROM users.talents t
            JOIN users.profiles p ON t.profile_id = p.id
            WHERE p.is_active = true 
            AND t.availability_status IN ('available', 'open_to_offers')
            ORDER BY t.updated_at DESC
            LIMIT 500
            """
            candidates = await db_manager.execute_query(talent_query)
        
        if not candidates:
            return MatchResponse(
                job_id=request.job_id,
                job_title=job_data.get('title', 'Unknown'),
                total_candidates=0,
                matched_candidates=0,
                processing_time_ms=(time.time() - start_time) * 1000,
                matches=[]
            )
        
        # Process matches
        matches = []
        
        for candidate in candidates[:request.max_results * 2]:  # Process more than needed
            candidate_dict = dict(candidate)
            
            # Check cache first
            cache_key = f"match:{request.job_id}:{candidate_dict['id']}"
            cached_result = None
            
            if request.use_cached_results:
                cached_result = await redis_manager.get(cache_key)
            
            if cached_result and request.use_cached_results:
                # Use cached result
                match_result = MatchResult(**cached_result, cached=True)
                if match_result.overall_score >= request.min_score:
                    matches.append(match_result)
            else:
                # Calculate new match
                match_scores = await calculate_match_scores(
                    job_analysis, candidate_dict, ai_manager
                )
                
                if match_scores['overall_score'] >= request.min_score:
                    # Get skill matches
                    skill_matches = await get_skill_matches(
                        job_analysis.get('required_skills', []),
                        job_analysis.get('preferred_skills', []),
                        candidate_dict.get('skills', [])
                    )
                    
                    # Generate explanation if requested
                    explanation = None
                    if request.include_explanation:
                        explanation = await ai_manager.generate_match_explanation(
                            job_analysis, candidate_dict, match_scores
                        )
                    
                    match_result = MatchResult(
                        talent_id=candidate_dict['id'],
                        talent_name=f"{candidate_dict.get('first_name', '')} {candidate_dict.get('last_name', '')}".strip(),
                        overall_score=match_scores['overall_score'],
                        skills_score=match_scores['skills_score'],
                        experience_score=match_scores['experience_score'],
                        location_score=match_scores['location_score'],
                        availability_score=match_scores['availability_score'],
                        salary_score=match_scores['salary_score'],
                        confidence_level=match_scores['confidence'],
                        skill_matches=skill_matches,
                        explanation=explanation,
                        cached=False
                    )
                    
                    matches.append(match_result)
                    
                    # Cache the result
                    result_data = match_result.dict()
                    result_data.pop('cached', None)  # Remove cached field before storing
                    await redis_manager.set(cache_key, result_data, ttl=3600)
                    
                    # Save to database in background
                    background_tasks.add_task(
                        save_match_to_db,
                        db_manager,
                        request.job_id,
                        candidate_dict['id'],
                        match_scores
                    )
        
        # Sort matches by overall score
        matches.sort(key=lambda x: x.overall_score, reverse=True)
        matches = matches[:request.max_results]
        
        processing_time = (time.time() - start_time) * 1000
        
        # Log the result
        log_matching_result(
            logger, request.job_id, len(candidates), len(matches), 
            processing_time, request_id
        )
        
        return MatchResponse(
            job_id=request.job_id,
            job_title=job_data.get('title', 'Unknown'),
            total_candidates=len(candidates),
            matched_candidates=len(matches),
            processing_time_ms=processing_time,
            matches=matches
        )
        
    except Exception as e:
        logger.error(f"Candidate matching failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/match-jobs", response_model=BulkMatchResponse)
async def match_talent_to_jobs(
    request: BulkMatchRequest,
    ai_manager: AIManager = Depends(get_ai_manager)
):
    """
    Find the best job matches for a specific talent
    """
    start_time = time.time()
    
    try:
        logger.info(f"Starting job matching for talent {request.talent_id}")
        
        db_manager = DatabaseManager()
        redis_manager = RedisManager()
        
        # Get talent details
        talent_data = await db_manager.get_talent_profile(request.talent_id)
        if not talent_data:
            raise HTTPException(status_code=404, detail="Talent not found")
        
        # Get job details
        job_data_list = []
        for job_id in request.job_ids:
            job_data = await db_manager.get_job_posting(job_id)
            if job_data:
                job_data_list.append(job_data)
        
        if not job_data_list:
            raise HTTPException(status_code=404, detail="No valid jobs found")
        
        matches = []
        
        for job_data in job_data_list:
            # Analyze job if not cached
            job_analysis_key = f"job_analysis:{job_data['id']}"
            job_analysis = await redis_manager.get(job_analysis_key)
            
            if not job_analysis:
                job_analysis = await ai_manager.analyze_job_description(
                    job_data['description'],
                    user_id=str(job_data.get('employer_id'))
                )
                await redis_manager.set(job_analysis_key, job_analysis, ttl=86400)
            
            # Calculate match scores
            match_scores = await calculate_match_scores(
                job_analysis, talent_data, ai_manager
            )
            
            if match_scores['overall_score'] >= request.min_score:
                matches.append({
                    "job_id": job_data['id'],
                    "job_title": job_data.get('title', 'Unknown'),
                    "company_name": job_data.get('company_name', 'Unknown'),
                    "overall_score": match_scores['overall_score'],
                    "skills_score": match_scores['skills_score'],
                    "experience_score": match_scores['experience_score'],
                    "location_score": match_scores['location_score'],
                    "salary_score": match_scores['salary_score'],
                    "confidence_level": match_scores['confidence']
                })
        
        # Sort by overall score
        matches.sort(key=lambda x: x['overall_score'], reverse=True)
        
        processing_time = (time.time() - start_time) * 1000
        
        return BulkMatchResponse(
            talent_id=request.talent_id,
            talent_name=f"{talent_data.get('first_name', '')} {talent_data.get('last_name', '')}".strip(),
            total_jobs=len(job_data_list),
            matched_jobs=len(matches),
            processing_time_ms=processing_time,
            matches=matches
        )
        
    except Exception as e:
        logger.error(f"Job matching failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def calculate_match_scores(job_analysis: Dict, candidate_data: Dict, 
                               ai_manager: AIManager) -> Dict[str, float]:
    """Calculate comprehensive match scores"""
    try:
        scores = {
            'skills_score': 0.0,
            'experience_score': 0.0,
            'location_score': 0.0,
            'availability_score': 0.0,
            'salary_score': 0.0,
            'confidence': 0.8
        }
        
        # Skills matching (40% weight)
        required_skills = job_analysis.get('required_skills', [])
        preferred_skills = job_analysis.get('preferred_skills', [])
        candidate_skills = candidate_data.get('skills', [])
        
        if required_skills and candidate_skills:
            skills_similarity = await calculate_skills_similarity(
                required_skills + preferred_skills, candidate_skills, ai_manager
            )
            scores['skills_score'] = skills_similarity
        
        # Experience matching (25% weight)
        required_years = job_analysis.get('required_experience_years', 0)
        candidate_years = candidate_data.get('total_experience_years', 0)
        
        if required_years > 0:
            if candidate_years >= required_years:
                scores['experience_score'] = min(1.0, candidate_years / (required_years + 2))
            else:
                scores['experience_score'] = candidate_years / required_years * 0.8
        else:
            scores['experience_score'] = 0.8
        
        # Location matching (15% weight)
        location_req = job_analysis.get('location_requirements', 'flexible')
        remote_pref = candidate_data.get('remote_work_preference', 'flexible')
        
        if location_req == 'remote' or remote_pref in ['remote', 'remote_only']:
            scores['location_score'] = 1.0
        elif location_req == 'flexible' or remote_pref == 'flexible':
            scores['location_score'] = 0.8
        else:
            scores['location_score'] = 0.5
        
        # Availability matching (10% weight)
        availability = candidate_data.get('availability_status', 'unknown')
        if availability == 'available':
            scores['availability_score'] = 1.0
        elif availability == 'open_to_offers':
            scores['availability_score'] = 0.8
        else:
            scores['availability_score'] = 0.3
        
        # Salary matching (10% weight)
        job_salary = job_analysis.get('salary_range', {})
        candidate_min = candidate_data.get('salary_expectation_min', 0)
        candidate_max = candidate_data.get('salary_expectation_max', 0)
        
        if job_salary.get('max', 0) > 0 and candidate_min > 0:
            if candidate_min <= job_salary.get('max', 0):
                if candidate_max <= job_salary.get('max', 0):
                    scores['salary_score'] = 1.0
                else:
                    scores['salary_score'] = 0.7
            else:
                scores['salary_score'] = 0.3
        else:
            scores['salary_score'] = 0.5
        
        # Calculate weighted overall score
        weights = {
            'skills_score': 0.40,
            'experience_score': 0.25,
            'location_score': 0.15,
            'availability_score': 0.10,
            'salary_score': 0.10
        }
        
        overall_score = sum(scores[key] * weights[key] for key in weights.keys())
        scores['overall_score'] = round(overall_score, 3)
        
        return scores
        
    except Exception as e:
        logger.error(f"Score calculation failed: {e}")
        return {
            'overall_score': 0.0,
            'skills_score': 0.0,
            'experience_score': 0.0,
            'location_score': 0.0,
            'availability_score': 0.0,
            'salary_score': 0.0,
            'confidence': 0.1
        }


async def calculate_skills_similarity(job_skills: List[str], 
                                    candidate_skills: List[str], 
                                    ai_manager: AIManager) -> float:
    """Calculate skills similarity using embeddings"""
    try:
        if not job_skills or not candidate_skills:
            return 0.0
        
        # Generate embeddings for skill sets
        job_skills_text = ", ".join(job_skills)
        candidate_skills_text = ", ".join(candidate_skills)
        
        similarity = await ai_manager.calculate_similarity(
            job_skills_text, candidate_skills_text, use_local=True
        )
        
        return max(0.0, min(1.0, similarity))
        
    except Exception as e:
        logger.error(f"Skills similarity calculation failed: {e}")
        return 0.0


async def get_skill_matches(required_skills: List[str], preferred_skills: List[str], 
                          candidate_skills: List[str]) -> List[SkillMatch]:
    """Get detailed skill matching information"""
    skill_matches = []
    
    # Check required skills
    for skill in required_skills:
        match_score = calculate_skill_match_score(skill, candidate_skills)
        skill_matches.append(SkillMatch(
            skill=skill,
            required=True,
            match_score=match_score
        ))
    
    # Check preferred skills
    for skill in preferred_skills:
        if skill not in required_skills:  # Avoid duplicates
            match_score = calculate_skill_match_score(skill, candidate_skills)
            skill_matches.append(SkillMatch(
                skill=skill,
                required=False,
                match_score=match_score
            ))
    
    return skill_matches


def calculate_skill_match_score(job_skill: str, candidate_skills: List[str]) -> float:
    """Calculate match score for a specific skill"""
    job_skill_lower = job_skill.lower()
    
    # Exact match
    for candidate_skill in candidate_skills:
        if candidate_skill.lower() == job_skill_lower:
            return 1.0
    
    # Partial match
    for candidate_skill in candidate_skills:
        candidate_skill_lower = candidate_skill.lower()
        if job_skill_lower in candidate_skill_lower or candidate_skill_lower in job_skill_lower:
            return 0.7
    
    return 0.0


async def save_match_to_db(db_manager: DatabaseManager, job_id: str, 
                          talent_id: str, scores: Dict[str, float]):
    """Save matching result to database"""
    try:
        await db_manager.save_matching_score(job_id, talent_id, scores)
    except Exception as e:
        logger.error(f"Failed to save match to database: {e}")


# Additional endpoints for match management
@router.get("/matches/{job_id}")
async def get_cached_matches(
    job_id: str,
    limit: int = Query(default=50, le=100),
    min_score: float = Query(default=0.3, ge=0.0, le=1.0)
):
    """Get cached matching results for a job"""
    try:
        db_manager = DatabaseManager()
        
        query = """
        SELECT jts.talent_id, jts.overall_score, jts.skills_score, 
               jts.experience_score, jts.location_score, jts.availability_score,
               jts.salary_score, jts.ai_explanation, jts.confidence_level,
               p.first_name, p.last_name, p.email
        FROM matching.job_talent_scores jts
        JOIN users.talents t ON jts.talent_id = t.id
        JOIN users.profiles p ON t.profile_id = p.id
        WHERE jts.job_id = :job_id 
        AND jts.overall_score >= :min_score
        ORDER BY jts.overall_score DESC
        LIMIT :limit
        """
        
        results = await db_manager.execute_query(query, {
            "job_id": job_id,
            "min_score": min_score,
            "limit": limit
        })
        
        matches = []
        for row in results:
            row_dict = dict(row)
            matches.append({
                "talent_id": row_dict['talent_id'],
                "talent_name": f"{row_dict['first_name']} {row_dict['last_name']}",
                "overall_score": row_dict['overall_score'],
                "skills_score": row_dict['skills_score'],
                "experience_score": row_dict['experience_score'],
                "location_score": row_dict['location_score'],
                "availability_score": row_dict['availability_score'],
                "salary_score": row_dict['salary_score'],
                "confidence_level": row_dict['confidence_level'],
                "explanation": row_dict['ai_explanation']
            })
        
        return {
            "job_id": job_id,
            "total_matches": len(matches),
            "matches": matches
        }
        
    except Exception as e:
        logger.error(f"Failed to get cached matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))