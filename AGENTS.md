# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Express 5 REST API ("Acquisitions") using ESM modules, Neon Serverless Postgres via Drizzle ORM, JWT cookie-based auth, and Arcjet security middleware. Node 22.

## Commands

### Development
- `npm run dev` — start with hot-reload (`node --watch`)
- `npm run dev:docker` — start Docker dev stack (app + Neon Local ephemeral branch)
- `npm run prod:docker` — start Docker production stack (app + Neon Cloud)

### Database (Drizzle)
- `npm run db:generate` — generate migration files from schema changes
- `npm run db:migrate` — apply migrations
- `npm run db:push` — push schema directly (skips migration files)
- `npm run db:studio` — open Drizzle Studio GUI
- Schema lives in `src/models/*.js`; Drizzle config is in `drizzle.config.js`

### Lint & Format
- `npm run lint` — ESLint with auto-fix
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check only

### Testing
No test runner is currently configured. The ESLint config reserves Jest-style globals for a future `tests/` directory.

## Architecture

Layered MVC-style structure under `src/`:

```
Request → routes → controllers → services → Drizzle ORM → Neon Postgres
```

- **routes/** — Express routers; define HTTP methods and wire middleware/controllers.
- **controllers/** — Parse/validate input (via Zod schemas from `validations/`), call services, format HTTP responses. Error handling is done by catching service-thrown errors and mapping error messages to status codes.
- **services/** — Business logic and all database access through Drizzle (`db` from `#config/database.js`).
- **models/** — Drizzle `pgTable` schema definitions. These also drive `drizzle-kit` migrations.
- **validations/** — Zod schemas for request body/params. Controllers call `.safeParse()` and use `#utils/format.js` to format errors.
- **middleware/** — `auth.middleware.js` (JWT token extraction from cookies + role guard), `security.middleware.js` (Arcjet rate-limiting, bot detection, shield).
- **config/** — `database.js` (Neon client setup, switches between Neon Local in dev and Neon Cloud in prod via `neonConfig`), `arcjet.js` (security rules), `logger.js` (Winston with file + console transports).
- **utils/** — `jwt.js` (sign/verify wrappers), `cookies.js` (httpOnly cookie helpers), `format.js` (Zod error formatter).

### Entry point

`src/index.js` → loads dotenv → imports `src/server.js` → imports `src/app.js` (Express app factory) → listens on `PORT`.

### Path aliases

The project uses Node.js subpath imports (defined in `package.json` `"imports"`):
`#config/*`, `#models/*`, `#routes/*`, `#services/*`, `#utils/*`, `#controllers/*`, `#middleware/*`, `#validations/*` — all resolve to `./src/<folder>/*`.

Always use these aliases in imports rather than relative paths.

### Auth flow

1. Signup/sign-in → controller validates with Zod → service creates/authenticates user (bcrypt) → controller signs JWT → sets `token` as httpOnly cookie.
2. Protected routes use `authenticateToken` middleware which reads `req.cookies.token`, verifies JWT, and attaches `req.user`.
3. Role-based access via `requireRole(['admin'])` middleware.

### Security (Arcjet)

`security.middleware.js` runs on every request before routes. It applies role-based rate limits (admin: 20/min, user: 10/min, guest: 5/min) plus bot detection and shield protection. The base Arcjet config in `config/arcjet.js` sets a global 5-req/2s sliding window.

### Database environment switching

`src/config/database.js` checks `NODE_ENV`:
- **development** — configures `neonConfig` to use `http://neon-local:5432` (Docker Neon Local proxy). Ephemeral branches are created/destroyed with `docker compose up/down`.
- **production** — uses default Neon Cloud TLS connection via `DATABASE_URL`.

There is a legacy `src/database.js` at the project root of `src/` — it is unused; always import from `#config/database.js`.

## Style Conventions

- ESM (`"type": "module"`) — use `import`/`export`, not `require`.
- Single quotes, semicolons, 2-space indentation, Unix line endings (enforced by ESLint + Prettier).
- `prefer-const`, `no-var`, `object-shorthand`, `prefer-arrow-callback`.
- Prefix unused function parameters with `_` (e.g., `(_req, res)`).
- Use Winston `logger` (from `#config/logger.js`) instead of raw `console.log` in application code.

## Environment Variables

Required variables (see `.env.development` / `.env.production` templates):
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — secret for signing JWTs
- `ARCJET_KEY` — Arcjet API key
- `PORT` — server port (default 3000)
- `NODE_ENV` — `development` or `production`
- `LOG_LEVEL` — Winston log level (default `info`)
- For Docker dev: `NEON_API_KEY`, `NEON_PROJECT_ID`, `PARENT_BRANCH_ID`
