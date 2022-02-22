FROM node:16-alpine

WORKDIR /app

COPY ./node_modules ./
COPY ./package-lock.json ./
COPY ./package.json ./

COPY ./.env.example ./.env
COPY ./dist ./

# RUN npm install

ENV TZ="America/Cuiaba"

CMD [ "npm", "start" ]