# PowerShell Setup Guide

This guide explains how to install and configure PowerShell Core, set up Windows Terminal, add useful modules, and customise your profile for a modern iWORKZ developer experience.

---

## Install PowerShell Core

* Download from the official releases: [https://github.com/PowerShell/PowerShell/releases](https://github.com/PowerShell/PowerShell/releases)
* Follow the instructions for Windows installation.

---

## Windows Terminal Setup

1. Install Windows Terminal from the Microsoft Store.
2. Open Windows Terminal, click the down arrow > Settings.
3. Set PowerShell (PowerShell Core) as the default profile.
4. Customise appearance and keyboard shortcuts as preferred.

---

## Essential PowerShell Modules

Install these modules for enhanced productivity:

```powershell
# Command-line usability
Install-Module -Name PSReadLine -Force
Install-Module -Name Terminal-Icons -Force
Install-Module -Name z -Force

# Docker management
Install-Module -Name DockerMsftProvider -Force
```

---

## Profile Configuration

Create or edit your PowerShell profile for custom aliases and functions:

```powershell
# Check if profile exists
Test-Path $PROFILE

# Create the profile file if it doesn't exist
if (!(Test-Path $PROFILE)) {
    New-Item -Type File -Path $PROFILE -Force
}

# Edit your profile
notepad $PROFILE
```

Add the following to your profile for a better developer experience:

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

---

## WSL Integration

Access WSL and Linux commands directly from PowerShell:

```powershell
# Start WSL shell
wsl

# Run Linux commands from PowerShell
wsl ls -la
wsl git status
```

---

> **Tip:** For the best experience, always keep PowerShell, Windows Terminal, and all modules up to date.
