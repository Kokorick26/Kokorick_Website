# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Production image with Node.js server
FROM node:20-alpine AS production

WORKDIR /app

# Install nginx for serving static files
RUN apk add --no-cache nginx

# Copy server files
COPY server/ ./server/
COPY package*.json ./

# Install only production dependencies for server
WORKDIR /app/server
RUN npm install --production

# Copy built frontend from builder stage
WORKDIR /app
COPY --from=frontend-builder /app/build ./build

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose ports
EXPOSE 80 5000

# Start both nginx and node server
CMD ["/docker-entrypoint.sh"]
