FROM node:16-alpine
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ic --registry http://192.168.0.54:4873

COPY src src

EXPOSE 3978

CMD [ "npm", "start" ]