# ---- Base Stage ----
# Use the official Bun image as a base.
# Using latest to avoid known crashes in 1.3.1
FROM oven/bun:latest as base
WORKDIR /app

# ---- Dependencies Stage ----
# Install all dependencies, including devDependencies, needed for the build.
FROM base as dependencies
# Copy package.json and the lockfile to leverage Docker's layer caching.
# This avoids re-installing dependencies if they haven't changed.
COPY package.json bun.lock ./

# Install dependencies using the frozen lockfile for consistency.
RUN bun install --frozen-lockfile

# ---- Build Stage ----
# Build the Next.js application.
FROM dependencies as builder
# Copy the rest of the source code.
COPY . .
# Run the build command.
RUN bun run build

# ---- Runner Stage ----
# Create the final, lightweight image to run the application.
FROM base as runner
WORKDIR /app

# Set the environment to production.
ENV NODE_ENV=production
# The port will be dynamically set by Coolify, but a default is good practice.
ENV PORT=3001
# Fix host binding for containerized environments
ENV HOSTNAME=0.0.0.0

# Copy package.json and bun.lock for dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# Install all dependencies (including devDependencies needed for TypeScript at runtime)
# Next.js requires TypeScript to be available in production for next.config.ts
RUN bun install --frozen-lockfile

# Copy the build output from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3001

# Start the Next.js application using Bun
CMD ["bun", "run", "start"]
