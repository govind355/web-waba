
const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true, // Allows us to detect 'process' in React to know we are in Electron
      contextIsolation: false,
      webviewTag: true,
      webSecurity: false // Often helps with local dev CORS issues
    },
    title: "WhatsAI Companion",
    backgroundColor: '#d1d7db',
    autoHideMenuBar: true
  });

  // 1. Intercept headers to bypass X-Frame-Options
  const filter = {
    urls: ['*://*.whatsapp.com/*', '*://*.whatsapp.net/*']
  };

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const responseHeaders = Object.assign({}, details.responseHeaders);
    // Delete headers that block iframing
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-security-policy'];
    callback({ cancel: false, responseHeaders });
  });

  // 2. Spoof User Agent (Essential for WhatsApp Web)
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  session.defaultSession.setUserAgent(userAgent);

  // 3. Load the React App
  // Note: Ensure your React app is running on port 3000!
  // If you are building for production, use mainWindow.loadFile...
  mainWindow.loadURL('http://localhost:3000');

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
