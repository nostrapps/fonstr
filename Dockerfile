# Use the official Node.js image as the base image
FROM node:16

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm ci

# Create Certs
RUN openssl req \
    -new \
    -newkey rsa:4096 \
    -days 365 \
    -nodes \
    -x509 \
    -subj "/C=US/ST=Denial/L=Springfield/O=Dis/CN=www.example.com" \
    -keyout privkey.pem \
    -out fullchain.pem

# Copy the server script to the working directory
COPY index.js ./

# Expose the server port
EXPOSE 4444

# Set up the necessary environment variables
ENV NODE_ENV=production

# Run the server
CMD [ "node", "index.js" ]

