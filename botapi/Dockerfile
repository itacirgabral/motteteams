
  
FROM node:16-alpine AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ic

COPY . .
RUN npm run build

FROM amd64/alpine
COPY --from=builder /usr/src/app/server.js /server.js

ENTRYPOINT node /server.js
