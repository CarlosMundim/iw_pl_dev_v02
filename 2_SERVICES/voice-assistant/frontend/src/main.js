/**
 * Tomoo AI Concierge - Electron Main Process
 * Desktop voice assistant interface for iWORKZ platform
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;
let apiServerProcess = null;

const isDev = process.env.NODE_ENV === 'development';
const BACKEND_PORT = process.env.VOICE_ASSISTANT_PORT || 8005;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false // Allow local file access for development
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const indexPath = path.join(__dirname, '../index.html');
  mainWindow.loadFile(indexPath);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Clean up API server process if running
  if (apiServerProcess) {
    apiServerProcess.kill();
  }
});

// IPC handlers for voice assistant functionality

ipcMain.handle('start-backend-server', async () => {
  try {
    const { spawn } = require('child_process');
    const backendPath = path.join(__dirname, '../../backend');
    
    // Start FastAPI server
    apiServerProcess = spawn('python', ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', BACKEND_PORT, '--reload'], {
      cwd: backendPath,
      stdio: 'pipe'
    });

    apiServerProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    apiServerProcess.stderr.on('data', (data) => {
      console.error(`Backend error: ${data}`);
    });

    return { success: true, port: BACKEND_PORT };
  } catch (error) {
    console.error('Failed to start backend server:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-backend-status', async () => {
  try {
    const axios = require('axios');
    const response = await axios.get(`http://localhost:${BACKEND_PORT}/health`);
    return { running: true, data: response.data };
  } catch (error) {
    return { running: false, error: error.message };
  }
});

ipcMain.handle('get-microphone-permissions', async () => {
  try {
    // Check if we have microphone permissions
    const hasPermission = await mainWindow.webContents.session.getUserMedia({
      audio: true
    });
    return { granted: true };
  } catch (error) {
    return { granted: false, error: error.message };
  }
});

ipcMain.handle('save-audio-file', async (event, audioBuffer, filename) => {
  try {
    const audioDir = path.join(__dirname, '../../audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const filePath = path.join(audioDir, filename);
    fs.writeFileSync(filePath, Buffer.from(audioBuffer));
    
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Failed to save audio file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('play-audio-file', async (event, audioPath) => {
  try {
    // Send message to renderer to play audio
    mainWindow.webContents.send('play-audio', audioPath);
    return { success: true };
  } catch (error) {
    console.error('Failed to play audio:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('show-error-dialog', async (event, title, content) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'error',
    title: title,
    message: content,
    buttons: ['OK']
  });
  return result;
});

ipcMain.handle('show-info-dialog', async (event, title, content) => {
  const result = await dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: title,
    message: content,
    buttons: ['OK']
  });
  return result;
});

ipcMain.handle('open-external-link', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Development helpers
if (isDev) {
  // Enable live reload for Electron in development
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit'
  });
}

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Auto-updater for production builds
if (!isDev) {
  const { autoUpdater } = require('electron-updater');
  
  autoUpdater.checkForUpdatesAndNotify();
  
  autoUpdater.on('update-available', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update available',
      message: 'A new version of Tomoo is available. It will be downloaded in the background.',
      buttons: ['OK']
    });
  });
}