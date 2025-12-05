# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./
COPY package-lock.json* ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Stage 2: Production image with Node.js server
FROM node:20-alpine AS production

WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy package files and install production dependencies
COPY package.json ./
COPY package-lock.json* ./
RUN npm install --production --legacy-peer-deps

# Copy server files
COPY server/ ./server/

# Copy built frontend from builder stage
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
