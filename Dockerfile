# ---- Base Stage ----
FROM oven/bun:latest as base
WORKDIR /app

# ---- Dependencies Stage ----
FROM base as dependencies
# Only copy files needed for install to maximize cache hits
COPY package.json bun.lock ./

# Install dependencies - we don't use --frozen-lockfile here to allow
# the engine to resolve platform-specific optionalDependencies if needed.
RUN bun install

# ---- Build Stage ----
FROM base as builder
# 1. Copy source code
COPY . .

# 2. Copy the pre-installed modules from the dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

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

# 5. Run the build
# If this still fails, change this to: RUN bun next build --no-turbo
RUN bun run build

# ---- Runner Stage ----
FROM base as runner

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Copy only what is needed to run the app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Cleanup
RUN rm -rf /app/.git /app/.github /app/.cursor /app/docs || true

EXPOSE 3001

CMD ["bun", "run", "start"]
