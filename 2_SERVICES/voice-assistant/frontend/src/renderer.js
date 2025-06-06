/**
 * Tomoo AI Concierge - Electron Renderer Process
 * Frontend JavaScript for voice and chat interactions
 */

const { ipcRenderer } = require('electron');
const axios = require('axios');

class TomooVoiceInterface {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.backendUrl = 'http://localhost:8005';
        this.conversationId = this.generateConversationId();
        
        this.initializeElements();
        this.initializeEventListeners();
        this.checkBackendConnection();
    }

    initializeElements() {
        // Voice controls
        this.recordBtn = document.getElementById('recordBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.voiceVisualizer = document.getElementById('voiceVisualizer');
        this.voiceLoading = document.getElementById('voiceLoading');
        this.transcriptArea = document.getElementById('transcriptArea');
        this.transcriptText = document.getElementById('transcriptText');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.responseAudio = document.getElementById('responseAudio');

        // Chat controls
        this.chatMessages = document.getElementById('chatMessages');
        this.chatInput = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatLoading = document.getElementById('chatLoading');

        // Status indicators
        this.connectionStatus = document.getElementById('connectionStatus');
        this.statusText = document.getElementById('statusText');
    }

    initializeEventListeners() {
        // Voice controls
        this.recordBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());

        // Chat controls
        this.sendBtn.addEventListener('click', () => this.sendTextMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendTextMessage();
            }
        });

        // Auto-focus chat input
        this.chatInput.addEventListener('focus', () => {
            this.chatInput.style.borderColor = '#667eea';
        });

        this.chatInput.addEventListener('blur', () => {
            this.chatInput.style.borderColor = '#e5e7eb';
        });

        // IPC listeners
        ipcRenderer.on('play-audio', (event, audioPath) => {
            this.playAudioFile(audioPath);
        });
    }

    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async checkBackendConnection() {
        try {
            // Try to connect to backend
            const response = await axios.get(`${this.backendUrl}/health`, { timeout: 5000 });
            
            if (response.data && response.data.status === 'healthy') {
                this.updateConnectionStatus('connected', 'Connected to Tomoo AI');
                this.recordBtn.disabled = false;
                await this.requestMicrophonePermission();
            } else {
                throw new Error('Backend unhealthy');
            }
        } catch (error) {
            console.log('Backend not available, attempting to start...');
            await this.startBackendServer();
        }
    }

    async startBackendServer() {
        try {
            this.updateConnectionStatus('connecting', 'Starting Tomoo AI server...');
            
            const result = await ipcRenderer.invoke('start-backend-server');
            
            if (result.success) {
                // Wait a moment for server to start
                setTimeout(async () => {
                    await this.checkBackendConnection();
                }, 3000);
            } else {
                this.updateConnectionStatus('error', 'Failed to start AI server');
                this.showErrorMessage('Could not start Tomoo AI server', result.error);
            }
        } catch (error) {
            this.updateConnectionStatus('error', 'Connection failed');
            this.showErrorMessage('Connection Error', error.message);
        }
    }

    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // We have permission, stop the stream for now
            stream.getTracks().forEach(track => track.stop());
            
            this.updateConnectionStatus('ready', 'Ready for voice interaction');
            return true;
        } catch (error) {
            console.error('Microphone permission denied:', error);
            this.updateConnectionStatus('warning', 'Microphone access required');
            this.showErrorMessage('Microphone Permission', 'Please allow microphone access to use voice features.');
            return false;
        }
    }

    updateConnectionStatus(status, message) {
        this.statusText.textContent = message;
        
        // Update status dot color
        this.connectionStatus.className = 'status-dot';
        switch (status) {
            case 'connected':
            case 'ready':
                this.connectionStatus.classList.add('connected');
                break;
            case 'connecting':
                this.connectionStatus.classList.add('warning');
                break;
            case 'error':
                this.connectionStatus.classList.add('error');
                break;
        }
    }

    async startRecording() {
        try {
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.audioChunks = [];
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                this.processRecording();
            };

            // Start recording
            this.mediaRecorder.start(1000); // Collect data every second
            this.isRecording = true;

            // Update UI
            this.recordBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.voiceVisualizer.classList.add('active');
            this.recordBtn.textContent = '🎤 Recording...';

            this.updateConnectionStatus('recording', 'Listening...');

        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showErrorMessage('Recording Error', 'Could not access microphone: ' + error.message);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // Update UI
            this.recordBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.voiceVisualizer.classList.remove('active');
            this.recordBtn.textContent = '🎤 Start Recording';

            this.updateConnectionStatus('processing', 'Processing audio...');
        }
    }

    async processRecording() {
        try {
            this.voiceLoading.classList.add('show');
            this.hideTranscriptAndAudio();

            // Create blob from audio chunks
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
            
            // Convert to WAV for better compatibility
            const wavBlob = await this.convertToWav(audioBlob);
            
            // Send to backend for processing
            const formData = new FormData();
            formData.append('audio', wavBlob, 'recording.wav');

            const response = await axios.post(`${this.backendUrl}/voice`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000 // 30 second timeout
            });

            const result = response.data;

            // Display transcript
            if (result.transcript) {
                this.showTranscript(result.transcript);
                this.addChatMessage('user', result.transcript);
            }

            // Display response
            if (result.response) {
                this.addChatMessage('assistant', result.response);
            }

            // Play audio response
            if (result.audio_url) {
                await this.playAudioResponse(result.audio_url);
            }

            this.updateConnectionStatus('ready', 'Ready for voice interaction');

        } catch (error) {
            console.error('Voice processing failed:', error);
            this.showErrorMessage('Processing Error', 'Could not process your voice input: ' + error.message);
            this.updateConnectionStatus('ready', 'Ready for voice interaction');
        } finally {
            this.voiceLoading.classList.remove('show');
        }
    }

    async convertToWav(audioBlob) {
        // For now, return the original blob
        // In a production app, you might want to convert webm to wav
        return audioBlob;
    }

    showTranscript(text) {
        this.transcriptText.textContent = text;
        this.transcriptArea.style.display = 'block';
    }

    async playAudioResponse(audioUrl) {
        try {
            const fullUrl = `${this.backendUrl}${audioUrl}`;
            this.responseAudio.src = fullUrl;
            this.audioPlayer.style.display = 'block';

            // Auto-play the response
            setTimeout(() => {
                this.responseAudio.play().catch(e => {
                    console.log('Auto-play prevented, user interaction required');
                });
            }, 500);

        } catch (error) {
            console.error('Failed to play audio response:', error);
        }
    }

    hideTranscriptAndAudio() {
        this.transcriptArea.style.display = 'none';
        this.audioPlayer.style.display = 'none';
    }

    async sendTextMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        try {
            // Clear input and add user message
            this.chatInput.value = '';
            this.addChatMessage('user', message);
            
            // Show loading
            this.chatLoading.classList.add('show');
            this.sendBtn.disabled = true;

            // Send to backend
            const response = await axios.post(`${this.backendUrl}/chat`, {
                message: message,
                conversation_id: this.conversationId
            });

            const result = response.data;

            // Add assistant response
            if (result.response) {
                this.addChatMessage('assistant', result.response);
            }

        } catch (error) {
            console.error('Chat failed:', error);
            this.addChatMessage('assistant', 'Sorry, I encountered an error processing your message. Please try again.');
        } finally {
            this.chatLoading.classList.remove('show');
            this.sendBtn.disabled = false;
            this.chatInput.focus();
        }
    }

    addChatMessage(sender, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        const contentDiv = document.createElement('div');
        contentDiv.textContent = content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString();

        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async showErrorMessage(title, content) {
        await ipcRenderer.invoke('show-error-dialog', title, content);
    }

    async playAudioFile(audioPath) {
        try {
            const audio = new Audio(audioPath);
            await audio.play();
        } catch (error) {
            console.error('Failed to play audio file:', error);
        }
    }
}

// Initialize the interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tomooInterface = new TomooVoiceInterface();
});

// Handle window focus/blur for better UX
window.addEventListener('focus', () => {
    if (window.tomooInterface && window.tomooInterface.chatInput) {
        window.tomooInterface.chatInput.focus();
    }
});

// Prevent context menu in production
document.addEventListener('contextmenu', (e) => {
    if (process.env.NODE_ENV !== 'development') {
        e.preventDefault();
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});