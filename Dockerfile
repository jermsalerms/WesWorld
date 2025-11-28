# syntax=docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.0
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="Node.js"

# App lives here
WORKDIR /app

########################
#  Build stage
########################
FROM base AS build

# Install packages needed to build native node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      node-gyp \
      pkg-config \
      python-is-python3 && \
    rm -rf /var/lib/apt/lists/*

# Copy root manifests first for better caching
COPY package.json package-lock.json* ./

# Copy workspace manifests so their deps are installed, too
COPY client/package.json client/package-lock.json* ./client/
COPY server/package.json server/package-lock.json* ./server/

# Install all dependencies (including devDependencies such as Vite)
# NOTE: Use legacy-peer-deps to avoid React/@react-three/fiber peer conflicts
RUN npm install --legacy-peer-deps

# Now copy the rest of the source code
COPY . .

# Build application (runs workspace client & server builds)
RUN npm run build

########################
#  Runtime stage
########################
FROM base AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Copy built app from build stage
COPY --from=build /app /app

# Remove devDependencies for a smaller runtime image
RUN npm prune --omit=dev || true

# App listens on 3000 (matches fly.toml internal_port)
EXPOSE 3000

# Start the server (root package.json should delegate to the server workspace)
CMD [ "npm", "run", "start" ]