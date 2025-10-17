# Use Node.js 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port (not needed for Discord bot, but good practice)
EXPOSE 3000

# Start the bot
CMD ["node", "src/index.js"]
