# ---- Base Stage ----
FROM oven/bun:latest as base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base as dependencies
# Only copy files needed for install to maximize cache hits
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# ---- Build Stage ----
FROM base as builder
# 1. Copy everything (ensure .dockerignore exists to skip local node_modules!)
COPY . .

# 2. Copy the pre-installed modules from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# 3. FORCE FIX: Re-link dependencies for the current platform (Linux x64)
# This ensures platform-specific binaries like LightningCSS are properly installed
RUN bun install

# 4. Set Build Arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENABLE_DEVTOOLS
ARG NEXT_PUBLIC_DEPLOYMENT_ENV

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENABLE_DEVTOOLS=$NEXT_PUBLIC_ENABLE_DEVTOOLS
ENV NEXT_PUBLIC_DEPLOYMENT_ENV=$NEXT_PUBLIC_DEPLOYMENT_ENV
ENV NODE_ENV=production

# 5. Run the build
RUN bun run build

# ---- Runner Stage ----
FROM base as runner

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Copy only the necessary production build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cleanup non-essential files
RUN rm -rf /app/.git /app/.github /app/.cursor || true

EXPOSE 3001

CMD ["bun", "run", "start"]
