# Multi-stage build for optimized production image
FROM node:18-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/out ./out
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Install serve for static hosting
RUN npm install -g serve

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005 || exit 1

# Start the application
CMD ["serve", "-s", "out", "-l", "3005"]