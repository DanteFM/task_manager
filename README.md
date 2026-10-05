# Task Manager

Учебный fullstack-проект: трекер задач с досками, статусами и ролями (admin / executor).
Развивается по стадиям, каждая стадия — отдельный релиз с описанием, что добавлено и зачем.

## Стек (стадия 1)

- Backend: Node.js, Express 5, TypeScript, MongoDB (Mongoose), JWT
- Frontend: React (в работе)
- Окружение: Docker Compose (MongoDB для разработки)

## Быстрый старт

```bash
docker compose up -d        # MongoDB

cd server
npm ci
cp .env.example .env        # заполнить значения
npm run dev                 # http://localhost:3000
```

### Переменные окружения (`server/.env`)

| Переменная | Описание |
|---|---|
| `PORT` | порт сервера (по умолчанию 3000) |
| `MONGODB_URI` | строка подключения к MongoDB |
| `JWT_SECRET` | секрет для подписи токенов (случайная строка) |

## API

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/health` | все | проверка сервера |
| POST | `/api/auth/register` | все | регистрация (роль executor) |
| POST | `/api/auth/login` | все | вход, возвращает JWT |
| GET | `/api/me` | авторизованные | текущий пользователь |

Защищённые запросы: заголовок `Authorization: Bearer <token>`.

## Соглашения

Коммиты по [Conventional Commits](https://www.conventionalcommits.org/ru/v1.0.0/):
`feat(server): ...`, `fix(client): ...`, `docs: ...`.