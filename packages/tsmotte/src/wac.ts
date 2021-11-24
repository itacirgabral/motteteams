import { fork } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { Connect, Disconnect, Connectionstate, isConnAdm } from '@gmapi/types'
import baileys, { BufferJSON, WABrowserDescription, initInMemoryKeyStore, AuthenticationState  } from '@adiwajshing/baileys-md'
import { client as redis, mkbookphonekey, mkchatkey } from '@gmapi/redispack'
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
  // the creds file path 
  console.log(`connect.auth=${connect.auth}`)

  let state: AuthenticationState
  const saveConnect = (filename: string) => {
    const saveState = () => {
      console.log('saving auth state saveConnect')
      const toWrite = JSON.stringify(state, BufferJSON.replacer, 2)
      writeFileSync(filename, toWrite)
    }
    const { creds, keys } = JSON.parse(readFileSync(filename, { encoding: 'utf-8' }), BufferJSON.reviver)
    state = {
      creds: creds, 
      keys: initInMemoryKeyStore(keys, saveState) 
    }

    return { state, saveState }
  }

  return new Promise((res, rej) => {
    if(connect.type === 'connect' && isConnAdm.isConnect(connect)) {
      console.log('iniciando o processo BAILEY CONNECT')
      const browser: WABrowserDescription = ['GMAPI2', 'Chrome', '95']

      const { state, saveState } = saveConnect(connect.auth)
      const socket = baileys({
        auth: state,
        browser
      })

      socket.ev.on('creds.update', saveState)

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
        const { type, hardid, shard, cacapa } = connectionSwitch
        console.log('wacPC connect')

        const wacP = fork('./src/index', {
          env: {
            ...process.env,
            SERVICE: 'wac',
            type,
            hardid,
            shard,
            cacapa,
            auth: `./auth_info_multi.${shard}.json`
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

/**
import makeWASocket, { BufferJSON, useSingleFileAuthState } from '@adiwajshing/baileys-md'
import * as fs from 'fs'

// utility function to help save the auth state in a single file
// it's utility ends at demos -- as re-writing a large file over and over again is very inefficient
const { state, saveState } = useSingleFileAuthState('./auth_info_multi.json')

// will use the given state to connect
// so if valid credentials are available -- it'll connect without QR

const conn = makeSocket({ auth: state }) 

// this will be called as soon as the credentials are updated
conn.ev.on ('creds.update', saveState)

 */