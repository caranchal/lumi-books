FROM node:24-alpine

WORKDIR /app

COPY package.json ./
COPY src ./src
COPY public ./public

ENV NODE_ENV=production
ENV DATA_DIR=/data

VOLUME ["/data"]
EXPOSE 3002

CMD ["node", "src/server.js"]
