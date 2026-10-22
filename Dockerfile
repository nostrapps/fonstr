FROM node:22-slim

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY index.js ./

EXPOSE 4444
ENV NODE_ENV=production

# listen on all interfaces inside the container; map the port with -p
CMD [ "node", "index.js", "4444", "--host", "0.0.0.0" ]
