# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
ARG VITE_TINYAUTH_APP_URL
ENV VITE_TINYAUTH_APP_URL=${VITE_TINYAUTH_APP_URL}
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-bookworm-slim AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY --from=builder /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
