import { fork } from 'child_process'
import baileys from '@adiwajshing/baileys-md'
import { BufferJSON, WABrowserDescription } from '@adiwajshing/baileys-md'
import got from 'got'

import { redis } from './redis'
import { mkcredskey } from './rediskeys'
import { Signupconnection } from './schema/ConnAdm'
import { makeCountyToken } from './jwt'
import { rediskeys } from './docs'

interface Birth {
  type: 'jwt',
  mitochondria: string;
  shard: string;
  jwt: string;
  timestamp: string;
}

const zygote = function zygote (signupconnection: Signupconnection): Promise<Birth> {
  return new Promise((res, rej) => {
    const { mitochondria, shard, url, cacapa } = signupconnection
    const browser: WABrowserDescription = ['BROODERHEN', 'Chrome', '95'] 
    let lastQrcode = ''

    // TODO PROM-CLIENT SIGNUP_START
    const socket = baileys({
      printQRInTerminal: true, 
      browser
    })
    socket.ev.on('connection.update', async (update) => {
      if(update.connection === 'close') {
        // TODO PROM-CLIENT SIGNUP_SIGNIN

        // esta segunda coneção já poderia ser feita no connect, estudar isso
        const socket2 = baileys({
          auth: socket.authState,
          browser
        })
        socket2.ev.on ('auth-state.update', () => {
          const user = socket2.user
          const jid = user.id.split(':')[0]
          if (jid === shard) {

            // 'TODO PROM-CLIENT SIGNUP_SUCCESS'
            setTimeout(async () => {
              const authInfo = socket2.authState
              const value = JSON.stringify(authInfo, BufferJSON.replacer, 2)
              await redis.set(mkcredskey({ shard }), value)
              await socket2.logout()

              const jwt = makeCountyToken({ shard })

              // TODO PROM-CLIENT SIGNUP_JWT

              const timestamp = (new Date()).toLocaleString('pt-BR')
              const bornskey = rediskeys.bornskey
              const birth: Birth = { type: 'jwt', mitochondria, shard, jwt, timestamp }
              const birthcert = JSON.stringify(birth)

              const pipeline = redis.pipeline()
              pipeline.sadd(bornskey, birthcert)
              pipeline.lpush(lastQrcode, birthcert)
              pipeline.expire(lastQrcode, 90)

              await Promise.all([
                pipeline.exec(),
                got.post(url, {
                  json: birth,
                }).catch(console.error)
              ])

              if (process.send) {
                process.send('SHUTDOWN_ME')
              }

              res(birth)
            }, 10_000)
          } else {
            rej()
            if (process.send) {
              process.send('SHUTDOWN_ME')
            }
          }
        })
      } else if(update.qr) {
        lastQrcode = update.qr || ''
        const response = {
          type: 'qr',
          qr: update.qr
        }

        got.post(url, {
          json: response
        }).catch(console.error)

        // TODO PROM-CLIENT SIGNUP_QRCODE

        const pipeline = redis.pipeline()
        pipeline.lpush(cacapa, JSON.stringify(response))
        pipeline.expire(cacapa, 90)
        pipeline.exec()

        console.dir({ qr: update.qr })
      }
    })
  })
}


const zygotePC = function zygotePC (signupconnection: Signupconnection) {
  const { type, hardid, mitochondria, shard, url, cacapa } = signupconnection
  const zgt = fork('./src/index', {
    env: {
      ...process.env,
      SERVICE: 'zygote',
      type,
      hardid,
      mitochondria,
      shard,
      url,
      cacapa
    }
  })

  zgt.on('close', el => {
    console.log('zgt close')
    console.dir(el)
  })
  zgt.on('disconnect',  () => {
    console.log('zgt disconnect')
  })
  zgt.on('listening', el => {
    console.log('zgt listening')
    console.dir(el)
  })
  zgt.on('message', el => {
    if (el === 'SHUTDOWN_ME') {
      zgt.kill('SIGINT')
    }
    console.log('zgt message')
    console.dir(el)
  })
  zgt.on('error', el => {
    console.log('zgt error')
    console.dir(el)
  })
  zgt.on('exit', el => {
    console.log('zgt exit')
    console.dir(el)
  })
}

export {
  zygote,
  zygotePC
}