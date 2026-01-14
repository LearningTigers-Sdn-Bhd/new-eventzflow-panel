# -----------------------------------------------------------------------------
# This Dockerfile is configured for Next.js with Bun runtime
# Combines: Coolify integration, security best practices, and standalone output
# -----------------------------------------------------------------------------

# Use Bun's official image (pinned to major version)
FROM oven/bun:1 AS base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base AS deps
# Only copy files needed for install to maximize cache hits
COPY package.json bun.lock* ./

# Install dependencies with frozen lockfile for reproducibility
RUN bun install --no-save --frozen-lockfile

# ---- Build Stage ----
FROM base AS builder
WORKDIR /app

# 1. Copy the pre-installed modules from the dependencies stage
COPY --from=deps /app/node_modules ./node_modules

# 2. Copy source code
COPY . .

# 3. THE "FORCE FIX": Ensure Linux-specific native binaries exist.
# We delete the lightningcss folder and force Bun to fetch the linux-x64 target.
RUN rm -rf node_modules/lightningcss && \
    bun install --arch=x64 --platform=linux

# 4. Set Build Arguments (Coolify injects these)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENABLE_DEVTOOLS
ARG NEXT_PUBLIC_DEPLOYMENT_ENV

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENABLE_DEVTOOLS=$NEXT_PUBLIC_ENABLE_DEVTOOLS
ENV NEXT_PUBLIC_DEPLOYMENT_ENV=$NEXT_PUBLIC_DEPLOYMENT_ENV
ENV NODE_ENV=production

# Next.js collects completely anonymous telemetry data about general usage.
# Uncomment the following line to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

# 5. Run the build (creates standalone output)
RUN bun run build

# ---- Runner Stage ----
FROM base AS runner
WORKDIR /app

# Uncomment the following line to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=production \
    PORT=3001 \
    HOSTNAME="0.0.0.0"

# Create user and group for security (non-root execution)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --no-log-init -g nodejs nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3001

# Run the standalone server directly
CMD ["bun", "./server.js"]
