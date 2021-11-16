import { fork } from 'child_process'
import baileys, { BufferJSON, WABrowserDescription } from '@adiwajshing/baileys-md'
import got from 'got'

import { client as redis, mkcredskey } from 'redispack'
import { Signupconnection } from 'types'
import { makeCountyToken } from './jwt'
import { bornskey } from 'redispack'

interface Birth {
  type: 'jwt',
  mitochondria: string;
  shard: string;
  jwt: string;
  timestamp: string;
  qrcode: string;
  auth: string;
}

const zygote = function zygote (signupconnection: Signupconnection): Promise<Birth> {
  return new Promise((res, rej) => {
    const { mitochondria, shard, url, cacapa } = signupconnection
    const browser: WABrowserDescription = ['GMAPI2', 'Chrome', '95'] 
    let lastQrcode = ''

    // TODO PROM-CLIENT SIGNUP_START
    const socket = baileys({
      printQRInTerminal: true, 
      browser
    })
    socket.ev.on('connection.update', async (update) => {
      if(update.connection === 'close') {

        const authInfo = socket.authState
        const authJson = JSON.stringify(authInfo, BufferJSON.replacer, 2)

        const pipeline = redis.pipeline()
        pipeline.set(mkcredskey({ shard }), authJson)
        
        const jwt = makeCountyToken({ shard })
        const timestamp = (new Date()).toLocaleString('pt-BR')

        const birth: Birth = {
          type: 'jwt',
          mitochondria,
          shard,
          jwt,
          timestamp,
          qrcode: lastQrcode,
          auth: authJson
        }
        const birthcert = JSON.stringify(birth)

        pipeline.sadd(bornskey, birthcert)
        pipeline.lpush(lastQrcode, birthcert)
        pipeline.expire(lastQrcode, 90)

        Promise.all([
          pipeline.exec(),
          got.post(url, {
            json: birth,
          }).catch(console.error)
        ]).then(() => {
          if (process.send) {
            process.send(birth)
          }
          res(birth)
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

    socket.ev.on ('blocklist.set', ({ blocklist }) => {
      console.log('blocklist.set')
      console.dir(blocklist)
    })
    socket.ev.on ('blocklist.update', ({ blocklist, type }) => {
      console.log(`blocklist.update ${type}`)
      console.dir(blocklist)
    })
    socket.ev.on ('chats.delete', id => {
      console.log(`chats.delete ${id}`)
    })
    socket.ev.on ('chats.set', ({ chats, messages }) => {
      console.log('chats.set')
      console.dir({
        chats,
        messages
      })
    })
    socket.ev.on ('chats.update', partialChat => {
      console.log('chats.update')
      console.dir(partialChat)
    })
    socket.ev.on ('chats.upsert', chat => {
      console.log('chats.upsert')
      console.dir(chat)
    })
    socket.ev.on ('connection.update', ({ connection, lastDisconnect }) => {
      console.log(`connection.update ${connection}`)
      console.dir({ lastDisconnect })
    })
    socket.ev.on ('contacts.upsert', contact => {
      console.log('contacts.upsert')
      console.dir(contact)
    })
    socket.ev.on ('group-participants.update', ({ id, participants, action }) => {
      console.log(`group-participants.update ${id}`)
      console.dir({ participants, action })
    })
    socket.ev.on ('groups.update', partialGroupInfo => {
      console.log('groups.update')
      console.dir(partialGroupInfo)
    })
    socket.ev.on ('message-info.update', messageInfo => {
      console.log('message-info.update')
      console.dir(messageInfo)
    })
    socket.ev.on ('messages.delete', (idxs) => {
      console.log('messages.delete')
      console.dir(idxs)
    })
    socket.ev.on ('messages.update', messageUpdate => {
      console.log('messages.update')
      console.dir(messageUpdate)
    })
    socket.ev.on ('messages.upsert', ({ messages, type }) => {
      console.log(`messages.upsert ${type}`)
      console.dir(messages)
    })
    socket.ev.on ('presence.update', ({ id, presences }) => {
      console.log(`presence.update ${id} ${presences}}`)
    })

  })
}


const zygotePC = function zygotePC (signupconnection: Signupconnection): Promise<Birth> {
  return new Promise((res, rej) => {
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

    zgt.on('message', (birth: Birth) => {
      zgt.kill('SIGINT')
      res(birth)
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
    zgt.on('error', el => {
      console.log('zgt error')
      console.dir(el)
    })
    zgt.on('exit', el => {
      console.log('zgt exit')
      console.dir(el)
    })
  })
}

export {
  zygote,
  zygotePC
}