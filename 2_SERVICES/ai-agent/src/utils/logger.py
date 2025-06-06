"""
Structured logging configuration for the AI Agent service
"""

import logging
import sys
from datetime import datetime
from typing import Optional

from src.config.settings import get_settings

settings = get_settings()


class StructuredFormatter(logging.Formatter):
    """Custom formatter for structured logging"""
    
    def format(self, record):
        """Format log record with structured data"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": "ai-agent"
        }
        
        # Add exception info if present
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'user_id'):
            log_entry["user_id"] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry["request_id"] = record.request_id
        if hasattr(record, 'duration'):
            log_entry["duration_ms"] = record.duration
        if hasattr(record, 'model'):
            log_entry["model"] = record.model
        if hasattr(record, 'tokens'):
            log_entry["tokens"] = record.tokens
        
        return str(log_entry)


def setup_logger(name: str) -> logging.Logger:
    """Setup structured logger for the service"""
    logger = logging.getLogger(name)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Set level
    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logger.setLevel(level)
    
    # Create handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    
    # Set formatter
    if settings.environment == "production":
        formatter = StructuredFormatter()
    else:
        # Human-readable format for development
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
    
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Prevent propagation to avoid duplicate logs
    logger.propagate = False
    
    return logger


def log_ai_request(logger: logging.Logger, model: str, tokens: int, duration: float, 
                   user_id: Optional[str] = None, request_id: Optional[str] = None):
    """Log AI model request with metrics"""
    logger.info(
        f"AI request completed: {model}",
        extra={
            "model": model,
            "tokens": tokens,
            "duration": duration,
            "user_id": user_id,
            "request_id": request_id
        }
    )


def log_matching_result(logger: logging.Logger, job_id: str, talent_count: int, 
                       match_count: int, duration: float, request_id: Optional[str] = None):
    """Log matching operation result"""
    logger.info(
        f"Matching completed: {match_count}/{talent_count} matches for job {job_id}",
        extra={
            "job_id": job_id,
            "talent_count": talent_count,
            "match_count": match_count,
            "duration": duration,
            "request_id": request_id
        }
    )


def log_compliance_check(logger: logging.Logger, entity_id: str, jurisdiction: str, 
                        issues_count: int, duration: float, request_id: Optional[str] = None):
    """Log compliance check result"""
    logger.info(
        f"Compliance check completed: {issues_count} issues found for {entity_id} in {jurisdiction}",
        extra={
            "entity_id": entity_id,
            "jurisdiction": jurisdiction,
            "issues_count": issues_count,
            "duration": duration,
            "request_id": request_id
        }
    )


def log_document_processing(logger: logging.Logger, document_id: str, file_type: str, 
                           pages: int, duration: float, request_id: Optional[str] = None):
    """Log document processing result"""
    logger.info(
        f"Document processed: {file_type} with {pages} pages",
        extra={
            "document_id": document_id,
            "file_type": file_type,
            "pages": pages,
            "duration": duration,
            "request_id": request_id
        }
    )