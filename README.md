# Task Manager

Учебный fullstack-проект: трекер задач с досками, статусами и ролями (admin / executor).
Развивается по стадиям, каждая стадия — отдельный релиз с описанием, что добавлено и зачем.

## Стек (стадия 1)

- Backend: Node.js, Express 5, TypeScript, MongoDB (Mongoose), zod, JWT
- Frontend: React, Ant Design (в работе)
- Окружение: Docker Compose (MongoDB для разработки)

## Быстрый старт

```bash
docker compose up -d        # MongoDB

cd server
npm ci
cp .env.example .env        # заполнить значения
npm run seed:admin          # создать администратора
npm run dev                 # http://localhost:3000
```

### Переменные окружения (`server/.env`)

| Переменная | Описание |
|---|---|
| `PORT` | порт сервера (по умолчанию 3000) |
| `MONGODB_URI` | строка подключения к MongoDB |
| `JWT_SECRET` | секрет для подписи токенов (случайная строка) |
| `CLIENT_ORIGIN` | адрес клиента, например `http://localhost:5173` (CORS и проверка Origin) |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | данные администратора для `seed:admin` (пароль не короче 8 символов) |
| `NODE_ENV` | `production` включает флаг `Secure` у cookie |

## API

Авторизация: httpOnly-cookie `token`, которую сервер ставит при регистрации и логине.
Для скриптов и Postman также работает заголовок `Authorization: Bearer <token>`, он главнее cookie.

| Метод | Путь | Доступ | Описание |
|---|---|---|---|
| GET | `/health` | все | проверка сервера |
| POST | `/api/auth/register` | все | регистрация (роль executor), ставит cookie |
| POST | `/api/auth/login` | все | вход, ставит cookie |
| POST | `/api/auth/logout` | все | сбросить cookie с токеном |
| GET | `/api/me` | авторизованные | текущий пользователь `{ id, email, role }` |
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
| DELETE | `/api/tasks/:taskId` | admin (владелец доски) | удалить задачу |

## Роли и права

| Действие | admin | executor |
|---|---|---|
| Создать доску, статусы, теги | да | нет |
| Создать, править, удалить задачу | да (на своих досках) | нет |
| Менять статус задачи | на своих досках | только назначенной ему |
| Видеть доски | свои | где ему назначена задача |
| Видеть задачи | все на своей доске | только назначенные |

Через регистрацию можно стать только executor, администратора создаёт `npm run seed:admin`.

## Безопасность

- Токен в httpOnly-cookie (`SameSite=Lax`, `Secure` в production), JavaScript страницы его не читает.
- Изменяющие запросы с чужим `Origin` отклоняются (защита от CSRF), CORS открыт только для `CLIENT_ORIGIN`.
- Пароли хранятся как хеш bcrypt, весь ввод проверяется через zod, лишние поля в телах запросов игнорируются.
- Если доступа к объекту нет, API отвечает 404, а не 403: так нельзя перебором узнать чужие id.
- Выход очищает cookie, но не отзывает уже выданный JWT: он действует до истечения срока (7 дней).

## Проверка API

Эталон поведения описан в [`docs/api-checklist.md`](docs/api-checklist.md), к нему приложена Postman-коллекция с автотестами.
Нужен созданный администратор с данными из переменных коллекции `adminEmail` и `adminPassword`.

```bash
npx newman run docs/postman/task-manager.postman_collection.json
```

## Соглашения

- Коммиты по [Conventional Commits](https://www.conventionalcommits.org/ru/v1.0.0/): `feat(server): ...`, `fix(client): ...`, `docs: ...`. Тип и область на английском, описание на русском. Один коммит — одно логическое изменение.
- Изменил API: обнови таблицу выше, коллекцию и чек-лист в `docs/` в том же коммите.