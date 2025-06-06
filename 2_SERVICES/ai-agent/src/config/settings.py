"""
Application settings and configuration management
"""

import os
from functools import lru_cache
from typing import List, Optional

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=True, env="DEBUG")
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    
    # API Configuration
    api_host: str = Field(default="0.0.0.0", env="API_HOST")
    api_port: int = Field(default=8000, env="AI_SERVICE_PORT")
    api_prefix: str = Field(default="/api/v1", env="API_PREFIX")
    
    # Security
    secret_key: str = Field(default="dev-secret-key", env="SECRET_KEY")
    allowed_origins: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
        env="ALLOWED_ORIGINS"
    )
    allowed_hosts: List[str] = Field(
        default=["localhost", "127.0.0.1", "0.0.0.0"],
        env="ALLOWED_HOSTS"
    )
    
    # Database Configuration
    postgres_host: str = Field(default="localhost", env="POSTGRES_HOST")
    postgres_port: int = Field(default=5432, env="POSTGRES_PORT")
    postgres_db: str = Field(default="iworkz_dev", env="POSTGRES_DB")
    postgres_user: str = Field(default="iworkz_user", env="POSTGRES_USER")
    postgres_password: str = Field(default="", env="POSTGRES_PASSWORD")
    
    @property
    def database_url(self) -> str:
        """Get database URL"""
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
    
    # Redis Configuration
    redis_url: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    redis_password: Optional[str] = Field(default=None, env="REDIS_PASSWORD")
    redis_db: int = Field(default=1, env="REDIS_DB")  # Use different DB for AI service
    
    # AI Model Configuration
    openai_api_key: str = Field(default="", env="OPENAI_API_KEY")
    anthropic_api_key: str = Field(default="", env="ANTHROPIC_API_KEY")
    deepseek_api_key: str = Field(default="", env="DEEPSEEK_API_KEY")
    
    # Model Settings
    default_model: str = Field(default="gpt-3.5-turbo", env="DEFAULT_AI_MODEL")
    max_tokens: int = Field(default=2000, env="MAX_TOKENS")
    temperature: float = Field(default=0.7, env="TEMPERATURE")
    
    # Embedding Models
    embedding_model: str = Field(default="text-embedding-ada-002", env="EMBEDDING_MODEL")
    local_embedding_model: str = Field(default="all-MiniLM-L6-v2", env="LOCAL_EMBEDDING_MODEL")
    
    # Processing Limits
    max_file_size: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    max_concurrent_requests: int = Field(default=100, env="MAX_CONCURRENT_REQUESTS")
    request_timeout: int = Field(default=300, env="REQUEST_TIMEOUT")  # 5 minutes
    
    # Caching
    cache_ttl: int = Field(default=3600, env="CACHE_TTL")  # 1 hour
    embedding_cache_ttl: int = Field(default=86400, env="EMBEDDING_CACHE_TTL")  # 24 hours
    
    # Monitoring
    sentry_dsn: Optional[str] = Field(default=None, env="SENTRY_DSN")
    enable_metrics: bool = Field(default=True, env="ENABLE_METRICS")
    
    # Feature Flags
    enable_openai: bool = Field(default=True, env="ENABLE_OPENAI")
    enable_anthropic: bool = Field(default=False, env="ENABLE_ANTHROPIC")
    enable_local_models: bool = Field(default=True, env="ENABLE_LOCAL_MODELS")
    enable_skill_extraction: bool = Field(default=True, env="ENABLE_SKILL_EXTRACTION")
    enable_compliance_checking: bool = Field(default=True, env="ENABLE_COMPLIANCE_CHECKING")
    
    # Mock Mode (Development/Demo)
    use_mock_ai: bool = Field(default=True, env="USE_MOCK_AI")
    mock_response_delay: float = Field(default=0.8, env="MOCK_RESPONSE_DELAY")
    
    # Compliance Configuration
    supported_jurisdictions: List[str] = Field(
        default=["UK", "DE", "AU", "US", "CA", "FR", "NL", "SG", "JP"],
        env="SUPPORTED_JURISDICTIONS"
    )
    
    # Skills Database
    skills_database_url: Optional[str] = Field(default=None, env="SKILLS_DATABASE_URL")
    auto_update_skills: bool = Field(default=True, env="AUTO_UPDATE_SKILLS")
    
    # Document Processing
    max_pages_per_document: int = Field(default=50, env="MAX_PAGES_PER_DOCUMENT")
    supported_file_types: List[str] = Field(
        default=["pdf", "docx", "txt", "md", "csv", "xlsx"],
        env="SUPPORTED_FILE_TYPES"
    )
    
    # Matching Configuration
    min_match_score: float = Field(default=0.3, env="MIN_MATCH_SCORE")
    max_matches_per_request: int = Field(default=100, env="MAX_MATCHES_PER_REQUEST")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=1000, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1 hour
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()