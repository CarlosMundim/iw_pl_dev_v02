"""
Voice Input Module - Whisper-based Speech-to-Text
Handles audio recording and transcription for Tomoo AI Concierge
"""

import os
import logging
import tempfile
import wave
from pathlib import Path
from typing import Optional, Union

try:
    import whisper
    import torch
    import numpy as np
    import soundfile as sf
    import librosa
except ImportError as e:
    print(f"Warning: Voice input libraries not installed: {e}")
    whisper = None
    torch = None

logger = logging.getLogger("tomoo.voice_input")

class VoiceInput:
    """Handles speech-to-text conversion using Whisper"""
    
    def __init__(self, model_size: str = "base", device: Optional[str] = None):
        """
        Initialize Whisper model for speech recognition
        
        Args:
            model_size: Whisper model size (tiny, base, small, medium, large)
            device: Device to run on (cuda, cpu, auto)
        """
        self.model_size = model_size
        self.device = device or ("cuda" if torch and torch.cuda.is_available() else "cpu")
        self.model = None
        self.is_loaded = False
        
    async def load_model(self):
        """Load Whisper model lazily"""
        if self.model is None and whisper:
            try:
                logger.info(f"Loading Whisper model '{self.model_size}' on {self.device}")
                self.model = whisper.load_model(self.model_size, device=self.device)
                self.is_loaded = True
                logger.info("Whisper model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load Whisper model: {e}")
                self.is_loaded = False
        return self.is_loaded
    
    def preprocess_audio(self, audio_path: str, target_sr: int = 16000) -> Optional[str]:
        """
        Preprocess audio file for optimal Whisper performance
        
        Args:
            audio_path: Path to input audio file
            target_sr: Target sample rate for Whisper (16kHz recommended)
            
        Returns:
            Path to preprocessed audio file
        """
        try:
            # Load audio
            audio, sr = librosa.load(audio_path, sr=target_sr)
            
            # Normalize audio
            audio = librosa.util.normalize(audio)
            
            # Remove silence from beginning and end
            audio, _ = librosa.effects.trim(audio, top_db=20)
            
            # Save preprocessed audio
            output_path = audio_path.replace('.wav', '_processed.wav')
            sf.write(output_path, audio, target_sr)
            
            return output_path
            
        except Exception as e:
            logger.error(f"Audio preprocessing failed: {e}")
            return audio_path  # Return original if preprocessing fails
    
    async def transcribe_file(self, audio_path: str, language: Optional[str] = None) -> dict:
        """
        Transcribe audio file to text
        
        Args:
            audio_path: Path to audio file
            language: Language code (e.g., 'en', 'es', 'fr') or None for auto-detect
            
        Returns:
            Dictionary with transcription results
        """
        if not await self.load_model():
            return {
                "text": "Speech recognition not available",
                "language": "unknown",
                "confidence": 0.0,
                "segments": [],
                "error": "Whisper model not loaded"
            }
        
        try:
            # Preprocess audio for better results
            processed_path = self.preprocess_audio(audio_path)
            
            # Transcribe with Whisper
            result = self.model.transcribe(
                processed_path,
                language=language,
                task="transcribe",
                fp16=torch.cuda.is_available()
            )
            
            # Clean up processed file if different from original
            if processed_path != audio_path:
                try:
                    os.unlink(processed_path)
                except:
                    pass
            
            # Extract key information
            transcription = {
                "text": result["text"].strip(),
                "language": result.get("language", "unknown"),
                "confidence": self._calculate_confidence(result),
                "segments": result.get("segments", []),
                "duration": self._get_audio_duration(audio_path),
                "error": None
            }
            
            logger.info(f"Transcribed '{audio_path}': {transcription['text'][:100]}...")
            return transcription
            
        except Exception as e:
            logger.error(f"Transcription failed for '{audio_path}': {e}")
            return {
                "text": "Sorry, I couldn't understand the audio.",
                "language": "unknown",
                "confidence": 0.0,
                "segments": [],
                "error": str(e)
            }
    
    async def transcribe_bytes(self, audio_bytes: bytes, format: str = "wav") -> dict:
        """
        Transcribe audio from byte data
        
        Args:
            audio_bytes: Raw audio data
            format: Audio format (wav, mp3, etc.)
            
        Returns:
            Transcription results
        """
        try:
            # Save bytes to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as tmp_file:
                tmp_file.write(audio_bytes)
                tmp_path = tmp_file.name
            
            # Transcribe the temporary file
            result = await self.transcribe_file(tmp_path)
            
            # Clean up
            try:
                os.unlink(tmp_path)
            except:
                pass
            
            return result
            
        except Exception as e:
            logger.error(f"Byte transcription failed: {e}")
            return {
                "text": "Audio processing error",
                "error": str(e)
            }
    
    def _calculate_confidence(self, whisper_result: dict) -> float:
        """Calculate average confidence from Whisper segments"""
        try:
            segments = whisper_result.get("segments", [])
            if not segments:
                return 0.8  # Default confidence for successful transcription
            
            # Average the confidence scores from segments
            confidences = []
            for segment in segments:
                # Whisper doesn't provide direct confidence, estimate from other metrics
                avg_logprob = segment.get("avg_logprob", -1.0)
                # Convert log probability to confidence (rough approximation)
                confidence = max(0.0, min(1.0, (avg_logprob + 1.0)))
                confidences.append(confidence)
            
            return sum(confidences) / len(confidences) if confidences else 0.8
            
        except:
            return 0.8  # Default confidence
    
    def _get_audio_duration(self, audio_path: str) -> float:
        """Get duration of audio file in seconds"""
        try:
            if librosa:
                duration = librosa.get_duration(path=audio_path)
                return duration
            else:
                # Fallback using wave for WAV files
                with wave.open(audio_path, 'rb') as wav_file:
                    frames = wav_file.getnframes()
                    rate = wav_file.getframerate()
                    return frames / float(rate)
        except:
            return 0.0
    
    async def is_speech_detected(self, audio_path: str, threshold: float = 0.1) -> bool:
        """
        Simple voice activity detection
        
        Args:
            audio_path: Path to audio file
            threshold: Energy threshold for speech detection
            
        Returns:
            True if speech is detected, False otherwise
        """
        try:
            if not librosa:
                return True  # Assume speech if we can't check
                
            # Load audio
            audio, sr = librosa.load(audio_path)
            
            # Calculate RMS energy
            rms = librosa.feature.rms(y=audio)[0]
            avg_energy = np.mean(rms)
            
            return avg_energy > threshold
            
        except Exception as e:
            logger.error(f"Voice activity detection failed: {e}")
            return True  # Assume speech on error
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model"""
        return {
            "model_size": self.model_size,
            "device": self.device,
            "is_loaded": self.is_loaded,
            "available": whisper is not None
        }

# Convenience functions for quick use
async def transcribe_audio(audio_path: str, model_size: str = "base") -> str:
    """Quick transcription function"""
    voice_input = VoiceInput(model_size=model_size)
    result = await voice_input.transcribe_file(audio_path)
    return result.get("text", "Transcription failed")

async def transcribe_audio_detailed(audio_path: str, model_size: str = "base") -> dict:
    """Detailed transcription with metadata"""
    voice_input = VoiceInput(model_size=model_size)
    return await voice_input.transcribe_file(audio_path)

# Mock implementation for testing without Whisper
class MockVoiceInput:
    """Mock voice input for testing purposes"""
    
    def __init__(self, *args, **kwargs):
        self.is_loaded = True
    
    async def load_model(self):
        return True
    
    async def transcribe_file(self, audio_path: str, language: Optional[str] = None) -> dict:
        # Generate mock transcription based on file name or timestamp
        mock_phrases = [
            "Hello Tomoo, I need help finding a job.",
            "Can you help me with my resume?",
            "What job opportunities are available?",
            "I'm looking for work in technology.",
            "Please show me the latest job postings.",
            "How can I improve my job search?"
        ]
        
        import random
        text = random.choice(mock_phrases)
        
        return {
            "text": text,
            "language": "en",
            "confidence": 0.95,
            "segments": [{"text": text, "start": 0.0, "end": 2.0}],
            "duration": 2.0,
            "error": None
        }
    
    async def transcribe_bytes(self, audio_bytes: bytes, format: str = "wav") -> dict:
        return await self.transcribe_file("mock_audio.wav")
    
    def get_model_info(self) -> dict:
        return {
            "model_size": "mock",
            "device": "cpu",
            "is_loaded": True,
            "available": True
        }

# Use mock if real libraries aren't available
if not whisper:
    VoiceInput = MockVoiceInput
    logger.info("Using mock voice input (Whisper not available)")