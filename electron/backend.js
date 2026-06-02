// Backend lifecycle for the Electron app: locate a usable Python, launch the
// FastAPI server (which also serves the built dashboard), and wait until it is
// ready to accept requests.
const { spawn } = require('child_process');
const { app } = require('electron');
const fs = require('fs');
const os = require('os');
const net = require('net');
const path = require('path');
const http = require('http');

// Where app.py / main.py live. Unpackaged (dev): the repo root. Packaged: the
// backend is staged into Resources/backend (see ELECTRON.md for bundling).
function getBackendRoot() {
  if (app && app.isPackaged) {
    return path.join(process.resourcesPath, 'backend');
  }
  return path.join(__dirname, '..');
}

// Pick a Python interpreter that has the project's dependencies installed.
// Mirrors install.command's preference order; SERMON_PYTHON overrides everything.
function resolvePython() {
  const root = getBackendRoot();
  const candidates = [
    process.env.SERMON_PYTHON,
    path.join(root, 'venv', 'bin', 'python'),
    path.join(os.homedir(), 'miniconda3', 'envs', 'py312', 'bin', 'python'),
    '/usr/bin/python3',
    'python3',
  ].filter(Boolean);

  for (const c of candidates) {
    // Absolute paths must exist; bare names (python3) are resolved via PATH.
    if (c.includes('/')) {
      if (fs.existsSync(c)) return c;
    } else {
      return c;
    }
  }
  return 'python3';
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.unref();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function pingConfig(port) {
  return new Promise((resolve) => {
    const req = http.get(
      { host: '127.0.0.1', port, path: '/api/config', timeout: 2000 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitForBackend(port, timeoutMs = 90000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await pingConfig(port)) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function startBackend(port, onLog = () => {}) {
  const python = resolvePython();
  const cwd = getBackendRoot();
  const args = ['-u', '-m', 'uvicorn', 'app:app', '--host', '127.0.0.1', '--port', String(port)];

  onLog(`[backend] python: ${python}`);
  onLog(`[backend] cwd:    ${cwd}`);
  onLog(`[backend] start:  uvicorn on 127.0.0.1:${port}`);

  const child = spawn(python, args, {
    cwd,
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (d) => onLog(d.toString().replace(/\s+$/, '')));
  child.stderr.on('data', (d) => onLog(d.toString().replace(/\s+$/, '')));
  child.on('error', (err) => onLog(`[backend] spawn error: ${err.message}`));

  return { child, python, cwd };
}

module.exports = { getBackendRoot, resolvePython, getFreePort, waitForBackend, startBackend };
