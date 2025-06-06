FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    make \
    libasound2-dev \
    portaudio19-dev \
    libsndfile1-dev \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create directories
RUN mkdir -p models logs audio

# Copy backend source code
COPY backend/ ./backend/
COPY prompt_config.json .

# Create non-root user
RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 --gid 1001 appuser

# Change ownership of the app directory
RUN chown -R appuser:appgroup /app
USER appuser

# Expose port
EXPOSE 8005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8005/health || exit 1

# Environment variables
ENV VOICE_ASSISTANT_PORT=8005
ENV PYTHONPATH=/app/backend

# Start the application
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8005", "--reload"]