"""
AI Manager - Core orchestration service for all AI models and operations
"""

import asyncio
import time
from typing import Dict, List, Optional, Any, Union
import json
import openai
import tiktoken
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from src.config.settings import get_settings
from src.config.redis_client import RedisManager
from src.config.database import DatabaseManager
from src.utils.logger import setup_logger, log_ai_request

logger = setup_logger(__name__)
settings = get_settings()


class AIManager:
    """Central AI manager for all AI operations"""
    
    def __init__(self):
        self.settings = settings
        self.redis_manager = RedisManager()
        self.db_manager = DatabaseManager()
        
        # Model instances
        self.openai_client = None
        self.embedding_model = None
        self.local_embedding_model = None
        
        # Model configurations
        self.model_configs = {
            "gpt-4": {"max_tokens": 8192, "context_window": 8192},
            "gpt-3.5-turbo": {"max_tokens": 4096, "context_window": 4096},
            "text-embedding-ada-002": {"dimensions": 1536},
            "all-MiniLM-L6-v2": {"dimensions": 384}
        }
        
        # Rate limiting
        self.request_counts = {}
        self.last_reset = time.time()
        
        # Performance metrics
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "total_tokens": 0,
            "avg_response_time": 0
        }
    
    async def initialize(self):
        """Initialize all AI models and services"""
        try:
            logger.info("Initializing AI Manager...")
            
            # Initialize OpenAI client
            if settings.enable_openai and settings.openai_api_key:
                self.openai_client = openai.AsyncOpenAI(
                    api_key=settings.openai_api_key
                )
                logger.info("OpenAI client initialized")
            
            # Initialize local embedding model
            if settings.enable_local_models:
                await self._load_local_models()
            
            logger.info("AI Manager initialization completed")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI Manager: {e}")
            raise
    
    async def _load_local_models(self):
        """Load local AI models"""
        try:
            # Load sentence transformer model in thread pool
            loop = asyncio.get_event_loop()
            self.local_embedding_model = await loop.run_in_executor(
                None, 
                SentenceTransformer, 
                settings.local_embedding_model
            )
            logger.info(f"Local embedding model loaded: {settings.local_embedding_model}")
            
        except Exception as e:
            logger.error(f"Failed to load local models: {e}")
            raise
    
    async def cleanup(self):
        """Cleanup AI Manager resources"""
        try:
            if self.openai_client:
                await self.openai_client.close()
            logger.info("AI Manager cleanup completed")
        except Exception as e:
            logger.error(f"Error during AI Manager cleanup: {e}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check health of AI services"""
        health_status = {
            "status": "healthy",
            "models": {},
            "metrics": self.metrics
        }
        
        try:
            # Check OpenAI
            if self.openai_client and settings.enable_openai:
                try:
                    # Simple test request
                    response = await self.openai_client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[{"role": "user", "content": "test"}],
                        max_tokens=1
                    )
                    health_status["models"]["openai"] = "healthy"
                except Exception as e:
                    health_status["models"]["openai"] = f"unhealthy: {str(e)}"
                    health_status["status"] = "degraded"
            
            # Check local models
            if self.local_embedding_model:
                try:
                    # Test embedding generation
                    test_embedding = await self.generate_embedding("test", use_local=True)
                    if test_embedding:
                        health_status["models"]["local_embedding"] = "healthy"
                    else:
                        health_status["models"]["local_embedding"] = "unhealthy"
                        health_status["status"] = "degraded"
                except Exception as e:
                    health_status["models"]["local_embedding"] = f"unhealthy: {str(e)}"
                    health_status["status"] = "degraded"
            
            return health_status
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    async def warm_up_models(self):
        """Warm up AI models with test requests"""
        try:
            logger.info("Warming up AI models...")
            
            # Warm up OpenAI
            if self.openai_client and settings.enable_openai:
                await self.chat_completion("Hello", model="gpt-3.5-turbo", max_tokens=1)
            
            # Warm up local embedding model
            if self.local_embedding_model:
                await self.generate_embedding("warmup", use_local=True)
            
            logger.info("AI models warmed up successfully")
            
        except Exception as e:
            logger.error(f"Model warm-up failed: {e}")
    
    async def chat_completion(self, prompt: str, model: str = None, 
                            max_tokens: int = None, temperature: float = None,
                            system_prompt: str = None, user_id: str = None) -> Dict[str, Any]:
        """Generate chat completion using OpenAI"""
        start_time = time.time()
        
        try:
            if not self.openai_client:
                raise ValueError("OpenAI client not initialized")
            
            # Use defaults from settings
            model = model or settings.default_model
            max_tokens = max_tokens or settings.max_tokens
            temperature = temperature or settings.temperature
            
            # Build messages
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            # Generate completion
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            # Extract response data
            result = {
                "content": response.choices[0].message.content,
                "model": response.model,
                "usage": {
                    "prompt_tokens": response.usage.prompt_tokens,
                    "completion_tokens": response.usage.completion_tokens,
                    "total_tokens": response.usage.total_tokens
                },
                "finish_reason": response.choices[0].finish_reason
            }
            
            # Update metrics
            duration = (time.time() - start_time) * 1000
            self._update_metrics(True, response.usage.total_tokens, duration)
            
            # Log request
            log_ai_request(
                logger, model, response.usage.total_tokens, duration, user_id
            )
            
            return result
            
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self._update_metrics(False, 0, duration)
            logger.error(f"Chat completion failed: {e}")
            raise
    
    async def generate_embedding(self, text: str, model: str = None, 
                               use_local: bool = False, user_id: str = None) -> List[float]:
        """Generate text embedding"""
        start_time = time.time()
        
        try:
            # Check cache first
            cache_key = f"embedding:{model or 'default'}:{hash(text)}"
            cached_embedding = await self.redis_manager.get(cache_key)
            if cached_embedding:
                return cached_embedding
            
            embedding = None
            
            if use_local and self.local_embedding_model:
                # Use local model
                loop = asyncio.get_event_loop()
                embedding = await loop.run_in_executor(
                    None, 
                    self.local_embedding_model.encode, 
                    text
                )
                embedding = embedding.tolist()
                model_used = settings.local_embedding_model
                
            elif self.openai_client and settings.enable_openai:
                # Use OpenAI embedding
                model = model or settings.embedding_model
                response = await self.openai_client.embeddings.create(
                    model=model,
                    input=text
                )
                embedding = response.data[0].embedding
                model_used = model
            
            else:
                raise ValueError("No embedding service available")
            
            # Cache the embedding
            if embedding:
                await self.redis_manager.set(
                    cache_key, 
                    embedding, 
                    ttl=settings.embedding_cache_ttl
                )
            
            # Update metrics
            duration = (time.time() - start_time) * 1000
            self._update_metrics(True, len(text.split()), duration)
            
            # Log request
            log_ai_request(logger, model_used, len(text.split()), duration, user_id)
            
            return embedding
            
        except Exception as e:
            duration = (time.time() - start_time) * 1000
            self._update_metrics(False, 0, duration)
            logger.error(f"Embedding generation failed: {e}")
            raise
    
    async def calculate_similarity(self, text1: str, text2: str, 
                                 use_local: bool = False) -> float:
        """Calculate semantic similarity between two texts"""
        try:
            # Generate embeddings for both texts
            embedding1 = await self.generate_embedding(text1, use_local=use_local)
            embedding2 = await self.generate_embedding(text2, use_local=use_local)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(
                np.array(embedding1).reshape(1, -1),
                np.array(embedding2).reshape(1, -1)
            )[0][0]
            
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Similarity calculation failed: {e}")
            raise
    
    async def extract_skills_from_text(self, text: str, 
                                     user_id: str = None) -> List[Dict[str, Any]]:
        """Extract skills from text using AI"""
        try:
            system_prompt = """
            You are a skills extraction specialist. Extract all professional skills, technologies, 
            tools, certifications, and competencies mentioned in the text. Return a JSON array of objects 
            with the following structure:
            [
                {
                    "skill": "skill name",
                    "category": "technical|soft|certification|language|domain",
                    "confidence": 0.0-1.0,
                    "context": "brief context where mentioned"
                }
            ]
            Only return the JSON array, no other text.
            """
            
            result = await self.chat_completion(
                prompt=text,
                system_prompt=system_prompt,
                temperature=0.3,
                user_id=user_id
            )
            
            # Parse the JSON response
            skills = json.loads(result["content"])
            return skills
            
        except Exception as e:
            logger.error(f"Skill extraction failed: {e}")
            raise
    
    async def analyze_job_description(self, job_description: str, 
                                    user_id: str = None) -> Dict[str, Any]:
        """Analyze job description to extract requirements and key information"""
        try:
            system_prompt = """
            Analyze this job description and extract key information. Return a JSON object with:
            {
                "title": "job title",
                "department": "department/team",
                "level": "entry|mid|senior|lead|executive",
                "employment_type": "full-time|part-time|contract|freelance",
                "required_skills": ["skill1", "skill2"],
                "preferred_skills": ["skill1", "skill2"],
                "required_experience_years": number,
                "education_requirements": ["requirement1"],
                "key_responsibilities": ["responsibility1"],
                "salary_range": {"min": number, "max": number, "currency": "USD"},
                "location_requirements": "remote|hybrid|onsite|flexible",
                "industry": "industry name",
                "company_size": "startup|small|medium|large|enterprise"
            }
            Only return the JSON object, no other text.
            """
            
            result = await self.chat_completion(
                prompt=job_description,
                system_prompt=system_prompt,
                temperature=0.2,
                user_id=user_id
            )
            
            # Parse the JSON response
            analysis = json.loads(result["content"])
            return analysis
            
        except Exception as e:
            logger.error(f"Job description analysis failed: {e}")
            raise
    
    async def generate_match_explanation(self, job_data: Dict, talent_data: Dict, 
                                       match_scores: Dict, user_id: str = None) -> str:
        """Generate AI explanation for job-talent match"""
        try:
            context = f"""
            Job: {job_data.get('title', 'Unknown')}
            Required Skills: {', '.join(job_data.get('required_skills', []))}
            Experience Required: {job_data.get('required_experience_years', 'Not specified')} years
            
            Candidate: {talent_data.get('first_name', '')} {talent_data.get('last_name', '')}
            Skills: {', '.join(talent_data.get('skills', []))}
            Experience: {talent_data.get('total_experience_years', 'Not specified')} years
            
            Match Scores:
            Overall: {match_scores.get('overall_score', 0):.2f}
            Skills: {match_scores.get('skills_score', 0):.2f}
            Experience: {match_scores.get('experience_score', 0):.2f}
            """
            
            system_prompt = """
            Provide a brief, professional explanation of why this candidate matches this job. 
            Highlight strengths and any areas of concern. Keep it under 200 words and focus on 
            the most relevant points for the hiring decision.
            """
            
            result = await self.chat_completion(
                prompt=context,
                system_prompt=system_prompt,
                temperature=0.4,
                user_id=user_id
            )
            
            return result["content"]
            
        except Exception as e:
            logger.error(f"Match explanation generation failed: {e}")
            return "Unable to generate explanation at this time."
    
    def _update_metrics(self, success: bool, tokens: int, duration: float):
        """Update performance metrics"""
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
        """Get AI service metrics"""
        return {
            **self.metrics,
            "models_loaded": {
                "openai": self.openai_client is not None,
                "local_embedding": self.local_embedding_model is not None
            },
            "cache_stats": await self.redis_manager.get("ai_cache_stats", {})
        }