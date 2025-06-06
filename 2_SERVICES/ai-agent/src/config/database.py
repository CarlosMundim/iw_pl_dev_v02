"""
Database configuration and connection management
"""

import asyncio
from typing import AsyncGenerator, Optional

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
    AsyncEngine
)
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text

from src.config.settings import get_settings
from src.utils.logger import setup_logger

logger = setup_logger(__name__)
settings = get_settings()

# Global engine and session maker
engine: Optional[AsyncEngine] = None
async_session: Optional[async_sessionmaker] = None


async def init_db() -> None:
    """Initialize database connection"""
    global engine, async_session
    
    try:
        # Create async engine
        engine = create_async_engine(
            settings.database_url,
            echo=settings.debug,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300,
        )
        
        # Create session maker
        async_session = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
            autocommit=False
        )
        
        # Test connection
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        
        logger.info("Database connection initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db() -> None:
    """Close database connection"""
    global engine
    
    if engine:
        await engine.dispose()
        logger.info("Database connection closed")


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session"""
    if not async_session:
        raise RuntimeError("Database not initialized")
    
    async with async_session() as session:
        try:
            yield session
        except SQLAlchemyError as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()


async def check_db_health() -> dict:
    """Check database health"""
    try:
        if not engine:
            return {"status": "not_initialized"}
        
        async with engine.begin() as conn:
            result = await conn.execute(text("SELECT 1 as health_check"))
            health_check = result.scalar()
            
            if health_check == 1:
                # Get pool status
                pool = engine.pool
                return {
                    "status": "healthy",
                    "pool_size": pool.size(),
                    "checked_in": pool.checkedin(),
                    "checked_out": pool.checkedout(),
                    "overflow": pool.overflow(),
                }
            else:
                return {"status": "unhealthy", "reason": "Health check failed"}
                
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "error": str(e)}


class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self):
        self.session_maker = async_session
    
    async def execute_query(self, query: str, params: dict = None) -> list:
        """Execute a raw SQL query"""
        try:
            async with self.session_maker() as session:
                result = await session.execute(text(query), params or {})
                return result.fetchall()
        except Exception as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    async def execute_scalar(self, query: str, params: dict = None) -> any:
        """Execute a query and return scalar result"""
        try:
            async with self.session_maker() as session:
                result = await session.execute(text(query), params or {})
                return result.scalar()
        except Exception as e:
            logger.error(f"Scalar query execution failed: {e}")
            raise
    
    async def get_user_by_id(self, user_id: str) -> dict:
        """Get user by ID"""
        query = """
        SELECT p.id, p.email, p.first_name, p.last_name, p.user_type,
               p.verification_status, p.created_at
        FROM users.profiles p
        WHERE p.id = :user_id AND p.is_active = true
        """
        result = await self.execute_query(query, {"user_id": user_id})
        return dict(result[0]) if result else None
    
    async def get_talent_profile(self, talent_id: str) -> dict:
        """Get talent profile with skills and experience"""
        query = """
        SELECT t.*, p.first_name, p.last_name, p.email
        FROM users.talents t
        JOIN users.profiles p ON t.profile_id = p.id
        WHERE t.id = :talent_id OR t.profile_id = :talent_id
        """
        result = await self.execute_query(query, {"talent_id": talent_id})
        return dict(result[0]) if result else None
    
    async def get_job_posting(self, job_id: str) -> dict:
        """Get job posting details"""
        query = """
        SELECT j.*, e.company_name, e.company_size, e.industry
        FROM jobs.postings j
        JOIN users.employers e ON j.employer_id = e.id
        WHERE j.id = :job_id
        """
        result = await self.execute_query(query, {"job_id": job_id})
        return dict(result[0]) if result else None
    
    async def save_matching_score(self, job_id: str, talent_id: str, scores: dict) -> None:
        """Save matching scores to database"""
        query = """
        INSERT INTO matching.job_talent_scores 
        (job_id, talent_id, overall_score, skills_score, experience_score, 
         location_score, availability_score, salary_score, ai_explanation, 
         confidence_level, calculation_version)
        VALUES (:job_id, :talent_id, :overall_score, :skills_score, :experience_score,
                :location_score, :availability_score, :salary_score, :ai_explanation,
                :confidence_level, :calculation_version)
        ON CONFLICT (job_id, talent_id) 
        DO UPDATE SET 
            overall_score = :overall_score,
            skills_score = :skills_score,
            experience_score = :experience_score,
            location_score = :location_score,
            availability_score = :availability_score,
            salary_score = :salary_score,
            ai_explanation = :ai_explanation,
            confidence_level = :confidence_level,
            calculated_at = NOW(),
            calculation_version = :calculation_version
        """
        
        params = {
            "job_id": job_id,
            "talent_id": talent_id,
            "overall_score": scores.get("overall_score", 0),
            "skills_score": scores.get("skills_score", 0),
            "experience_score": scores.get("experience_score", 0),
            "location_score": scores.get("location_score", 0),
            "availability_score": scores.get("availability_score", 0),
            "salary_score": scores.get("salary_score", 0),
            "ai_explanation": scores.get("explanation", ""),
            "confidence_level": scores.get("confidence", 0.8),
            "calculation_version": "2.0"
        }
        
        await self.execute_query(query, params)
    
    async def get_compliance_rules(self, jurisdiction: str) -> list:
        """Get compliance rules for jurisdiction"""
        query = """
        SELECT rule_category, rule_name, rule_description, rule_parameters, severity
        FROM compliance.regulatory_rules
        WHERE jurisdiction = :jurisdiction AND is_active = true
        ORDER BY severity DESC, rule_category
        """
        result = await self.execute_query(query, {"jurisdiction": jurisdiction.upper()})
        return [dict(row) for row in result]
    
    async def save_compliance_check(self, check_data: dict) -> None:
        """Save compliance check results"""
        query = """
        INSERT INTO compliance.compliance_checks
        (entity_type, entity_id, jurisdiction, check_type, status, results,
         issues_found, recommendations, confidence_score, checked_by)
        VALUES (:entity_type, :entity_id, :jurisdiction, :check_type, :status,
                :results, :issues_found, :recommendations, :confidence_score, :checked_by)
        """
        await self.execute_query(query, check_data)