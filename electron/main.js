// Sermon Note Clipper — Electron main process.
// Boots the local Python backend (which serves both the API and the built
// dashboard), then points a native window at it. The renderer is the same web
// app, so there is no proxy and no baked-in URL — everything is same-origin on
// a free local port.
const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const { getFreePort, startBackend, waitForBackend } = require('./backend');

const isDev = !app.isPackaged;
// In `npm run dev`, the Vite dev server URL is injected so we get hot reload.
const DEV_URL = process.env.SERMON_DEV_URL || '';

let mainWindow = null;
let backend = null;
let backendPort = 0;
let shuttingDown = false;

function logPath() {
  try {
    return path.join(app.getPath('userData'), 'backend.log');
  } catch {
    return path.join(require('os').tmpdir(), 'sermon-backend.log');
  }
}

let logStream = null;
function log(line) {
  const msg = `${line}\n`;
  process.stdout.write(msg);
  try {
    if (!logStream) logStream = fs.createWriteStream(logPath(), { flags: 'a' });
    logStream.write(msg);
  } catch {
    /* ignore logging errors */
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 940,
    minHeight: 640,
    backgroundColor: '#0c0c0e',
    titleBarStyle: 'hiddenInset',
    title: 'Sermon Note Clipper',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Open target=_blank / external links in the user's real browser, never in
  // a new Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (e, url) => {
    const sameOrigin = url.startsWith(`http://127.0.0.1:${backendPort}`) || (DEV_URL && url.startsWith(DEV_URL));
    if (!sameOrigin) {
      e.preventDefault();
      if (/^https?:\/\//.test(url)) shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Branded splash while the backend warms up.
  mainWindow.loadFile(path.join(__dirname, 'loading.html'));
}

async function boot() {
  createWindow();

  if (isDev && DEV_URL) {
    // Dev: backend started separately is fine, but we still launch it so the
    // app is self-contained. Vite serves the UI with hot reload.
    backendPort = await getFreePort();
    const started = startBackend(backendPort, log);
    backend = started.child;
    await waitForBackend(backendPort);
    if (mainWindow) mainWindow.loadURL(DEV_URL);
    return;
  }

  try {
    backendPort = await getFreePort();
    const started = startBackend(backendPort, log);
    backend = started.child;

    backend.on('exit', (code) => {
      if (!shuttingDown && code !== 0) {
        showBackendError(
          `The Sermon Note Clipper engine stopped unexpectedly (exit ${code}).\n\n` +
            `Check the log:\n${logPath()}`
        );
      }
    });

    const ready = await waitForBackend(backendPort);
    if (!ready) {
      showBackendError(
        'The Sermon Note Clipper engine did not start in time.\n\n' +
          'Make sure setup finished (run install.command once), then reopen the app.\n\n' +
          `Log: ${logPath()}`
      );
      return;
    }
    if (mainWindow) mainWindow.loadURL(`http://127.0.0.1:${backendPort}`);
  } catch (err) {
    showBackendError(`Could not start the engine:\n${err && err.message}`);
  }
}

function showBackendError(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    const html =
      'data:text/html,' +
      encodeURIComponent(
        `<body style="background:#0c0c0e;color:#e4e4e7;font:14px -apple-system,system-ui;padding:48px;line-height:1.6">
           <h2 style="color:#fff">Couldn't start Sermon Note Clipper</h2>
           <pre style="white-space:pre-wrap;color:#a1a1aa">${message.replace(/</g, '&lt;')}</pre>
         </body>`
      );
    mainWindow.loadURL(html);
    mainWindow.show();
  } else {
    dialog.showErrorBox('Sermon Note Clipper', message);
  }
}

function buildMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        {
          label: 'Get a free Gemini API key',
          click: () => shell.openExternal('https://aistudio.google.com/app/apikey'),
        },
        {
          label: 'Open engine log',
          click: () => shell.openPath(logPath()),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function stopBackend() {
  shuttingDown = true;
  if (backend && !backend.killed) {
    try {
      backend.kill('SIGTERM');
      // Hard stop if it lingers.
      setTimeout(() => {
        if (backend && !backend.killed) backend.kill('SIGKILL');
      }, 3000);
    } catch {
      /* ignore */
    }
  }
}

// Single instance: focus the existing window instead of launching twice.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    buildMenu();
    boot();
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) boot();
    });
  });

  app.on('window-all-closed', () => app.quit());
  app.on('before-quit', stopBackend);
  app.on('will-quit', stopBackend);
  process.on('exit', stopBackend);
}
