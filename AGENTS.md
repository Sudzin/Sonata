# AGENTS.md

## Electron build
- `server.ts` определяет пути статики динамически (`__dirname`), чтобы работать и в `npm run build`, и внутри `app.asar`. Никогда не переписывай на `process.cwd()`.
- Не удаляй electron-builder, скрипты `electron:dev`/`electron:build` и ключ `build` из package.json.
- `main.cjs` — entry point Electron, ставит `NODE_ENV=production` для запуска собранного Express-сервера.

## Layout (не менять без явного запроса)
- Левый сайдбар (навигация + профиль) — на всю высоту экрана, профиль строго в левом нижнем углу.
- PlayerBar — только в правой/центральной части, рядом с сайдбаром.
- Правая панель с деталями трека — только когда `currentTrack != null`.

## Роли и правила
Перед началом любой задачи прочитай:
- Роль: `.agents/roles/coder.md` (разработка) или `.agents/roles/reviewer.md` (ревью — без правок кода)
- Правила: `.agents/rules/editing.md`, `.agents/rules/task-sizing.md`, `.agents/rules/boundaries.md`
- Отчёты прошлых ревью: `.agents/reviews/`