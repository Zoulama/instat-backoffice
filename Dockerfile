# INSTAT Back Office Frontend - Production Dockerfile
# Multi-stage build for optimized production image

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build application for production
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install Node.js and npm for serve (if needed for runtime)
RUN apk add --no-cache nodejs npm

# Install serve globally
RUN npm install -g serve

# Create non-root user
RUN addgroup -g 1001 -S instat && \
    adduser -S instat -u 1001

# Copy built application from builder stage
COPY --from=builder /app/dist/instat-backoffice /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy environment configuration
COPY --from=builder /app/.env.example /app/.env.example

# Create directories and set permissions
RUN mkdir -p /var/log/nginx /var/log/app && \
    chown -R instat:instat /var/log/app /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Expose port
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Labels for metadata
LABEL maintainer="INSTAT Development Team"
LABEL version="1.0.0"
LABEL description="INSTAT Back Office Frontend - Production Container"

# Switch to non-root user
USER instat

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]