FROM redis:7-alpine

# Copy custom configuration
COPY redis.conf /usr/local/etc/redis/redis.conf

# Create data directory and set permissions
RUN mkdir -p /data && \
    chown redis:redis /data && \
    chmod 755 /data

# Create non-root user for security
USER redis

# Expose Redis port
EXPOSE 6379

# Start Redis with custom configuration
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]