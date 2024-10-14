# Use an official Node.js runtime as a parent image (alpine version for small image size)
FROM node:alpine

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the entire project directory (where the Dockerfile is located) to the /app directory in the container
COPY . .

# Install project dependencies based on the package.json in your project directory
RUN npm install

# Expose port 8080 so the app can be accessed outside the container
EXPOSE 8080

# Start the Node.js app when the container starts
CMD ["npm", "start"]

