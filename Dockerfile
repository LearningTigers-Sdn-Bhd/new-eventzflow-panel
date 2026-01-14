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

# Reinstall to ensure native modules are properly linked after COPY
RUN bun install --frozen-lockfile

# Accept build arguments for NEXT_PUBLIC_ variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENABLE_DEVTOOLS
ARG NEXT_PUBLIC_DEPLOYMENT_ENV
# Make them available as environment variables during build
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENABLE_DEVTOOLS=$NEXT_PUBLIC_ENABLE_DEVTOOLS
ENV NEXT_PUBLIC_DEPLOYMENT_ENV=$NEXT_PUBLIC_DEPLOYMENT_ENV
# Run the build command.
RUN bun run build

# ---- Runner Stage ----
# Create the final, lightweight image to run the application.
# Inherit from builder to avoid copying issues with BuildKit
FROM builder as runner

# Set the environment to production.
ENV NODE_ENV=production
# The port will be dynamically set by Coolify, but a default is good practice.
ENV PORT=3001
# Fix host binding for containerized environments
ENV HOSTNAME=0.0.0.0

# Clean up build artifacts and source files not needed in production
# Keep only what's necessary for Next.js to run
RUN rm -rf /app/.git /app/.github /app/.cursor /app/docs /app/.ruler || true

EXPOSE 3001

# Start the Next.js application using Bun
CMD ["bun", "run", "start"]
