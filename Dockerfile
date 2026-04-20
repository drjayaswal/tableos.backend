# Change "1.1-slim" to "latest" or "1.2-slim"
FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lock ./
# If the lockfile is still giving you grief, remove --frozen-lockfile 
# to let Docker regenerate a compatible one during the build
RUN bun install

COPY . .

# --- Stage 2 ---
FROM oven/bun:latest AS runner
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

ENV PORT=7860
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

EXPOSE 7860

CMD ["bun", "run", "src/app.ts"]