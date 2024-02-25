<<<<<<< HEAD
# Stage 1: Build the React/Vite application
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
=======
# Use an official Node runtime as a base image
FROM node:20.10.0-alpine

# Install sshpass
RUN apk update && apk add --no-cache sshpass

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the remaining project files to the working directory
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000 to the outside world
EXPOSE 3000

# Define the command to run the React app
CMD ["vite", "--host", "0.0.0.0", "--port", "3000"]
>>>>>>> f1bf63f (initial)
