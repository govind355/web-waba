
const { app, BrowserWindow, session, shell } = require('electron');
const path = require('path');

function createWindow() {
  // 1. Create the browser window with native look
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // For simple IPC in this demo
      webviewTag: true, // Enable <webview> tag if you prefer that over <iframe>
    },
    title: "WhatsAI Companion",
    backgroundColor: '#d1d7db'
  });

  // 2. THE MAGIC: Intercept headers to bypass X-Frame-Options
  // This allows web.whatsapp.com to load inside an iframe
  const filter = {
    urls: ['*://*.whatsapp.com/*', '*://*.whatsapp.net/*']
  };

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
    const responseHeaders = Object.assign({}, details.responseHeaders);
    
    // Remove the security headers that block iframes
    delete responseHeaders['x-frame-options'];
    delete responseHeaders['content-security-policy']; // sometimes needed
    
    callback({
      cancel: false,
      responseHeaders: responseHeaders,
    });
  });

  // 3. Spoof User Agent
  // WhatsApp checks this to ensure it's a "supported browser"
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  session.defaultSession.setUserAgent(userAgent);

  // Load your React App (assuming it's running on localhost:3000 or built file)
  // In production, load the built index.html
  // mainWindow.loadFile('dist/index.html');
  mainWindow.loadURL('http://localhost:3000');

  // Open external links (like "Help") in default browser, not inside the app
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
