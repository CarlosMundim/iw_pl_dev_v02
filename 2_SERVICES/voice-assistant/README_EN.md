# Tomoo AI Concierge - Voice Assistant Service

## Overview

Tomoo is an intelligent AI voice concierge for the iWORKZ platform, providing voice-enabled job search assistance, career guidance, and platform navigation. Built with FastAPI backend and Electron desktop frontend, featuring Whisper speech-to-text, Coqui text-to-speech, and optional local LLM support.

## Tech Stack

* **Backend**: FastAPI (Python 3.11+)
* **Frontend**: Electron (Node.js 18+)
* **Speech Recognition**: OpenAI Whisper
* **Text-to-Speech**: Coqui TTS
* **LLM**: llama.cpp (optional local models)
* **Audio Processing**: librosa, soundfile, PyAudio
* **Real-time**: WebSocket, WebRTC

## Development Setup

```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get install portaudio19-dev python3-pyaudio

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start voice service
uvicorn main:app --reload --port 8003

# Test voice endpoints
python test_voice.py
```

## Core Features

### Speech Recognition

* Real-time speech-to-text conversion
* Multiple language support
* Noise reduction and audio preprocessing
* Speaker identification and diarization

### Text-to-Speech

* Natural-sounding voice synthesis
* Multiple voice options
* SSML support for advanced control
* Emotional tone adjustment

### Natural Language Understanding

* Intent recognition and classification
* Entity extraction from speech
* Context-aware conversation handling
* Multi-turn dialog management

### Voice Commands

* Job search by voice
* Profile updates via speech
* Interview scheduling
* Application status inquiries

## API Endpoints

```python
POST /voice/transcribe        # Speech-to-text
POST /voice/synthesize        # Text-to-speech
POST /voice/process-command   # Voice command processing
WS   /voice/stream           # Real-time voice streaming
GET  /voice/supported-languages
POST /voice/train-model      # Custom voice model training
```

## Audio Processing Pipeline

1. **Audio Capture**: Microphone input or file upload
2. **Preprocessing**: Noise reduction, normalization
3. **Speech Recognition**: Convert audio to text
4. **NLU Processing**: Extract intent and entities
5. **Business Logic**: Process user request
6. **Response Generation**: Create appropriate response
7. **TTS Synthesis**: Convert response to speech
8. **Audio Delivery**: Send audio back to user

## Supported Languages

* English (US, UK, AU)
* Spanish (ES, MX, AR)
* Portuguese (BR, PT)
* French (FR, CA)
* German (DE)
* Italian (IT)
* Japanese (JP)
* Chinese (CN, TW)

## Integration Points

* **Backend API**: User authentication and data
* **AI Agent**: Natural language processing
* **Frontend**: WebRTC audio streaming
* **Mobile App**: Native voice integration
* **Notification Service**: Voice alerts

## Configuration

```bash
# Speech Services
OPENAI_API_KEY=your-openai-key
GOOGLE_SPEECH_API_KEY=your-google-key
ELEVENLABS_API_KEY=your-elevenlabs-key
AZURE_SPEECH_KEY=your-azure-key

# Audio Settings
SAMPLE_RATE=16000
AUDIO_FORMAT=wav
MAX_RECORDING_DURATION=300

# NLU Configuration
RASA_MODEL_PATH=/app/models/rasa
SPACY_MODEL=en_core_web_sm
```
