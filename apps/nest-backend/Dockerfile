# Use a base image that already has Prisma binaries
FROM node:20-slim

# Set environment variables to bypass SSL issues
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
ENV HTTPS_PROXY=""
ENV HTTP_PROXY=""
ENV NO_PROXY=""

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install system dependencies and update certificates
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js dependencies
RUN npm install

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

# Use a startup script that handles SSL issues
CMD ["sh", "-c", "NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate && NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma migrate deploy && npm run start:dev"]