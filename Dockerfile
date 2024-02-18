# Use a specific version of node alpine for predictability
FROM node:18-alpine as base

# Install python and build dependencies
RUN apk update && apk add python3 alpine-sdk

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy tsconfig.json
COPY tsconfig.json ./

# Install node modules
RUN npm install

# Copy the source code to the container
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run tsc

# Expose the port the app runs on
EXPOSE 6001

# Start the Node.js application
CMD ["node", "--max-old-space-size=2500", "dist/index.js"]
