#!/bin/bash

# Tomoo AI Concierge - Development Launcher
# Starts both FastAPI backend and Electron frontend

echo "🤖 Starting Tomoo AI Concierge..."
echo "================================="

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "uvicorn.*main:app" 2>/dev/null || true
pkill -f "electron.*tomoo" 2>/dev/null || true

# Create necessary directories
mkdir -p models logs audio

# Set environment variables
export VOICE_ASSISTANT_PORT=8005
export NODE_ENV=development

# Function to start backend
start_backend() {
    echo "🔧 Starting FastAPI backend..."
    cd backend
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Install/update dependencies
    echo "Installing Python dependencies..."
    pip install -r ../requirements.txt
    
    # Start FastAPI server
    echo "Starting Tomoo AI backend on port $VOICE_ASSISTANT_PORT..."
    python -m uvicorn main:app --host 0.0.0.0 --port $VOICE_ASSISTANT_PORT --reload &
    BACKEND_PID=$!
    
    cd ..
    echo "✅ Backend started (PID: $BACKEND_PID)"
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Electron frontend..."
    cd frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing Node.js dependencies..."
        npm install
    fi
    
    # Wait for backend to be ready
    echo "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:$VOICE_ASSISTANT_PORT/health > /dev/null 2>&1; then
            echo "✅ Backend is ready!"
            break
        fi
        echo "Waiting... ($i/30)"
        sleep 2
    done
    
    # Start Electron app
    echo "Starting Tomoo AI frontend..."
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    echo "✅ Frontend started (PID: $FRONTEND_PID)"
}

# Function to handle cleanup
cleanup() {
    echo ""
    echo "🛑 Shutting down Tomoo AI Concierge..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    pkill -f "electron.*tomoo" 2>/dev/null || true
    
    echo "✅ Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check prerequisites
echo "Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Start services
start_backend
sleep 3
start_frontend

echo ""
echo "🚀 Tomoo AI Concierge is now running!"
echo "================================="
echo "Backend:  http://localhost:$VOICE_ASSISTANT_PORT"
echo "Frontend: Electron app should open automatically"
echo "API Docs: http://localhost:$VOICE_ASSISTANT_PORT/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
wait