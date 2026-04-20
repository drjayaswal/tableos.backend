# --- Stage 1: Build ---
FROM oven/bun:latest AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Optional: If you need to build/transpile, do it here. 
# For Elysia, we usually just run the TS files directly with Bun.

# --- Stage 2: Production (Slim) ---
FROM oven/bun:distroless AS runner

WORKDIR /app

# Copy ONLY the necessary files from the builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Set Hugging Face defaults
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

# Run with Bun's production flags
CMD ["bun", "run", "src/app.ts"]