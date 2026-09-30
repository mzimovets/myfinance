# Мои финансы

Личный финансовый дневник и аналитика: доходы, расходы, зарплата, категории, бюджеты, цели и локальный финансовый помощник. Работает полностью в браузере — все данные хранятся в IndexedDB на устройстве, сервер не используется.

## Технологии

- React + TypeScript + Vite
- Tailwind CSS + HeroUI
- Framer Motion
- Recharts
- IndexedDB (через `idb`)
- Service Worker + Web App Manifest (`vite-plugin-pwa`)
- GitHub Actions → GitHub Pages

## Разработка

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Публикация на GitHub Pages

1. Убедитесь, что `base` в `vite.config.ts` соответствует имени репозитория (сейчас `/finance-diary/`).
2. Запушьте изменения в ветку `main` — workflow `.github/workflows/deploy.yml` соберёт проект и опубликует `dist/` через GitHub Pages автоматически.
3. В настройках репозитория (Settings → Pages) выберите источник **GitHub Actions**.
4. После первого успешного запуска приложение будет доступно по адресу `https://<username>.github.io/finance-diary/`.

## Иконки

Иконки приложения генерируются из `scripts/icon-source.svg` скриптом `scripts/generate-icons.mjs`:

```bash
node scripts/generate-icons.mjs
```

## Данные

Все данные (операции, категории, цели, бюджеты, настройки) хранятся локально в IndexedDB браузера и никуда не отправляются. Экспорт/импорт данных в формате JSON доступен в разделе «Ещё».
