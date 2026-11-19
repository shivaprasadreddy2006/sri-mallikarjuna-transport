# Production Dockerfile for SRI MALLIKARJUNA TRANSPORT Billing System
FROM node:20-slim

# Install Chromium and necessary fonts & dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-freefont-ttf \
    fonts-liberation \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# 1. Build frontend (install devDependencies so vite is available)
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --include=dev

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# 2. Setup backend with production dependencies
ENV NODE_ENV=production \
    PORT=5000

COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

COPY backend/ ./backend/

# Expose port
EXPOSE 5000

# Start server
CMD ["node", "backend/server.js"]
