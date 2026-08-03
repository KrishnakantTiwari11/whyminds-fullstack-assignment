# Approval Workflow API

Express + TypeScript + PostgreSQL + Prisma backend for the approval workflow frontend, with JWT
authentication (access + rotating refresh tokens) and role-based authorization.

## Stack

Express 4, TypeScript, Prisma 5 (PostgreSQL), jsonwebtoken, bcryptjs, Zod, Helmet, CORS,
rate limiting, morgan, ESLint + Prettier.

## Getting started

```bash
npm install
cp .env.example .env          # set DATABASE_URL and the two JWT secrets
npm run prisma:migrate -- --name init
npm run seed
npm run dev                   # http://localhost:4000
```

Seeded logins (password `Password123!`): `admin@example.com`, `approver@example.com`,
`requester@example.com`.

## Folder structure

```text
prisma/
  schema.prisma        User / RefreshToken / Request models, Role + RequestStatus enums
  seed.ts
src/
  config/env.ts        Zod-validated environment variables
  lib/prisma.ts        Prisma client singleton
  middleware/
    auth.ts            authenticate (JWT) + authorize(...roles)
    validate.ts        Zod request validation
    error.ts           404 + centralized error handler (Prisma-aware)
    rateLimit.ts
  modules/
    auth/              register, login, refresh, logout, me
    users/             admin-only user CRUD
    requests/          approval requests, decisions, stats
  utils/               ApiError, asyncHandler, jwt, password
  routes.ts  app.ts  server.ts
```

## Auth model

- `POST /api/auth/login` returns `{ user, tokens: { accessToken, refreshToken } }`; the refresh token
  is also set as an httpOnly cookie scoped to `/api/auth`.
- Access tokens are short-lived (15m) and sent as `Authorization: Bearer <token>`.
- Refresh tokens are stored **hashed** (SHA-256) and rotated on every `/api/auth/refresh`; the old one
  is revoked, so replay is detectable.
- `authenticate` re-loads the user on every request, rejecting deleted or disabled accounts.
- Self-service registration can never create an ADMIN.

## Authorization

`authorize(Role.ADMIN)` etc. gates routes; services additionally enforce ownership
(requesters only see and edit their own requests, nobody approves their own request).

## Endpoints

| Method           | Path                         | Access                       |
| ---------------- | ---------------------------- | ---------------------------- |
| POST             | `/api/auth/register`         | public                       |
| POST             | `/api/auth/login`            | public                       |
| POST             | `/api/auth/refresh`          | public (valid refresh token) |
| POST             | `/api/auth/logout`           | authenticated                |
| GET              | `/api/auth/me`               | authenticated                |
| GET              | `/api/users`                 | ADMIN                        |
| POST             | `/api/users`                 | ADMIN                        |
| GET/PATCH/DELETE | `/api/users/:id`             | ADMIN                        |
| GET              | `/api/requests`              | any role (scoped)            |
| GET              | `/api/requests/stats`        | any role (scoped)            |
| GET              | `/api/requests/:id`          | owner, APPROVER, ADMIN       |
| POST             | `/api/requests`              | REQUESTER, ADMIN             |
| PATCH            | `/api/requests/:id`          | owner (pending only), ADMIN  |
| POST             | `/api/requests/:id/decision` | APPROVER, ADMIN              |
| DELETE           | `/api/requests/:id`          | owner, ADMIN                 |
| GET              | `/api/health`                | public                       |

## Production

```bash
npm run build
npm run prisma:deploy
npm start
```
