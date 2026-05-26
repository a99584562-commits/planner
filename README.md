# Планировщик · PWA

Daily planner с moodboard-эстетикой по design handoff. 5 экранов: **Today / Tasks / Board / Cal / Habits**. Тёмное стекло, янтарный акцент, плавающие glass-карточки.

## Локальная разработка

```bash
npm install
npm run dev
```

## Деплой на GitHub Pages

1. Создай репозиторий на GitHub (например `planner`).
2. Запушь:
   ```bash
   git init && git add . && git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/<твой-юзер>/planner.git
   git push -u origin main
   ```
3. **Settings → Pages → Source → GitHub Actions**. Workflow в `.github/workflows/deploy.yml` опубликует на `https://<юзер>.github.io/planner/`.

## Установка на iPhone

1. Открой ссылку в **Safari** (не Chrome).
2. **Поделиться → На экран Домой** → откроется в полноэкранном режиме.

## Структура

```
src/
├── tokens.ts        — T цвета (oklch + rgba)
├── icons.tsx        — кастомный SVG-набор (Plus/Home/List/Cal/Grid/Flame/...)
├── components.tsx   — Backdrop / Glass / Photo / Pill / CheckCircle / Mono / SecHead
├── screens/
│   ├── Today.tsx    — приветствие + now event + статы + расписание + задачи
│   ├── Tasks.tsx    — 4 категории с прогрессом, тогглеры (локальный state)
│   ├── Cal.tsx      — неделя + day timeline 24h heatmap + month grid
│   ├── Board.tsx    — floating moodboard hero-view
│   └── Habits.tsx   — year heatmap + habit cards с pattern bars
└── App.tsx          — shell + BottomNav + persist tab в localStorage
```

## Дизайн-токены (из handoff)

| Token | Значение |
|---|---|
| `accent` | `oklch(0.88 0.14 95)` — янтарный, единственный акцент |
| `bg`/`bgDeep` | warm near-black |
| `ink`/`ink2`/`ink3` | text contrast scale |
| Glass | rgba warm-dark + blur 28px + saturate 160% + hairline + inner highlight |

Шрифты: **Inter Tight** (UI) + **JetBrains Mono** (числа, метки).

## Стек

- Vite 6 + React 18 + TypeScript (inline styles, без Tailwind)
- `vite-plugin-pwa` — service worker + manifest
- GitHub Actions deploy

## Заметки

- Активная вкладка хранится в `localStorage.planner-tab`.
- Данные задач/привычек в текущем виде — статичные mock'и из design handoff. Для production добавить persistence (как было в v0.1 через localStorage) или backend.
- Для production iOS apple-touch-icon лучше пересобрать через realfavicongenerator.net.
