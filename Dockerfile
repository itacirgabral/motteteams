FROM node:16

WORKDIR /usr/src/gmapipack

COPY ./botapi/bin/index ./msteams.bin
COPY ./websocket/bin//app ./websocket.bin
COPY ./motte/bin/index ./motte.bin

CMD [ "websocket.bin" ]