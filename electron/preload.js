// Minimal, safe bridge. The dashboard talks to the backend over fetch, so it
// needs no privileged APIs — we only expose a little read-only metadata.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('sermonDesktop', {
  isDesktop: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
