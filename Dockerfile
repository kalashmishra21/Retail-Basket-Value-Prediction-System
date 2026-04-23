# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (includes .env.production)
COPY . .

# Build argument for API URL (can be overridden at build time)
ARG VITE_API_URL=http://51.20.70.80:8000
ENV VITE_API_URL=$VITE_API_URL

# Build the app - Vite will use VITE_API_URL from environment
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Copy built files from builder
COPY --from=builder /app/dist .

# Expose port
EXPOSE 3001

# Run nginx
CMD ["nginx", "-g", "daemon off;"]
