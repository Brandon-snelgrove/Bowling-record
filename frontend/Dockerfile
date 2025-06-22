# --- Stage 1: Build the React app ---
  FROM node:20-alpine AS builder

  WORKDIR /app
  
  # Copy package files and install dependencies
  COPY package.json package-lock.json* ./
  RUN npm install
  
  # Copy the rest of your app (src, public, etc.)
  COPY . .
  
  # Build the React app
  RUN npm run build
  
  # --- Stage 2: Serve the built app ---
  FROM node:20-alpine
  
  WORKDIR /app
  
  # Install serve to serve the static files
  RUN npm install -g serve
  
  # Copy only the build output from previous stage
  COPY --from=builder /app/build ./build
  
  # Expose the port
  EXPOSE 3000
  
  # Serve the app
  CMD ["serve", "-s", "build", "-l", "3000"]
  