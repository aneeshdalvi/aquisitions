# ---- Base ----
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# ---- Dependencies ----
FROM base AS deps
RUN npm ci --omit=dev

# ---- Development ----
FROM base AS development
RUN npm ci
COPY . .
EXPOSE ${PORT:-3000}
CMD ["node", "--watch", "src/index.js"]

# ---- Production ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY src ./src
COPY drizzle ./drizzle
COPY drizzle.config.js ./

EXPOSE ${PORT:-3000}
CMD ["npm", "start"]
