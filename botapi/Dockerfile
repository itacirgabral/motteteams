FROM node:16-alpine
WORKDIR /usr/src/app

EXPOSE 3978

COPY ./node_modules ./
COPY ./package-lock.json ./
COPY ./package.json ./

COPY ./src/.env.example ./src.env
COPY ./src ./

ENV TZ="America/Cuiaba"

CMD [ "npm", "start" ]