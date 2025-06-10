# Multi-stage Dockerfile for React Native Mobile App
# Supports both Android and iOS builds with Expo

# ============================================
# Stage 1: Base Node.js Environment
# ============================================
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for React Native
RUN apk add --no-cache \
    git \
    bash \
    curl \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Install global dependencies
RUN npm install -g @expo/cli @react-native-community/cli yarn

# ============================================
# Stage 2: Dependencies Installation
# ============================================
FROM base AS dependencies

# Copy package files
COPY package.json package-lock.json ./
COPY metro.config.js ./
COPY babel.config.js ./

# Install dependencies with npm ci for consistent builds
RUN npm ci --only=production && npm cache clean --force

# Install development dependencies in separate layer
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# ============================================
# Stage 3: Development Environment
# ============================================
FROM dependencies AS development

# Copy application source code
COPY . .

# Create necessary directories
RUN mkdir -p logs assets/fonts assets/images

# Set environment variables for development
ENV NODE_ENV=development
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Expose ports for Metro bundler and Expo DevTools
EXPOSE 8081 19000 19001 19002

# Development command
CMD ["npm", "start"]

# ============================================
# Stage 4: Android Build Environment
# ============================================
FROM base AS android-build

# Install Java 11 for Android builds
RUN apk add --no-cache openjdk11-jdk

# Set JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=$ANDROID_HOME
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Create Android SDK directory
RUN mkdir -p $ANDROID_HOME/cmdline-tools

# Download and install Android command line tools
RUN curl -o commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip && \
    unzip commandlinetools.zip -d $ANDROID_HOME/cmdline-tools && \
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm commandlinetools.zip

# Accept Android SDK licenses
RUN yes | sdkmanager --licenses

# Install required Android SDK components
RUN sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.0"

# Copy dependencies and source code
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build Android APK
RUN npm run build:android

# ============================================
# Stage 5: Web Build Environment (Expo Web)
# ============================================
FROM dependencies AS web-build

# Copy source code
COPY . .

# Set environment for web build
ENV NODE_ENV=production
ENV EXPO_WEB_BUILD=true

# Build web version
RUN npm run build:web

# ============================================
# Stage 6: Production Web Server
# ============================================
FROM nginx:alpine AS production-web

# Copy built web assets
COPY --from=web-build /app/web-build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx && \
    adduser -S nginx -u 1001 -G nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# ============================================
# Stage 7: Backend API Server (for mobile app backend)
# ============================================
FROM node:18-alpine AS api-server

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the API server
CMD ["node", "server.js"]

# ============================================
# Stage 8: Test Environment
# ============================================
FROM dependencies AS test

# Copy source code
COPY . .

# Install test dependencies
RUN npm install --include=dev

# Set test environment
ENV NODE_ENV=test
ENV CI=true

# Run tests
CMD ["npm", "run", "test:ci"]

# ============================================
# Default Build Target
# ============================================
FROM development AS default

# Copy source for development
COPY . .

# Set default environment
ENV NODE_ENV=development

# Default command
CMD ["npm", "start"]

# ============================================
# Build Arguments and Labels
# ============================================
ARG BUILD_VERSION=latest
ARG BUILD_DATE
ARG GIT_COMMIT

LABEL maintainer="iWORKZ Development Team <dev@iworkz.jp>" \
      version="${BUILD_VERSION}" \
      description="iWORKZ Mobile Application - React Native" \
      build-date="${BUILD_DATE}" \
      git-commit="${GIT_COMMIT}" \
      org.opencontainers.image.title="iWORKZ Mobile App" \
      org.opencontainers.image.description="AI-powered employment platform mobile application" \
      org.opencontainers.image.version="${BUILD_VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${GIT_COMMIT}" \
      org.opencontainers.image.vendor="iWORKZ株式会社" \
      org.opencontainers.image.licenses="Proprietary"

# ============================================
# Usage Examples:
# ============================================
# 
# Development:
# docker build --target development -t iworkz/mobile-app:dev .
# docker run -p 8081:8081 -p 19000:19000 iworkz/mobile-app:dev
#
# Android Build:
# docker build --target android-build -t iworkz/mobile-app:android .
#
# Web Production:
# docker build --target production-web -t iworkz/mobile-app:web .
# docker run -p 80:80 iworkz/mobile-app:web
#
# API Server:
# docker build --target api-server -t iworkz/mobile-app:api .
# docker run -p 3000:3000 iworkz/mobile-app:api
#
# Testing:
# docker build --target test -t iworkz/mobile-app:test .
# docker run iworkz/mobile-app:test
# ============================================