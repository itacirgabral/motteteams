import { setTimeout } from 'timers/promises'
import * as uWS from 'uWebSockets.js'
import { client as redis, panoptickey, mkcacapakey, mkbotkey, mkboxenginebotkey } from '@gmapi/redispack'
import { nanoid } from 'nanoid'
import jsonwebtoken from 'jsonwebtoken'
import qrcode from 'qrcode'
import queryString from 'query-string'
import fetch from 'isomorphic-fetch'

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
    console.log('upgrade')
    const upgradeAborted = { aborted: false }
    res.onAborted(() => {
      upgradeAborted.aborted = true
    })

    /* You MUST copy data out of req here, as req is only valid within this immediate callback */
    const pathname = req.getUrl().split('/').filter(el => el)

    const secWebSocketKey = req.getHeader('sec-websocket-key')
    const secWebSocketProtocol = req.getHeader('sec-websocket-protocol')
    const secWebSocketExtensions = req.getHeader('sec-websocket-extensions')
    
    const authHeader = req.getHeader('authorization').split('Bearer ').pop() as string
    const query = queryString.parse(req.getQuery())
    const authQuery = query?.jwt as string
    const auth = authHeader || authQuery

    let user
    try {
      user = auth ? jsonwebtoken.verify(auth, hardid) : { }
    } catch {
      user = { }
    }

    const whatsapp = query.whatsapp ? query.whatsapp : undefined
    // await setTimeout(1000)

    if (upgradeAborted.aborted) {
      return
    } else {
      res.upgrade({
        pathname,
        user,
        whatsapp
      },
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context)
    }
  },
  open: async (ws) => {
    console.log('open')
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
        message: `Welcome ${ws.user.id}@${Array.isArray(ws.user.roles) ? ws.user.roles.join('_') : ' '}`,
        url: ws.user?.url,
        query: ws.user?.query,
      }))
    }
  },
  message: async (ws, arraBuffer, isBinary) => {
    const message = Buffer.from(arraBuffer).toString('utf8')
    const topics = ws.getTopics()
    //const remote = Buffer.from(ws.getRemoteAddressAsText()).toString('utf8')

    let body: {
      type: string;
      channel?: string;
      whatsapp?: string;
      teamsid?: string;
      to?: string;
      msg?: string;
      link?: string; 
      mimetype?: string;
      filename?: string;
      email?: string;
      senha?: string;
      jwt?: string;
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
        case 'register':
          if (body.channel) {
            ws.subscribe(body.channel)
          }
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
        case 'bridge':
          if (ws.user?.id === 'admin' && body.whatsapp && body.teamsid) {
            const boxenginebotkey = mkboxenginebotkey({ shard: body.whatsapp })
            const botkey = mkbotkey({ shard: body.teamsid })
            const pipeline = redis.pipeline()
            pipeline.hset(botkey, 'whatsapp', body.whatsapp)
            pipeline.hset(boxenginebotkey, 'gsadmin', body.teamsid)
            await pipeline.exec()
            ws.send(JSON.stringify({
              type: 'bridge',
              whatsapp: body.whatsapp,
              teamsid: body.teamsid
            }))
          }
          break
        case 'respondercomtextosimples':
          if (ws.user?.id === 'admin' && body.whatsapp && body.to && body.msg) {
            const type = 'respondercomtextosimples'
            await redis.xadd(panoptickey, '*',
            'hardid', hardid,
            'type', type,
            'shard', body.whatsapp,
            'to', body.to,
            'msg', body.msg,
            'cacapa', 'random123')
            ws.send(JSON.stringify({
              type,
              whatsapp: body.whatsapp,
              to: body.to,
              msg: body.msg
            }))
          }
          break
        case 'respondercomarquivo':
          if (ws.user?.id === 'admin' && body.whatsapp && body.link && body.mimetype && body.filename) {
            const type = 'respondercomarquivo'
            await redis.xadd(panoptickey, '*',
            'hardid', hardid,
            'type', type,
            'shard', body.whatsapp,
            'to', body.to,
            'link', body.link,
            'mimetype', body.mimetype,
            'filename', body.filename,
            'cacapa', 'random123')
            ws.send(JSON.stringify({
              type,
              whatsapp: body.whatsapp,
              to: body.to,
              link: body.link,
              mimetype: body.mimetype,
              filename: body.filename
            }))
          }
          break
        case 'gestorsistema/auth/login':
          if (body.email && body.senha) {
            const userLoginResponde = await fetch('https://api.gestorsistemas.com/api/auth/login', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email: body.email, password: body.senha }),
              redirect: 'follow'
            })

            const aux = await userLoginResponde.json()
            const type = 'gestorsistema/user'
            ws.send(JSON.stringify({
              type,
              user: aux.data?.user?.data
            }))
          }
        break
        case 'msteams/user':
          if (body.jwt) {
            console.log('############')
            console.log('msteams/user')
            console.log(body.jwt)
            console.log('msteams/user')
            console.log('############')
            // cria hset tokens
            /*
              // HSET movies:11002 title "Star Wars: Episode V - The Empire Strikes Back" plot "Luke Skywalker begins Jedi training with Yoda." release_year 1980 genre "Action" rating 8.7 votes 1127635
              // FT.CREATE idx:movies ON hash PREFIX 1 "movies:" SCHEMA title TEXT SORTABLE release_year NUMERIC SORTABLE rating NUMERIC SORTABLE genre TAG SORTABLE
              // FT.SEARCH idx:movies * SORTBY release_year ASC RETURN 2 title release_year
            */
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

const appPort = process.env.APP_PORT || '8080'
app.listen(Number(appPort), listenSocket => {
  if (listenSocket) {
    const port = uWS.us_socket_local_port(listenSocket)
    console.log('Listening to port ' + port)
  }
})
