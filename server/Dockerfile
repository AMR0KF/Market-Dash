# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy application files
COPY --from=builder /app ./

# Create uploads directory
RUN mkdir -p server/src/uploads

EXPOSE 4000

# Start the server
CMD ["npm", "start"]
