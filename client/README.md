# Approval Workflow App

Production-ready React + TypeScript + Vite starter.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, TanStack Table,
React Router v6, Axios, React Hook Form + Zod, Heroicons, ESLint, Prettier.

## Getting started

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

- `npm run dev` – dev server
- `npm run build` – typecheck + production build
- `npm run lint` – ESLint
- `npm run format` – Prettier

## Structure

```
src/
  api/          axios client + request modules
  components/   ui/, table/, layout/
  context/      AuthContext
  hooks/        data hooks (TanStack Query)
  lib/          utils, zod schemas
  pages/        Login, Requester, Approver, Admin, NotFound
  routes/       router config + ProtectedRoute
  types/        shared types
```

## Auth / roles

Mock auth in `src/context/AuthContext.tsx` (localStorage). Roles:
`requester`, `approver`, `admin`. Routes are guarded by `ProtectedRoute`
with an optional `roles` allow-list. Replace the mock `login()` with a real
API call when wiring a backend.
