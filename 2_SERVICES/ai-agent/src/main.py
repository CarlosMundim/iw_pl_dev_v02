"""
iWORKZ AI Agent Service
Advanced AI-powered matching, compliance, and document processing service
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from src.config.settings import get_settings
from src.config.database import init_db, close_db
from src.config.redis_client import init_redis, close_redis
from src.routers import (
    chat,
    matching,
    skills,
    compliance,
    documents,
    embeddings,
    analytics
)
from src.utils.logger import setup_logger
from src.services.ai_manager import AIManager
from src.services.mock_ai_manager import MockAIManager

# Setup logging
logger = setup_logger(__name__)
settings = get_settings()

# Global AI Manager instance
ai_manager: AIManager = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    global ai_manager
    
    logger.info("Starting iWORKZ AI Agent Service...")
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized")
        
        # Initialize Redis
        await init_redis()
        logger.info("Redis initialized")
        
        # Initialize AI Manager (Mock or Real)
        if settings.use_mock_ai:
            ai_manager = MockAIManager()
            logger.info("🎭 Using Mock AI Manager - Zero API costs!")
        else:
            ai_manager = AIManager()
            logger.info("🤖 Using Real AI Manager - API costs will apply")
        
        await ai_manager.initialize()
        app.state.ai_manager = ai_manager
        logger.info("AI Manager initialized")
        
        logger.info("✅ AI Agent Service startup complete")
        
        yield
        
    except Exception as e:
        logger.error(f"Failed to start AI Agent Service: {e}")
        raise
    
    finally:
        # Cleanup
        logger.info("Shutting down AI Agent Service...")
        
        if ai_manager:
            await ai_manager.cleanup()
            logger.info("AI Manager cleaned up")
        
        await close_redis()
        logger.info("Redis connection closed")
        
        await close_db()
        logger.info("Database connection closed")
        
        logger.info("✅ AI Agent Service shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="iWORKZ AI Agent Service",
    description="Advanced AI-powered matching, compliance, and document processing service for the iWORKZ platform",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None,
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.allowed_hosts
)


# Custom exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    logger.error(f"Value error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"error": "Invalid input", "message": str(exc)}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "An unexpected error occurred"}
    )


# Health check endpoints
@app.get("/health")
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "service": "ai-agent",
        "version": "1.0.0",
        "timestamp": asyncio.get_event_loop().time()
    }


@app.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with component status"""
    try:
        health_status = {
            "status": "healthy",
            "service": "ai-agent",
            "version": "1.0.0",
            "timestamp": asyncio.get_event_loop().time(),
            "components": {}
        }
        
        # Check AI Manager
        if hasattr(app.state, 'ai_manager') and app.state.ai_manager:
            ai_status = await app.state.ai_manager.health_check()
            health_status["components"]["ai_manager"] = ai_status
        else:
            health_status["components"]["ai_manager"] = {"status": "not_initialized"}
        
        # Check database connection
        from src.config.database import check_db_health
        db_status = await check_db_health()
        health_status["components"]["database"] = db_status
        
        # Check Redis connection
        from src.config.redis_client import check_redis_health
        redis_status = await check_redis_health()
        health_status["components"]["redis"] = redis_status
        
        # Overall status
        component_statuses = [comp["status"] for comp in health_status["components"].values()]
        if all(status == "healthy" for status in component_statuses):
            health_status["status"] = "healthy"
        elif any(status == "unhealthy" for status in component_statuses):
            health_status["status"] = "unhealthy"
        else:
            health_status["status"] = "degraded"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "service": "ai-agent",
            "error": str(e),
            "timestamp": asyncio.get_event_loop().time()
        }


# API Info endpoint
@app.get("/")
async def root():
    """API information and available endpoints"""
    return {
        "name": "iWORKZ AI Agent Service",
        "version": "1.0.0",
        "description": "Advanced AI-powered matching, compliance, and document processing service",
        "endpoints": {
            "chat": "/chat - AI-powered conversational interface",
            "matching": "/matching - Job-candidate matching algorithms",
            "skills": "/skills - Skills extraction and analysis",
            "compliance": "/compliance - Regulatory compliance checking",
            "documents": "/documents - Document processing and analysis",
            "embeddings": "/embeddings - Text embeddings and similarity",
            "analytics": "/analytics - AI-powered analytics and insights"
        },
        "health": {
            "basic": "/health",
            "detailed": "/health/detailed"
        },
        "documentation": "/docs" if settings.environment == "development" else "Contact admin for API documentation"
    }


# Include routers
app.include_router(chat.router, prefix="/chat", tags=["Chat & Conversation"])
app.include_router(matching.router, prefix="/matching", tags=["AI Matching"])
app.include_router(skills.router, prefix="/skills", tags=["Skills Analysis"])
app.include_router(compliance.router, prefix="/compliance", tags=["Compliance Checking"])
app.include_router(documents.router, prefix="/documents", tags=["Document Processing"])
app.include_router(embeddings.router, prefix="/embeddings", tags=["Embeddings & Similarity"])
app.include_router(analytics.router, prefix="/analytics", tags=["AI Analytics"])


# Dependency to get AI Manager
async def get_ai_manager() -> AIManager:
    """Dependency to get the AI Manager instance"""
    if not hasattr(app.state, 'ai_manager') or app.state.ai_manager is None:
        raise HTTPException(status_code=503, detail="AI Manager not initialized")
    return app.state.ai_manager


# Background task for model warming
@app.on_event("startup")
async def warm_up_models():
    """Warm up AI models in the background"""
    async def _warm_up():
        try:
            await asyncio.sleep(5)  # Wait for full startup
            if hasattr(app.state, 'ai_manager') and app.state.ai_manager:
                await app.state.ai_manager.warm_up_models()
                logger.info("Models warmed up successfully")
        except Exception as e:
            logger.error(f"Model warm-up failed: {e}")
    
    # Run in background
    asyncio.create_task(_warm_up())


if __name__ == "__main__":
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "development",
        log_level=settings.log_level.lower(),
        access_log=True
    )