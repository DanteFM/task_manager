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
| GET | `/api/boards` | авторизованные | доски, доступные пользователю (админ: свои, исполнитель: где есть его задачи) |
| POST | `/api/boards` | admin | создать доску; статусы создаются по шаблону |
| GET | `/api/boards/:id` | с доступом к доске | доска со статусами |
| POST | `/api/boards/:id/statuses` | admin (владелец) | добавить статус |
| PATCH | `/api/boards/:id/statuses/:statusId` | admin (владелец) | переименовать статус |
| DELETE | `/api/boards/:id/statuses/:statusId` | admin (владелец) | удалить статус (если в нём нет задач) |
| GET | `/api/tags` | авторизованные | список тегов |
| POST | `/api/tags` | admin | создать тег |
| POST | `/api/boards/:id/tasks` | admin (владелец) | создать задачу |
| GET | `/api/boards/:id/tasks` | с доступом к доске | задачи доски; фильтры `statusId`, `assigneeId`, `priority`, `tag`; исполнитель видит только свои |
| PATCH | `/api/tasks/:taskId/status` | admin (владелец доски), исполнитель своей задачи | сменить статус задачи |
| PATCH | `/api/tasks/:taskId` | admin (владелец доски) | изменить задачу (title, description, priority, assigneeId, tags) |

Защищённые запросы: заголовок `Authorization: Bearer <token>`.

## Роли и права

| Действие | admin | executor |
|---|---|---|
| Создать доску | да | нет |
| Видеть доску | свои | где назначена его задача |

## Соглашения

Коммиты по [Conventional Commits](https://www.conventionalcommits.org/ru/v1.0.0/):
`feat(server): ...`, `fix(client): ...`, `docs: ...`.