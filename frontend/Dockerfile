FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build for production
# Uncomment for production builds
# RUN npm run build

# Expose port
EXPOSE 3000

# Start the app in development mode
CMD ["npm", "start"]
