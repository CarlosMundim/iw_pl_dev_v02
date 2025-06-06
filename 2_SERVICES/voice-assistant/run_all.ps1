# Tomoo AI Concierge - Windows PowerShell Launcher
# Starts both FastAPI backend and Electron frontend

Write-Host "🤖 Starting Tomoo AI Concierge..." -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Kill any existing processes
Write-Host "Stopping existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*python*" -and $_.CommandLine -like "*uvicorn*main:app*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process | Where-Object {$_.ProcessName -like "*electron*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Create necessary directories
New-Item -ItemType Directory -Force -Path "models", "logs", "audio" | Out-Null

# Set environment variables
$env:VOICE_ASSISTANT_PORT = "8005"
$env:NODE_ENV = "development"

# Function to start backend
function Start-Backend {
    Write-Host "🔧 Starting FastAPI backend..." -ForegroundColor Green
    Set-Location backend
    
    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
        python -m venv venv
    }
    
    # Activate virtual environment
    if (Test-Path "venv\Scripts\Activate.ps1") {
        & "venv\Scripts\Activate.ps1"
    } else {
        Write-Host "❌ Failed to activate virtual environment" -ForegroundColor Red
        exit 1
    }
    
    # Install/update dependencies
    Write-Host "Installing Python dependencies..." -ForegroundColor Yellow
    pip install -r ..\requirements.txt
    
    # Start FastAPI server
    Write-Host "Starting Tomoo AI backend on port $env:VOICE_ASSISTANT_PORT..." -ForegroundColor Green
    $backendJob = Start-Job -ScriptBlock {
        param($port)
        Set-Location $using:PWD
        python -m uvicorn main:app --host 0.0.0.0 --port $port --reload
    } -ArgumentList $env:VOICE_ASSISTANT_PORT
    
    Set-Location ..
    Write-Host "✅ Backend started (Job ID: $($backendJob.Id))" -ForegroundColor Green
    return $backendJob
}

# Function to start frontend
function Start-Frontend {
    Write-Host "🎨 Starting Electron frontend..." -ForegroundColor Green
    Set-Location frontend
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing Node.js dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Wait for backend to be ready
    Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$env:VOICE_ASSISTANT_PORT/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend is ready!" -ForegroundColor Green
                break
            }
        } catch {
            # Backend not ready yet
        }
        Write-Host "Waiting... ($i/30)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
    
    # Start Electron app
    Write-Host "Starting Tomoo AI frontend..." -ForegroundColor Green
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location $using:PWD
        npm run dev
    }
    
    Set-Location ..
    Write-Host "✅ Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor Green
    return $frontendJob
}

# Function to handle cleanup
function Stop-Services {
    param($backendJob, $frontendJob)
    
    Write-Host ""
    Write-Host "🛑 Shutting down Tomoo AI Concierge..." -ForegroundColor Red
    
    if ($backendJob) {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
    }
    
    if ($frontendJob) {
        Stop-Job $frontendJob -ErrorAction SilentlyContinue
        Remove-Job $frontendJob -ErrorAction SilentlyContinue
    }
    
    # Kill any remaining processes
    Get-Process | Where-Object {$_.ProcessName -like "*python*" -and $_.CommandLine -like "*uvicorn*main:app*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process | Where-Object {$_.ProcessName -like "*electron*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python 3 is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Prerequisites check passed" -ForegroundColor Green

# Start services
try {
    $backendJob = Start-Backend
    Start-Sleep -Seconds 3
    $frontendJob = Start-Frontend
    
    Write-Host ""
    Write-Host "🚀 Tomoo AI Concierge is now running!" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "Backend:  http://localhost:$env:VOICE_ASSISTANT_PORT" -ForegroundColor White
    Write-Host "Frontend: Electron app should open automatically" -ForegroundColor White
    Write-Host "API Docs: http://localhost:$env:VOICE_ASSISTANT_PORT/docs" -ForegroundColor White
    Write-Host ""
    Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
    
    # Wait for user interrupt
    try {
        while ($true) {
            Start-Sleep -Seconds 1
            
            # Check if jobs are still running
            if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
                Write-Host "❌ One or more services failed" -ForegroundColor Red
                break
            }
        }
    } catch {
        # User pressed Ctrl+C
    }
} finally {
    Stop-Services -backendJob $backendJob -frontendJob $frontendJob
}