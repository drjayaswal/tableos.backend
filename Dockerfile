# --- Stage 1: Build ---
FROM oven/bun:1.1-slim AS builder

WORKDIR /app

# Copy package.json and the NEW bun.lock file
COPY package.json ./
COPY bun.lock ./

# Install dependencies (will use bun.lock automatically)
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# --- Stage 2: Production ---
FROM oven/bun:1.1-slim AS runner

WORKDIR /app

# Copy only what we need to run the app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Environment settings for Hugging Face
ENV PORT=7860
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

EXPOSE 7860

# Adjust this if your entry point is actually src/index.ts
CMD ["bun", "run", "src/app.ts"]