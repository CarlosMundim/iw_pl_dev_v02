"""
Tomoo AI Concierge - Voice Assistant Backend
FastAPI server with Whisper STT, Coqui TTS, and LLM integration
"""

import os
import logging
import asyncio
import tempfile
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn

# Voice processing imports
try:
    import whisper
    import torch
    from TTS.api import TTS
    import soundfile as sf
    import librosa
except ImportError as e:
    print(f"Warning: Voice processing libraries not installed: {e}")
    whisper = None
    torch = None
    TTS = None

# LLM imports
try:
    from llama_cpp import Llama
except ImportError:
    print("Warning: llama-cpp-python not installed")
    Llama = None

# Initialize FastAPI app
app = FastAPI(
    title="Tomoo AI Concierge",
    description="Voice-enabled AI assistant with STT, TTS, and LLM capabilities",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global configuration
VOICE_ASSISTANT_DIR = Path(__file__).parent.parent
MODELS_DIR = VOICE_ASSISTANT_DIR / "models"
LOGS_DIR = VOICE_ASSISTANT_DIR / "logs"
AUDIO_DIR = VOICE_ASSISTANT_DIR / "audio"

# Create directories
for dir_path in [MODELS_DIR, LOGS_DIR, AUDIO_DIR]:
    dir_path.mkdir(exist_ok=True)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / 'tomoo.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("tomoo")

# Global models (loaded lazily)
whisper_model = None
tts_model = None
llm_model = None

# Pydantic models
class VoiceRequest(BaseModel):
    text: str
    voice: Optional[str] = "female"
    speed: Optional[float] = 1.0

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: str
    processing_time: float

# Voice Assistant Core Class
class TomooVoiceAssistant:
    def __init__(self):
        self.conversation_history = {}
        self.current_conversation = None
        
    async def load_models(self):
        """Load AI models lazily"""
        global whisper_model, tts_model, llm_model
        
        try:
            # Load Whisper for STT
            if whisper and not whisper_model:
                logger.info("Loading Whisper model...")
                whisper_model = whisper.load_model("base")
                logger.info("Whisper model loaded successfully")
            
            # Load TTS model
            if TTS and not tts_model:
                logger.info("Loading TTS model...")
                tts_model = TTS("tts_models/en/ljspeech/tacotron2-DDC_ph")
                logger.info("TTS model loaded successfully")
            
            # Load LLM (optional)
            if Llama and not llm_model and (MODELS_DIR / "llama-model.gguf").exists():
                logger.info("Loading LLM model...")
                llm_model = Llama(
                    model_path=str(MODELS_DIR / "llama-model.gguf"),
                    n_ctx=2048,
                    n_threads=4
                )
                logger.info("LLM model loaded successfully")
                
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    async def transcribe_audio(self, audio_file_path: str) -> str:
        """Convert speech to text using Whisper"""
        try:
            if not whisper_model:
                await self.load_models()
            
            if whisper_model:
                result = whisper_model.transcribe(audio_file_path)
                return result["text"].strip()
            else:
                # Fallback to mock transcription
                return "Mock transcription: Hello, this is a test message."
                
        except Exception as e:
            logger.error(f"Transcription error: {e}")
            return "Sorry, I couldn't understand the audio."
    
    async def generate_response(self, text: str, conversation_id: str = None) -> str:
        """Generate AI response using LLM or mock response"""
        try:
            if llm_model:
                # Use local LLM
                prompt = f"User: {text}\nTomoo AI Assistant: "
                response = llm_model(prompt, max_tokens=150, stop=["User:", "\n\n"])
                return response["choices"][0]["text"].strip()
            else:
                # Mock intelligent responses
                responses = {
                    "hello": "Hello! I'm Tomoo, your AI concierge. How can I assist you today?",
                    "help": "I'm here to help! I can answer questions, provide information, and assist with various tasks. What would you like to know?",
                    "jobs": "I can help you find job opportunities! Would you like me to search for positions based on your skills and preferences?",
                    "resume": "I'd be happy to help with your resume! You can upload it and I'll provide feedback and suggestions for improvement.",
                    "default": "That's an interesting question! As your AI concierge, I'm here to assist with job searching, career advice, and platform navigation. How can I help you specifically?"
                }
                
                text_lower = text.lower()
                for key, response in responses.items():
                    if key in text_lower:
                        return response
                return responses["default"]
                
        except Exception as e:
            logger.error(f"Response generation error: {e}")
            return "I apologize, but I'm having trouble processing your request right now."
    
    async def synthesize_speech(self, text: str, output_path: str) -> bool:
        """Convert text to speech using TTS"""
        try:
            if not tts_model:
                await self.load_models()
            
            if tts_model:
                tts_model.tts_to_file(text=text, file_path=output_path)
                return True
            else:
                # Create a placeholder audio file for testing
                logger.info(f"Mock TTS: Would say '{text}'")
                # Create a silent audio file as placeholder
                import numpy as np
                sample_rate = 22050
                duration = len(text) * 0.1  # Rough estimate
                silent_audio = np.zeros(int(sample_rate * duration))
                sf.write(output_path, silent_audio, sample_rate)
                return True
                
        except Exception as e:
            logger.error(f"Speech synthesis error: {e}")
            return False

# Initialize voice assistant
tomoo = TomooVoiceAssistant()

# API Endpoints

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    logger.info("Starting Tomoo AI Concierge...")
    await tomoo.load_models()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "tomoo-voice-assistant",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "models": {
            "whisper": whisper_model is not None,
            "tts": tts_model is not None,
            "llm": llm_model is not None
        }
    }

@app.get("/status")
async def get_status():
    """Get detailed service status"""
    return {
        "service": "Tomoo AI Concierge",
        "status": "operational",
        "capabilities": [
            "speech-to-text",
            "text-to-speech", 
            "conversation",
            "job-assistance",
            "platform-navigation"
        ],
        "endpoints": [
            "/health",
            "/status",
            "/voice",
            "/chat",
            "/tts",
            "/audio/{filename}"
        ]
    }

@app.post("/voice")
async def process_voice(audio: UploadFile = File(...)):
    """Process voice input: STT -> LLM -> TTS"""
    start_time = datetime.now()
    
    try:
        # Save uploaded audio
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio:
            content = await audio.read()
            tmp_audio.write(content)
            tmp_audio_path = tmp_audio.name
        
        # Transcribe audio
        transcript = await tomoo.transcribe_audio(tmp_audio_path)
        logger.info(f"Transcribed: {transcript}")
        
        # Generate response
        response_text = await tomoo.generate_response(transcript)
        logger.info(f"Response: {response_text}")
        
        # Generate speech
        output_audio_path = AUDIO_DIR / f"response_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        speech_success = await tomoo.synthesize_speech(response_text, str(output_audio_path))
        
        # Cleanup
        os.unlink(tmp_audio_path)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return {
            "transcript": transcript,
            "response": response_text,
            "audio_url": f"/audio/{output_audio_path.name}" if speech_success else None,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=f"Voice processing failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Text-based chat endpoint"""
    start_time = datetime.now()
    
    try:
        conversation_id = request.conversation_id or f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Generate response
        response_text = await tomoo.generate_response(request.message, conversation_id)
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            timestamp=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")

@app.post("/tts")
async def text_to_speech(request: VoiceRequest):
    """Convert text to speech"""
    try:
        output_filename = f"tts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        output_path = AUDIO_DIR / output_filename
        
        success = await tomoo.synthesize_speech(request.text, str(output_path))
        
        if success:
            return {
                "audio_url": f"/audio/{output_filename}",
                "text": request.text,
                "timestamp": datetime.now().isoformat()
            }
        else:
            raise HTTPException(status_code=500, detail="Speech synthesis failed")
            
    except Exception as e:
        logger.error(f"TTS error: {e}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")

@app.get("/audio/{filename}")
async def get_audio(filename: str):
    """Serve audio files"""
    audio_path = AUDIO_DIR / filename
    if audio_path.exists():
        return FileResponse(
            path=str(audio_path),
            media_type="audio/wav",
            filename=filename
        )
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time voice interaction"""
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Receive audio data or text
            data = await websocket.receive_json()
            
            if data.get("type") == "text":
                # Text chat
                response = await tomoo.generate_response(data.get("message", ""))
                await websocket.send_json({
                    "type": "text_response",
                    "response": response,
                    "timestamp": datetime.now().isoformat()
                })
            
            elif data.get("type") == "audio":
                # Audio processing would go here
                await websocket.send_json({
                    "type": "status",
                    "message": "Audio processing not implemented in WebSocket yet"
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()

# Mount static files for frontend
frontend_path = VOICE_ASSISTANT_DIR / "frontend" / "dist"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("VOICE_ASSISTANT_PORT", 8005)),
        reload=True,
        log_level="info"
    )