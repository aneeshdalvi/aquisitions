You are a senior DevOps engineer. Your task is to dockerize my application that uses Neon Database. The setup must work differently for development and production:

1. **Development Environment (Local):**
    - Use **Neon Local** via Docker.
    - Configure `docker-compose.yml` to run the Neon Local proxy alongside my application. Learn more about Neon Local here: https://neon.com/docs/local/neon-local
    - The application should connect to Postgres at `postgres://user:password@neon-local:5432/dbname` (or equivalent `localhost` inside the compose network).
    - Neon Local should automatically create ephemeral branches for dev and testing.
    - Ensure `.env.development` or equivalent config points to this Neon Local connection string.
2. **Production Environment:**
    - Use the actual **Neon Cloud Database URL** (e.g., `DATABASE_URL=postgres://...neon.tech...`).
    - No Neon Local proxy should be used in production.
    - Ensure secrets and URLs are injected via environment variables, not hardcoded.
    - Create a separate `.env.production` for production environments
3. **General Requirements:**
    - Write a `Dockerfile` for the app.
    - Write a `docker-compose.dev.yml` that runs both the app and Neon Local for development.
    - Write a `docker-compose.prod.yml` that runs both the app and serverless neondb for production.
    - Show how environment variables (`DATABASE_URL`) switch between dev and prod.
    - Provide documentation (in `README.md` style) for how a developer should start the app locally with Neon Local, and how the same app deploys with production Neon DB.