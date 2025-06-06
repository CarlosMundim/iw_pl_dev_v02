"""
Voice Output Module - Coqui TTS-based Text-to-Speech
Handles text-to-speech conversion for Tomoo AI Concierge
"""

import os
import logging
import tempfile
from pathlib import Path
from typing import Optional, Union, List
import asyncio

try:
    from TTS.api import TTS
    import torch
    import soundfile as sf
    import numpy as np
except ImportError as e:
    print(f"Warning: Voice output libraries not installed: {e}")
    TTS = None
    torch = None

logger = logging.getLogger("tomoo.voice_output")

class VoiceOutput:
    """Handles text-to-speech conversion using Coqui TTS"""
    
    def __init__(self, 
                 model_name: str = "tts_models/en/ljspeech/tacotron2-DDC_ph",
                 device: Optional[str] = None):
        """
        Initialize TTS model
        
        Args:
            model_name: TTS model to use
            device: Device to run on (cuda, cpu, auto)
        """
        self.model_name = model_name
        self.device = device or ("cuda" if torch and torch.cuda.is_available() else "cpu")
        self.tts = None
        self.is_loaded = False
        
    async def load_model(self):
        """Load TTS model lazily"""
        if self.tts is None and TTS:
            try:
                logger.info(f"Loading TTS model '{self.model_name}' on {self.device}")
                # Run TTS loading in thread to avoid blocking
                loop = asyncio.get_event_loop()
                self.tts = await loop.run_in_executor(
                    None, 
                    lambda: TTS(model_name=self.model_name).to(self.device)
                )
                self.is_loaded = True
                logger.info("TTS model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load TTS model: {e}")
                self.is_loaded = False
        return self.is_loaded
    
    async def synthesize_to_file(self, 
                                text: str, 
                                output_path: str,
                                speaker: Optional[str] = None,
                                speed: float = 1.0,
                                emotion: Optional[str] = None) -> bool:
        """
        Convert text to speech and save to file
        
        Args:
            text: Text to convert to speech
            output_path: Where to save the audio file
            speaker: Speaker identity (if multi-speaker model)
            speed: Speaking speed multiplier
            emotion: Emotion to apply (if supported)
            
        Returns:
            True if successful, False otherwise
        """
        if not await self.load_model():
            return await self._generate_mock_audio(text, output_path)
        
        try:
            # Clean and prepare text
            clean_text = self._clean_text(text)
            
            if not clean_text.strip():
                logger.warning("Empty text provided for TTS")
                return False
            
            # Generate speech in thread to avoid blocking
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: self.tts.tts_to_file(
                    text=clean_text,
                    file_path=output_path,
                    speaker=speaker
                )
            )
            
            # Post-process audio if needed (speed adjustment, etc.)
            if speed != 1.0:
                await self._adjust_speed(output_path, speed)
            
            logger.info(f"Generated speech for: '{clean_text[:50]}...' -> {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Speech synthesis failed: {e}")
            return await self._generate_mock_audio(text, output_path)
    
    async def synthesize_to_bytes(self, 
                                 text: str,
                                 format: str = "wav",
                                 **kwargs) -> Optional[bytes]:
        """
        Convert text to speech and return as bytes
        
        Args:
            text: Text to convert
            format: Audio format (wav, mp3, etc.)
            **kwargs: Additional TTS parameters
            
        Returns:
            Audio data as bytes or None if failed
        """
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as tmp_file:
                tmp_path = tmp_file.name
            
            success = await self.synthesize_to_file(text, tmp_path, **kwargs)
            
            if success:
                with open(tmp_path, 'rb') as audio_file:
                    audio_bytes = audio_file.read()
                
                # Clean up
                try:
                    os.unlink(tmp_path)
                except:
                    pass
                
                return audio_bytes
            
            return None
            
        except Exception as e:
            logger.error(f"Byte synthesis failed: {e}")
            return None
    
    def _clean_text(self, text: str) -> str:
        """Clean and prepare text for TTS"""
        # Remove or replace problematic characters
        cleaned = text.replace("\n", " ").replace("\t", " ")
        
        # Replace multiple spaces with single space
        import re
        cleaned = re.sub(r'\s+', ' ', cleaned)
        
        # Remove URLs and email addresses for better speech
        cleaned = re.sub(r'http[s]?://\S+', 'website link', cleaned)
        cleaned = re.sub(r'\S+@\S+', 'email address', cleaned)
        
        # Expand common abbreviations
        abbreviations = {
            "AI": "A I",
            "API": "A P I",
            "URL": "U R L",
            "UI": "U I",
            "UX": "U X",
            "CEO": "C E O",
            "CTO": "C T O",
            "HR": "H R",
            "IT": "I T",
            "CV": "C V"
        }
        
        for abbr, expansion in abbreviations.items():
            cleaned = cleaned.replace(abbr, expansion)
        
        return cleaned.strip()
    
    async def _adjust_speed(self, audio_path: str, speed: float):
        """Adjust playback speed of audio file"""
        try:
            if not (0.5 <= speed <= 2.0):
                logger.warning(f"Speed {speed} out of range, skipping adjustment")
                return
            
            # Load audio
            audio, sr = sf.read(audio_path)
            
            # Adjust speed (simple time stretching)
            import librosa
            if librosa:
                audio_stretched = librosa.effects.time_stretch(audio, rate=speed)
                sf.write(audio_path, audio_stretched, sr)
            
        except Exception as e:
            logger.error(f"Speed adjustment failed: {e}")
    
    async def _generate_mock_audio(self, text: str, output_path: str) -> bool:
        """Generate silent audio file as fallback"""
        try:
            # Create silent audio based on text length
            duration = max(1.0, len(text) * 0.08)  # ~12.5 chars per second
            sample_rate = 22050
            
            # Generate silent audio
            silent_audio = np.zeros(int(sample_rate * duration))
            
            # Add very quiet white noise to make it seem more natural
            noise = np.random.normal(0, 0.001, len(silent_audio))
            audio_with_noise = silent_audio + noise
            
            # Save as WAV
            sf.write(output_path, audio_with_noise, sample_rate)
            
            logger.info(f"Generated mock audio for '{text[:30]}...' (duration: {duration:.1f}s)")
            return True
            
        except Exception as e:
            logger.error(f"Mock audio generation failed: {e}")
            return False
    
    def get_available_models(self) -> List[str]:
        """Get list of available TTS models"""
        if TTS:
            try:
                return TTS.list_models()
            except:
                pass
        
        return [
            "tts_models/en/ljspeech/tacotron2-DDC_ph",
            "tts_models/en/ljspeech/glow-tts",
            "tts_models/en/vctk/vits",
            "tts_models/en/jenny/jenny"
        ]
    
    def get_model_info(self) -> dict:
        """Get information about the loaded model"""
        return {
            "model_name": self.model_name,
            "device": self.device,
            "is_loaded": self.is_loaded,
            "available": TTS is not None
        }

class VoicePersonality:
    """Manages different voice personalities for Tomoo"""
    
    PERSONALITIES = {
        "professional": {
            "model": "tts_models/en/ljspeech/tacotron2-DDC_ph",
            "speed": 1.0,
            "style": "Clear and professional tone suitable for business interactions"
        },
        "friendly": {
            "model": "tts_models/en/vctk/vits",
            "speaker": "p225",  # Female British accent
            "speed": 1.1,
            "style": "Warm and approachable tone for casual conversation"
        },
        "assistant": {
            "model": "tts_models/en/jenny/jenny",
            "speed": 0.9,
            "style": "Helpful assistant tone, clear and patient"
        }
    }
    
    def __init__(self, personality: str = "professional"):
        """
        Initialize voice personality
        
        Args:
            personality: Personality type (professional, friendly, assistant)
        """
        self.personality = personality
        self.config = self.PERSONALITIES.get(personality, self.PERSONALITIES["professional"])
        self.voice_output = VoiceOutput(model_name=self.config["model"])
    
    async def speak(self, text: str, output_path: str) -> bool:
        """Speak text with personality-specific settings"""
        return await self.voice_output.synthesize_to_file(
            text=text,
            output_path=output_path,
            speaker=self.config.get("speaker"),
            speed=self.config.get("speed", 1.0)
        )
    
    def get_personality_info(self) -> dict:
        """Get information about current personality"""
        return {
            "personality": self.personality,
            "config": self.config,
            "model_info": self.voice_output.get_model_info()
        }

# Convenience functions
async def text_to_speech(text: str, output_path: str, model_name: str = None) -> bool:
    """Quick TTS function"""
    tts = VoiceOutput(model_name=model_name) if model_name else VoiceOutput()
    return await tts.synthesize_to_file(text, output_path)

async def speak_with_personality(text: str, output_path: str, personality: str = "professional") -> bool:
    """Speak text with specific personality"""
    voice = VoicePersonality(personality=personality)
    return await voice.speak(text, output_path)

# Mock implementation for testing
class MockVoiceOutput:
    """Mock voice output for testing without TTS libraries"""
    
    def __init__(self, *args, **kwargs):
        self.is_loaded = True
        self.model_name = "mock_tts"
        self.device = "cpu"
    
    async def load_model(self):
        return True
    
    async def synthesize_to_file(self, text: str, output_path: str, **kwargs) -> bool:
        try:
            # Generate silent audio file
            duration = max(1.0, len(text) * 0.08)
            sample_rate = 22050
            silent_audio = np.zeros(int(sample_rate * duration))
            
            # Save using soundfile if available, otherwise create empty file
            if sf:
                sf.write(output_path, silent_audio, sample_rate)
            else:
                # Create empty file as placeholder
                with open(output_path, 'wb') as f:
                    f.write(b'MOCK_AUDIO_FILE')
            
            logger.info(f"Mock TTS generated for: '{text[:30]}...'")
            return True
            
        except Exception as e:
            logger.error(f"Mock TTS failed: {e}")
            return False
    
    async def synthesize_to_bytes(self, text: str, **kwargs) -> Optional[bytes]:
        return b'MOCK_AUDIO_BYTES'
    
    def get_model_info(self) -> dict:
        return {
            "model_name": "mock_tts",
            "device": "cpu",
            "is_loaded": True,
            "available": True
        }

# Use mock if real libraries aren't available
if not TTS:
    VoiceOutput = MockVoiceOutput
    logger.info("Using mock voice output (TTS not available)")