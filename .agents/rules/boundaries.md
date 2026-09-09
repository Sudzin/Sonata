# Rule: Boundaries

- **Electron Security:** Renderer MUST NOT access Node.js APIs directly.
- **IPC:** Renderer MUST NOT use `ipcRenderer` directly. All privileged operations MUST go through typed preload APIs.
