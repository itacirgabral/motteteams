import { setTimeout } from 'timers/promises'
import * as uWS from 'uWebSockets.js'
import { client as redis, panoptickey, mkcacapakey } from '@gmapi/redispack'
import { nanoid } from 'nanoid'
import jsonwebtoken from 'jsonwebtoken'
import qrcode from 'qrcode'

const hardid = process.env.HARDID || ''

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
          if (body.username === 'admin' && body.password === hardid) {
            res.writeHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              url,
              jwt: jsonwebtoken.sign(JSON.stringify({
                id: body.username,
                roles: [scope]
              }), hardid),
              scope
            }))
          } else {
            res.writeHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              url,
              body,
              scope
            }))
          }
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

    let user
    try {
      user = auth ? jsonwebtoken.verify(auth, hardid) : { }
    } catch {
      user = { }
    }

    // await setTimeout(1000)

    if (upgradeAborted.aborted) {
      return
    } else {
      res.upgrade({
        url,
        user
      },
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context)
    }
  },
  open: async (ws) => {
    console.dir(ws)

    if (!ws.user?.id) {
      ws.send(JSON.stringify({
        type: 'warning',
        message: 'You have 5 seconds to do signin'
      }))

      await setTimeout(5_000)

      if (!ws.getTopics().includes('onlineuser')) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'you are loguted'
        }))
        ws.close()
      }
    } else {
      // send welcome
      ws.send(JSON.stringify({
        type: 'welcome',
        message: `Welcome ${ws.user.id}@${Array.isArray(ws.user.roles) ? ws.user.roles.join('_') : ' '}`
      }))
    }
  },
  message: async (ws, arraBuffer, isBinary) => {
    const message = Buffer.from(arraBuffer).toString('utf8')
    const topics = ws.getTopics()
    //const remote = Buffer.from(ws.getRemoteAddressAsText()).toString('utf8')

    let body: {
      type: string;
      role?: string;
      whatsapp?: string
    } | string

    try {
      body = JSON.parse(message)
    } catch {
      body = message
    }

    if (typeof(body) === 'object' && body?.type ) {
      console.dir(body)
      switch (body.type) {
        case 'getTopics':
          // await setTimeout(1000)
          ws.send(JSON.stringify({
            type: 'getTopics',
            topics
          }))
          break
        case 'signin':
          if (ws.user?.id === 'admin') {
            ws.subscribe('onlineadmin')
            if (body?.role) {
              ws.subscribe(body.role)
            }
          }
          ws.subscribe('onlineuser')
          break
        case 'signupconnection':
          if (ws.user?.id === 'admin') {
            const mitochondria = 'WEBSOCKET'
            const type = 'signupconnection'
            const url = 'whatever'
            const shard = 'whatever'
            const cacapaListResponse = mkcacapakey()

            await redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', shard, 'mitochondria', mitochondria, 'cacapa', cacapaListResponse, 'url', url)
 
            // espera na caçapa pelo código
            const listResponde0 = await redis.blpop(cacapaListResponse, 40)
            const listDate0 = JSON.parse(listResponde0[1])

            const pngBase64 = await qrcode.toDataURL(listDate0.qr)
            ws.send(JSON.stringify({
              type: 'QRCode',
              qrcode: listDate0.qr,
              pngBase64
            }))

            // espera na caçapa pela conexão
            const [, listResponde1] = await redis.blpop(cacapaListResponse, 40).catch(() => ([, '_timeout_']))
            if (listResponde1 !== '_timeout_') {
              const listDate1 = JSON.parse(listResponde1)
              console.dir(listDate1)
              ws.send(JSON.stringify({
                type: 'connect',
                whatsapp: listDate1.shard
              }))
              if (!ws.getTopics().includes(listDate1.shard)) {
                ws.subscribe(listDate1.shard)
              }
            }
          }
          break
        case 'connect':
          if (ws.user?.id === 'admin' && body.whatsapp) {
            const type = 'connect'
            const cacapaListResponse = mkcacapakey()
            redis.xadd(panoptickey, '*', 'hardid', hardid, 'type', type, 'shard', body.whatsapp, 'cacapa', cacapaListResponse)

            const [, listResponde0] = await redis.blpop(cacapaListResponse, 40).catch(() => ([, '_timeout_']))
            if (listResponde0 !== '_timeout_') {
              const listDate0 = JSON.parse(listResponde0)
              ws.send(JSON.stringify({
                type: 'connect',
                whatsapp: listDate0.shard
              }))
              if (!ws.getTopics().includes(listDate0.shard)) {
                ws.subscribe(listDate0.shard)
              }
            }
          }
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
