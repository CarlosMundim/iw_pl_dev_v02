# PowerShell Setup Guide

## Install PowerShell Core
Download from: https://github.com/PowerShell/PowerShell/releases

## Windows Terminal Setup
1. Install Windows Terminal from Microsoft Store
2. Set PowerShell as default profile
3. Configure appearance and keyboard shortcuts

## Essential PowerShell Modules
```powershell
# Install PowerShell modules
Install-Module -Name PSReadLine -Force
Install-Module -Name Terminal-Icons -Force
Install-Module -Name z -Force

# Docker management
Install-Module -Name DockerMsftProvider -Force
```

## Profile Configuration
Create PowerShell profile:
```powershell
# Check if profile exists
Test-Path $PROFILE

# Create profile if it doesn't exist
if (!(Test-Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force
}

# Edit profile
notepad $PROFILE
```

Add to profile:
```powershell
# Import modules
Import-Module Terminal-Icons
Import-Module z

# Set PSReadLine options
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle ListView

# Aliases
Set-Alias -Name ll -Value Get-ChildItem
Set-Alias -Name grep -Value Select-String

# Functions
function Get-GitStatus { git status }
Set-Alias -Name gs -Value Get-GitStatus
```

## WSL Integration
```powershell
# Access WSL from PowerShell
wsl

# Run Linux commands from PowerShell
wsl ls -la
wsl git status
```