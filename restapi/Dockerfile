FROM node:16 AS stage1
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ic
RUN npm prune --production

FROM node:16-alpine
WORKDIR /usr/src/app
COPY --from=stage1 /usr/src/app/node_modules /usr/src/app/node_modules

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]