import { fork } from 'child_process'
import * as fs from 'fs'
import * as pfs from 'fs/promises'
import { Connect, Disconnect, Connectionstate, isConnAdm } from '@gmapi/types'
import baileys, { BufferJSON, WABrowserDescription, initInMemoryKeyStore  } from '@adiwajshing/baileys-md'
import { client as redis, mkcredskey, mkbookphonekey, mkchatkey } from '@gmapi/redispack'
import baileys2gmapi from '@gmapi/baileys2gmapi'
import { patchpanel } from './patchpanel'

type ConnectionSwitch = Connect | Disconnect | Connectionstate

// import nano from 'nano'
// const coudhdbUrl = process.env.COUCHDB_URL || 'http://localhost:5984'
// const couch = nano(coudhdbUrl)
// const jsonStore = couch.db.use('gestormessenger')

// console.log(`coudhdbUrl=${coudhdbUrl}`)

/**
 * Whats App Connect
 * @param connect 
 * @returns 
 */
const wac = function wac (connect: Connect): Promise<string> {
  const authFile = fs.readFileSync(connect.auth, 'utf8')
  fs.unlinkSync(connect.auth)

  let state: unknown

  const saveState = ()  => {
    const { creds, keys } = JSON.parse(authFile, BufferJSON.reviver)
    state = { 
      creds: creds, 
      // stores pre-keys, session & other keys in a JSON object
      // we deserialize it here
      keys: initInMemoryKeyStore(keys, saveState) 
    }
    return { state, saveState }
  }

  return new Promise((res, rej) => {
    if(connect.type === 'connect' && isConnAdm.isConnect(connect)) {
      console.log('iniciando o processo BAILEY CONNECT')
      const browser: WABrowserDescription = ['GMAPI2', 'Chrome', '95']

      const authJSON = JSON.parse(authFile, BufferJSON.reviver)
      const auth = { 
        creds: authJSON.creds, 
        keys: initInMemoryKeyStore(authJSON.keys, saveState) 
      }

      console.log('PARSEOU')

      const socket = baileys({
        auth,
        browser
      })

      socket.ev.on ('creds.update', saveState)
      // socket.ev.on ('auth-state.update', () => {
      //   const authInfo = socket.authState
      //   const authJson = JSON.stringify(authInfo, BufferJSON.replacer, 2)

      //   const user = socket.user
      //   const shard= user.id.split(':')[0]

      //   redis.set(mkcredskey({ shard }), authJson)
      //     .then(() => {
      //       res(shard)
      //     })
      // })
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
      socket.ev.on ('contacts.upsert', async (contact) => {
        const contacts = contact.map(el => ({
          name: el.notify || '',
          number: el.id.split('@')[0]
        }))

        const chatkey = mkchatkey({ shard: connect.shard })

        const pipeline = redis.pipeline()
        contacts.forEach(el => {
          pipeline.hset(chatkey, el.number, JSON.stringify(el))
        })

        await pipeline.exec()
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
      socket.ev.on ('messages.upsert', async ({ messages, type }) => {
        console.log('messages.upsert')
        if (type === 'notify') {
          const cleanMessage = messages.map(baileys2gmapi)
          console.dir(cleanMessage)
          // TODO
          // salvar no redis
          // salvar no couchdb
          // salvar nos minio
        } else if (type === 'prepend') {
          // enum WebMessageInfoStubType
          const formatedMessages = messages.map(m => {
            return {
              agendaName: m.messageStubParameters?.length === 1 ?
                m.messageStubParameters[0] :
                undefined,
              jid: m.key.remoteJid,
              save: m.messageStubType === 99 || m.messageStubType === 65
            }
          })


          // "douglas si@556584784558@s.whatsapp.net"
          const uniqueEntries = Array.from(new Set(
            formatedMessages
              .filter(el => el.save)
              .map(({ agendaName, jid}) => `${agendaName}@${jid}`)
          ))

          const bookphonekey = mkbookphonekey({ shard: connect.shard })
          const pipeline = redis.pipeline()
          uniqueEntries.forEach(el => {
            const [agendaName, number] = el.split('@')
            pipeline.hset(bookphonekey, number, JSON.stringify({ agendaName, number}))
          })
  
          await pipeline.exec()

        }
      })
      socket.ev.on ('presence.update', ({ id, presences }) => {
        console.log(`presence.update ${id} ${presences}}`)
      })

      // socket.fetchPrivacySettings()
    } else {
      rej("connectionSwitch.type === 'connect' && isConnect(connectionSwitch)")
    }
  })
}

const wacPC = async (connectionSwitch: ConnectionSwitch) => {
  switch (connectionSwitch.type) {
    case 'connect':
      if (isConnAdm.isConnect(connectionSwitch) && !patchpanel.has(connectionSwitch.shard)) {
        const { type, hardid, shard, cacapa, auth } = connectionSwitch
        console.log('wacPC connect')

        // auth can be too large to pass as env
        const authPathRandom = String(Math.random()).slice(2)
        await pfs.writeFile(authPathRandom, JSON.stringify(auth))

        const wacP = fork('./src/index', {
          env: {
            ...process.env,
            SERVICE: 'wac',
            type,
            hardid,
            shard,
            cacapa,
            auth: authPathRandom
          }
        })

        patchpanel.set(connectionSwitch.shard, {
          connected: false,
          connecting: true,
          wacP
        })

        wacP.on('close', el => {
          console.log('wacP close')
          patchpanel.delete(connectionSwitch.shard)
          console.dir(el)
        })
        wacP.on('disconnect',  () => {
          console.log('wacP disconnect')
        })
        wacP.on('listening', el => {
          console.log('wacP listening')
          console.dir(el)
        })
        wacP.on('message', (el: string) => {
          // update patchpanel state
          const { type, ...body } = JSON.parse(el)
          switch (type) {
            case 'SHUTDOWN_ME':
              patchpanel.delete(shard)  
              wacP.kill('SIGINT')
              break
            default:
              console.log('wacP message')
              console.dir(el)
              break
          }
        })
        wacP.on('error', el => {
          console.log('wacP error')
          console.dir(el)
        })
        wacP.on('exit', el => {
          console.log('wacP exit')
          console.dir(el)
        })
      }
      break
    case 'connectionstate':
      console.log('wacPC connectionstate')
      if (isConnAdm.isConnectionstate(connectionSwitch)) {
        const { type, shard, hardid, cacapa } = connectionSwitch
        if (patchpanel.has(shard)) {
          const blueCable = patchpanel.get(shard)
          console.log(`connectionstate=${blueCable?.connected ? 'connected' : 'connecting'}`)
        } else {
          console.log('connectionstate trashed')
        }
      }
      break
    case 'disconnect':
      if (isConnAdm.isDisconnect(connectionSwitch)) {
        // mata processo
        const { type, hardid, shard, cacapa } = connectionSwitch
        if (patchpanel.has(shard)) {
          const blueCable = patchpanel.get(shard)
          if (blueCable && (blueCable.connected || blueCable.connecting)) {
            // kill now
            // patchpanel.delete(shard)  
            blueCable.wacP.kill('SIGINT')
          }
        }
      }
      break
  }
}

export {
  wac,
  wacPC
}