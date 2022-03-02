import { setTimeout } from 'timers/promises'
import * as uWS from 'uWebSockets.js'
import { nanoid } from 'nanoid'
import jsonwebtoken from 'jsonwebtoken'

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

app.get('/*', (res, req) => {
  res.writeStatus('202')
  res.end()
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
    console.log('WebSocket backpressure: ' + ws.getBufferedAmount())
  },
  close: (ws, code, message) => {
    /* The library guarantees proper unsubscription at close */
  },
  upgrade: async (res, req, context) => {
  const upgradeAborted = { aborted: false }
  res.onAborted(() => {
    upgradeAborted.aborted = true
  })

  /* You MUST copy data out of req here, as req is only valid within this immediate callback */
  const url = req.getUrl()
  const secWebSocketKey = req.getHeader('sec-websocket-key')
  const secWebSocketProtocol = req.getHeader('sec-websocket-protocol')
  const secWebSocketExtensions = req.getHeader('sec-websocket-extensions')
  const auth = req.getHeader('authorization').split('Bearer ').pop()

  // await setTimeout(1000)

  if (upgradeAborted.aborted) {
    return
  } else {
    res.upgrade({
      url: url
    },
    secWebSocketKey,
    secWebSocketProtocol,
    secWebSocketExtensions,
    context)
  }

  },
  message: async (ws, arraBuffer, isBinary) => {
    const message = Buffer.from(arraBuffer).toString('utf8')

    const remote = Buffer.from(ws.getRemoteAddressAsText()).toString('utf8')

    const topics = ws.getTopics()
    console.log(`remote=${remote} topis=[${topics.join(', ')}]`)

    let body: {
      type: string;
    } | string

    try {
      body = JSON.parse(message)
    } catch {
      body = message
    }

    if (typeof(body) === 'object' && body?.type ) {
      switch (body.type) {
        case 'getRandomNanoId':
          // await setTimeout(1000)
          ws.send(JSON.stringify({
            type: 'id',
            you: remote,
            topics,
            id: nanoid()
          }))
          break
      }
    } else {
      console.dir({ message })
    }
  },
  ping: (ws, message) => {
    // console.log(`ping ${message}`)
  },
  pong: (ws, message) => {
    // console.log(`pong ${message}`)
  }
})

app.listen(8080, listenSocket => {
  if (listenSocket) {
    const port = uWS.us_socket_local_port(listenSocket)
    console.log('Listening to port ' + port)
  }
})
