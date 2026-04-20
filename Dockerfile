# --- Stage 1: Build ---
FROM oven/bun:1.1-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# --- Stage 2: Production ---
FROM oven/bun:1.1-slim AS runner

WORKDIR /app

# Copy ONLY necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Ensure the app listens on 0.0.0.0
ENV PORT=7860
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

EXPOSE 7860

# Start the app
CMD ["bun", "run", "src/app.ts"]