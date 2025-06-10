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
RUN adduser -S searchuser -u 1001

# Create necessary directories
RUN mkdir -p /app/logs /app/data
RUN chown -R searchuser:nodejs /app

USER searchuser

# Expose port
EXPOSE 8007

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/utils/healthcheck.js

# Start the application
CMD ["npm", "start"]