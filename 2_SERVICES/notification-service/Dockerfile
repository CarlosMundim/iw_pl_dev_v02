FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S notificationuser -u 1001

# Create necessary directories
RUN mkdir -p /app/templates /app/logs
RUN chown -R notificationuser:nodejs /app

USER notificationuser

# Expose port
EXPOSE 8006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/utils/healthcheck.js

# Start the application
CMD ["npm", "start"]