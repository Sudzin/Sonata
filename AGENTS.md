# Инструкции агенту (AGENTS.md)

1. **Не ломайте сборку под Electron**:
   - `server.ts` теперь содержит логику динамического определения путей для статики, чтобы работать как при обычном `npm run build`, так и внутри упакованного приложения Electron (`app.asar`), не завися от `process.cwd()`.
   - `package.json` включает electron-builder и скрипты `electron:dev`, `electron:build`. Не удаляйте их и не удаляйте ключ `build` в package.json.
   - `main.cjs` - входной файл для Electron. В нем задается `process.env.NODE_ENV = 'production'`, чтобы правильно запускать скомпилированный Express-сервер из Electron.
   - Во время работы и разработки не переписывайте `server.ts` так, чтобы он зависел только от `process.cwd()`, всегда проверяйте через `__dirname`.
