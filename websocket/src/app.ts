import * as uWS from 'uWebSockets.js'

const app = uWS.App()

app.post('/auth/:scope', (res, req) => {
  res.onAborted(() => {
    res.aborted = true
  })

  const url = req.getUrl()
  const scope = req.getParameter(0)

  const bodyArray: Array<string> = []
  res.onData(async (ab, isLast) => {
    const chunk = Buffer.from(ab)
    bodyArray.push(chunk.toLocaleString())

    if (isLast) {
      try {
        const body = JSON.parse(bodyArray.join(''))
        if (!res.aborted) {
          res.writeHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ url, body, scope }))
        }
      } catch (err) {
        console.error(err)
        res.writeStatus('500')
        res.end()
      }
    }
  })
})

app.ws('/*', {
  compression: uWS.SHARED_COMPRESSOR,
  maxPayloadLength: 16 * 1024 * 1024,
  idleTimeout: 10,
  maxBackpressure: 1024,
  open: (ws) => {
    // /* Let this client listen to all sensor topics */
    // ws.subscribe('home/sensors/#');
  },
  drain: (ws) => {

  },
  close: (ws, code, message) => {
    /* The library guarantees proper unsubscription at close */
  },
  upgrade: (res, req, context) => {
    const auth = req.getHeader('authorization').split('Bearer ').pop()
    const url = req.getUrl()
    const query = req.getQuery()
    console.log(`upgrade url=${url} query=${query} auth=${auth}`)

    res.upgrade({
      url: req.getUrl()
    },
    /* Spell these correctly */
    req.getHeader('sec-websocket-key'),
    req.getHeader('sec-websocket-protocol'),
    req.getHeader('sec-websocket-extensions'),
    context)
  },
  message: (ws, arraBuffer, isBinary) => {
    const message = Buffer.from(arraBuffer).toString('utf8')
    try {
      const body = JSON.parse(message)
      console.dir(body)

      ws.send(JSON.stringify({ nanoid: '123456' }))
      //  ws.publish('home/sensors/temperature', message);
    } catch (err) {
      console.error(err)
    }
  }
})

app.listen(8080, listenSocket => {
  if (listenSocket) {
    console.dir({ listenSocket })
    // uWS.us_listen_socket_close(listenSocket)
  }
})
