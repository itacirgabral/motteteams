FROM node:14 AS stage1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ic
RUN npm prune --production

FROM node:14-alpine
WORKDIR /usr/src/app
COPY --from=stage1 /usr/src/app/node_modules /usr/src/app/node_modules

COPY . .

CMD [ "npm", "start" ]