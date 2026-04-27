# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

FROM node:22-bookworm-slim AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
# Reuse built node_modules so preview can serve the built output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["pnpm", "preview", "--host", "0.0.0.0", "--port", "3000"]
