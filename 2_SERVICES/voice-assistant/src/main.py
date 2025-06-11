"""
iWORKZ Voice Assistant Service
AI-powered voice interface for the employment platform
"""

import os
import logging
from fastapi import FastAPI, WebSocket, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
import asyncio
import json
from datetime import datetime
import whisper
import torch
from TTS.api import TTS
import numpy as np
import soundfile as sf
from io import BytesIO
import tempfile

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="iWORKZ Voice Assistant",
    description="AI-powered voice interface for employment platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
whisper_model = None
tts_model = None

class VoiceAssistant:
    def __init__(self):
        self.conversation_history = []
        self.user_context = {}
        self.supported_languages = ["en", "ja", "ko", "zh"]
        
    async def initialize_models(self):
        """Initialize AI models for speech processing"""
        global whisper_model, tts_model
        
        try:
            logger.info("Loading Whisper model for speech recognition...")
            whisper_model = whisper.load_model("base")
            
            logger.info("Loading TTS model for speech synthesis...")
            # Use Japanese TTS model for multilingual support
            tts_model = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", 
                          progress_bar=False, gpu=torch.cuda.is_available())
            
            logger.info("Voice assistant models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            raise
    
    async def speech_to_text(self, audio_bytes: bytes) -> dict:
        """Convert speech audio to text using Whisper"""
        try:
            # Save audio bytes to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            # Transcribe using Whisper
            result = whisper_model.transcribe(temp_path)
            
            # Clean up temporary file
            os.unlink(temp_path)
            
            return {
                "text": result["text"],
                "language": result.get("language", "en"),
                "confidence": 1.0  # Whisper doesn't provide confidence scores
            }
            
        except Exception as e:
            logger.error(f"Speech-to-text error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Speech recognition failed: {str(e)}")
    
    async def text_to_speech(self, text: str, language: str = "en", voice: str = "female") -> bytes:
        """Convert text to speech using TTS"""
        try:
            # Configure voice settings based on language
            if language == "ja":
                speaker_wav = "voices/japanese_female.wav"  # You'd need to provide reference audio
            elif language == "ko":
                speaker_wav = "voices/korean_female.wav"
            else:
                speaker_wav = "voices/english_female.wav"
            
            # Generate speech
            wav = tts_model.tts(text=text, 
                              speaker_wav=speaker_wav if os.path.exists(speaker_wav) else None,
                              language=language)
            
            # Convert to bytes
            with BytesIO() as buffer:
                sf.write(buffer, wav, 22050, format='WAV')
                audio_bytes = buffer.getvalue()
            
            return audio_bytes
            
        except Exception as e:
            logger.error(f"Text-to-speech error: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Speech synthesis failed: {str(e)}")
    
    async def process_conversation(self, text: str, user_id: str = None, language: str = "en") -> str:
        """Process conversational AI for job-related queries"""
        try:
            # Add to conversation history
            self.conversation_history.append({
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "input": text,
                "language": language
            })
            
            # Simple rule-based responses for demo
            # In production, this would integrate with OpenAI or other LLM
            text_lower = text.lower()
            
            if any(word in text_lower for word in ["job", "work", "employment", "career"]):
                if language == "ja":
                    response = "お仕事に関するお問い合わせですね。どのような職種をお探しでしょうか？"
                else:
                    response = "I understand you're looking for job opportunities. What type of position are you interested in?"
                    
            elif any(word in text_lower for word in ["skill", "experience", "qualification"]):
                if language == "ja":
                    response = "あなたのスキルや経験について教えてください。どのような技術をお持ちですか？"
                else:
                    response = "I'd like to learn about your skills and experience. What technologies are you proficient in?"
                    
            elif any(word in text_lower for word in ["salary", "compensation", "pay"]):
                if language == "ja":
                    response = "給与についてのご質問ですね。ご希望の年収範囲を教えていただけますか？"
                else:
                    response = "I understand you have questions about compensation. What salary range are you considering?"
                    
            elif any(word in text_lower for word in ["hello", "hi", "こんにちは"]):
                if language == "ja":
                    response = "こんにちは！iWORKZ音声アシスタントです。転職や求人についてお手伝いします。"
                else:
                    response = "Hello! I'm the iWORKZ voice assistant. I'm here to help you with job search and career opportunities."
                    
            else:
                if language == "ja":
                    response = "申し訳ございませんが、よくわかりませんでした。転職や求人について何かお手伝いできることはありますか？"
                else:
                    response = "I'm sorry, I didn't quite understand that. How can I help you with your job search today?"
            
            # Add response to history
            self.conversation_history[-1]["response"] = response
            
            return response
            
        except Exception as e:
            logger.error(f"Conversation processing error: {str(e)}")
            return "Sorry, I encountered an error while processing your request."

# Initialize voice assistant
voice_assistant = VoiceAssistant()

@app.on_event("startup")
async def startup_event():
    """Initialize the voice assistant on startup"""
    logger.info("Starting iWORKZ Voice Assistant Service...")
    await voice_assistant.initialize_models()
    logger.info("Voice Assistant Service ready!")

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "iWORKZ Voice Assistant",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "Speech-to-text (Whisper)",
            "Text-to-speech (TTS)",
            "Multilingual support (EN, JA, KO, ZH)",
            "Job search assistance",
            "Real-time conversation"
        ],
        "authors": [
            "Carlos Mundim - Project Lead & Technical Architect",
            "Prof. Jeanette Dennisson - AI-Integration Architecture Leader",
            "Claude Code (Anthropic) - AI Development Partner"
        ],
        "endpoints": {
            "POST /speech-to-text": "Convert audio to text",
            "POST /text-to-speech": "Convert text to audio",
            "POST /conversation": "Process conversational AI",
            "WS /voice-chat": "Real-time voice chat",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models": {
            "whisper": "loaded" if whisper_model else "not_loaded",
            "tts": "loaded" if tts_model else "not_loaded"
        }
    }

@app.post("/speech-to-text")
async def speech_to_text_endpoint(audio: UploadFile = File(...)):
    """Convert uploaded audio file to text"""
    try:
        # Read audio file
        audio_bytes = await audio.read()
        
        # Process speech-to-text
        result = await voice_assistant.speech_to_text(audio_bytes)
        
        return {
            "success": True,
            "transcription": result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Speech-to-text endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/text-to-speech")
async def text_to_speech_endpoint(
    request: dict
):
    """Convert text to speech audio"""
    try:
        text = request.get("text")
        language = request.get("language", "en")
        voice = request.get("voice", "female")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Generate speech
        audio_bytes = await voice_assistant.text_to_speech(text, language, voice)
        
        # Return audio file
        return StreamingResponse(
            BytesIO(audio_bytes),
            media_type="audio/wav",
            headers={"Content-Disposition": "attachment; filename=speech.wav"}
        )
        
    except Exception as e:
        logger.error(f"Text-to-speech endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/conversation")
async def conversation_endpoint(request: dict):
    """Process conversational AI request"""
    try:
        text = request.get("text")
        user_id = request.get("user_id")
        language = request.get("language", "en")
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Process conversation
        response = await voice_assistant.process_conversation(text, user_id, language)
        
        return {
            "success": True,
            "response": response,
            "language": language,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Conversation endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/voice-chat")
async def voice_chat_websocket(websocket: WebSocket):
    """Real-time voice chat WebSocket endpoint"""
    await websocket.accept()
    logger.info("Voice chat WebSocket connection established")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            message_type = message.get("type")
            
            if message_type == "audio":
                # Process audio data (base64 encoded)
                import base64
                audio_bytes = base64.b64decode(message.get("audio"))
                
                # Speech-to-text
                transcription = await voice_assistant.speech_to_text(audio_bytes)
                
                # Process conversation
                response_text = await voice_assistant.process_conversation(
                    transcription["text"],
                    message.get("user_id"),
                    transcription["language"]
                )
                
                # Text-to-speech
                response_audio = await voice_assistant.text_to_speech(
                    response_text,
                    transcription["language"]
                )
                
                # Send response
                response_audio_b64 = base64.b64encode(response_audio).decode()
                await websocket.send_text(json.dumps({
                    "type": "response",
                    "text": response_text,
                    "audio": response_audio_b64,
                    "language": transcription["language"],
                    "timestamp": datetime.now().isoformat()
                }))
                
            elif message_type == "text":
                # Process text-only conversation
                response_text = await voice_assistant.process_conversation(
                    message.get("text"),
                    message.get("user_id"),
                    message.get("language", "en")
                )
                
                await websocket.send_text(json.dumps({
                    "type": "text_response",
                    "response": response_text,
                    "timestamp": datetime.now().isoformat()
                }))
                
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close()

@app.get("/conversation-history")
async def get_conversation_history(user_id: str = None, limit: int = 50):
    """Get conversation history"""
    try:
        history = voice_assistant.conversation_history
        
        if user_id:
            history = [conv for conv in history if conv.get("user_id") == user_id]
        
        # Limit results
        history = history[-limit:]
        
        return {
            "success": True,
            "history": history,
            "count": len(history),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"History endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 3007)),
        reload=os.getenv("ENV") == "development",
        log_level="info"
    )