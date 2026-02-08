# 1. Use Node.js base image
FROM node:18-alpine

# 2. Set working directory
WORKDIR /app

# 3. Copy dependencies first (optimized for caching)
COPY package*.json ./

# 4. Install production dependencies
RUN npm install --production

# 5. Copy the rest of your code
COPY . .

# 6. Expose the port your server runs on (usually 5000)
EXPOSE 4000

# 7. Start the server
CMD ["npm", "start"]