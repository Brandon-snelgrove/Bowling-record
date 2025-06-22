### Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

# Install `serve` globally
RUN npm install -g serve

# Copy ONLY the built static files from the builder
COPY build ./build

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
