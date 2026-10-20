# Поиск автозапчастей (React + Redux)

## Запуск

Нужен Node.js 20.19+ (или совместимая с Vite 6 версия Node.js).

```bash
npm install
cp .env.example .env
```

Открой `.env`, укажи реальный ключ покупателя:

```dotenv
VITE_API_URL=http://api.favorit-parts.ru/hs/hsprice/
VITE_API_KEY=ваш_ключ_покупателя
```

Запусти:

```bash
npm run dev
```

Открой адрес, который показывает Vite (обычно http://localhost:5173).

## Алгоритм

1. Введите артикул. Через 550 мс: GET `VITE_API_URL?key=...&number=...`.
2. Выберите производителя. GET `VITE_API_URL?key=...&number=...&brand=...&analogues=on`.
3. Показываем позиции и аналоги, раскрывая предложения по складам. Используются `warehouses[].price` и `warehouses[].stock` (а не устаревшее поле `goods.price`).
4. Ошибки API (`error`), невалидный ответ, пустой список, отсутствие сети и загрузка отображаются на экране. Устаревшие запросы отменяются.
5. Новый поиск производителей сбрасывает выбранный бренд и предыдущие предложения. Таблица показывает по 50 строк на странице.

Валюта в приложенной документации API не указана, поэтому приложение не добавляет к ценам обозначение валюты.

## Где менять API

Адрес API и ключ — в **`.env`**, см. `VITE_API_URL` и `VITE_API_KEY`. Файл с функцией запроса — `src/services/partsApi.js`.

## Команды

- `npm run dev` — разработка
- `npm run build` — сборка
- `npm run preview` — предпросмотр сборки
- `npm test` — тесты преобразования данных, запросов API и состояния Redux

## Структура

- `src/services/partsApi.js` — прямой HTTP-запрос
- `src/features/parts/partsSlice.js` — Redux Toolkit, статусы загрузки и ошибки
- `src/utils/normalize.js` — извлечение брендов, складов, аналогов
- `src/components/` — визуальные компоненты
- `src/App.jsx` — двухэтапный интерфейс
- `wsprice.pdf` — приложенная документация API
