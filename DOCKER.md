# Docker Setup — Aquisitions API

This project uses Docker for both **development** (Neon Local proxy) and **production** (Neon Cloud).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2+
- A [Neon](https://neon.tech) account with a project created
- Your **Neon API key**, **project ID**, and the **branch ID** of the branch you want to fork from (for ephemeral dev branches)

---

## Development (Neon Local)

Development runs two containers:

1. **neon-local** — Neon Local proxy (`neondatabase/neon_local`) that creates an ephemeral branch from your Neon project on startup and deletes it on shutdown.
2. **app** — Your Express app with hot-reload (`node --watch`), source-mounted as a volume.

### 1. Configure environment

Copy and fill in `.env.development`:

```env
# App
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Auth
JWT_SECRET=dev-secret-change-me

# Database (localhost form — used when running outside Docker)
DATABASE_URL=postgres://neon:npg@localhost:5432/neondb

# Neon Local (required by neon-local container)
NEON_API_KEY=<your Neon API key>
NEON_PROJECT_ID=<your Neon project ID>
PARENT_BRANCH_ID=<branch ID to fork ephemeral branches from>
```

> `DATABASE_URL` and `NEON_LOCAL_ENDPOINT` are **overridden** inside `docker-compose.dev.yml` to use the Docker-internal hostname `neon-local`.

### 2. Start the stack

```sh
docker compose -f docker-compose.dev.yml up --build
```

The app will be available at `http://localhost:3000`.

### 3. Run database migrations

From your **host machine** (port 5432 is mapped to localhost):

```sh
DATABASE_URL="postgres://neon:npg@localhost:5432/neondb" npm run db:push
```

Or exec into the app container:

```sh
docker compose -f docker-compose.dev.yml exec app npm run db:push
```

### 4. Stop (ephemeral branch auto-deletes)

```sh
docker compose -f docker-compose.dev.yml down
```

---

## Production (Neon Cloud)

Production uses a single app container that connects directly to your Neon Cloud database — no local proxy.

### 1. Configure environment

Copy and fill in `.env.production`:

```env
# App
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Auth
JWT_SECRET=<strong random secret>

# Database (Neon Cloud)
DATABASE_URL=postgres://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2. Build & run

```sh
docker compose -f docker-compose.prod.yml up --build -d
```

### 3. Run migrations

```sh
docker compose -f docker-compose.prod.yml exec app npm run db:push
```

---

## How `DATABASE_URL` switches between environments

```
┌──────────────────────────┐       ┌──────────────────────────┐
│     DEVELOPMENT          │       │     PRODUCTION           │
│                          │       │                          │
│  .env.development        │       │  .env.production         │
│  docker-compose.dev.yml  │       │  docker-compose.prod.yml │
│                          │       │                          │
│  DATABASE_URL ──► neon-  │       │  DATABASE_URL ──► Neon   │
│  local container (5432)  │       │  Cloud (neon.tech)       │
│                          │       │                          │
│  NEON_LOCAL_ENDPOINT set │       │  NEON_LOCAL_ENDPOINT     │
│  ► neonConfig adapts     │       │  NOT set ► default cloud │
│    driver for HTTP proxy │       │    TLS connection        │
└──────────────────────────┘       └──────────────────────────┘
```

The key toggle is the `NEON_LOCAL_ENDPOINT` env var:

- **Set** (dev) → `src/config/database.js` configures the `@neondatabase/serverless` driver to use HTTP against the Neon Local proxy.
- **Absent** (prod) → the driver uses its default cloud connection (TLS to `neon.tech`).

---

## File overview

| File                      | Purpose                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `Dockerfile`              | Multi-stage build — `development` target (with devDeps + watch) and `production` target (minimal) |
| `docker-compose.dev.yml`  | Runs app + Neon Local proxy; mounts `src/` for hot-reload                                         |
| `docker-compose.prod.yml` | Runs app only; connects to Neon Cloud                                                             |
| `.env.development`        | Dev env vars (Neon API key, project ID, branch ID)                                                |
| `.env.production`         | Prod env vars (Neon Cloud DATABASE_URL, JWT secret)                                               |
| `.dockerignore`           | Keeps `node_modules`, `.git`, env files, logs out of the build context                            |
| `src/config/database.js`  | Detects `NEON_LOCAL_ENDPOINT` and configures the serverless driver accordingly                    |
