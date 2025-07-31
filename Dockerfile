# Use Node.js official image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install --production

# Copy all source code
COPY . .

# Build the React app
RUN npm run build

# Expose port
EXPOSE 5847

# Set environment variable
ENV NODE_ENV=production

# Start the application
CMD ["node", "server/index.js"] 