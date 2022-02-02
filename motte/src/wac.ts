import { fork } from 'child_process'
import { readFileSync, writeFileSync, rmSync } from 'fs'
import { Connect, Disconnect, Connectionstate, isConnAdm } from '@gmapi/types'
import baileys, { BufferJSON, WABrowserDescription, AuthenticationCreds, SignalDataTypeMap, proto, downloadContentFromMessage, WASocket } from '@adiwajshing/baileys-md'
import { client as redis, mkbookphonekey, mkwebhookkey, panopticbotkey, mkboxenginebotkey, Bread, mkbotkey } from '@gmapi/redispack'
import baileys2gmapi from '@gmapi/baileys2gmapi'
import { patchpanel } from './patchpanel'
import { minio } from './minio'

const midiaMessage = ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage']
const midiaMessageMap = {
  imageMessage: 'image',
  videoMessage: 'video',
  documentMessage: 'document',
  audioMessage: 'audio'
}

let whatsappsocket: WASocket
process.on('message', async (message: Bread) => {
  console.log(process.env.SERVICE || 'MAIN')
  console.dir(message)
  console.dir(whatsappsocket.sendMessage)

  if (whatsappsocket) {
    if (message.type === 'sendTextMessage') {
      const { to, msg, cacapa } = message
      const posfix = to.indexOf('-') === -1 ? 's.whatsapp.net' : 'g.us'
      const id = `${to}@${posfix}`
      console.log(`id=${id}`)
      const sentmessage = await whatsappsocket.sendMessage(id, { text: msg })
      // console.dir({ sentmessage })
    } else if (message.type === 'sendReadReceipt') {
      const { jid, participant, wid } = message
      console.log('sendReadReceipt')

      await whatsappsocket.sendReadReceipt(jid, participant, [wid])

    } else  if (message.type === 'sendPresenceAvailable') {
      const { jidto } = message
      console.log('sendPresenceAvailable')

      await whatsappsocket.sendPresenceUpdate('available', jidto)

    }
  }
})

interface SendTextMessage {
  type: "sendTextMessage";
  hardid: string;
  shard: string;
  to: string;
  msg: string;
  cacapa: string;
}


type ConnectionActions = Connect | Disconnect | Connectionstate | SendTextMessage

const KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
  'pre-key': 'preKeys',
  'session': 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory'
}

/**
 * Whats App Connect
 * @param connect
 * @returns
 */
const wac = function wac (connect: Connect): Promise<string> {
  // the creds file path
  console.log(`connect.auth=${connect.auth}`)

  let creds: AuthenticationCreds
  let keys: any = { }

  const saveConnect = (filename: string) => {
    const result = JSON.parse(readFileSync(filename, { encoding: 'utf-8' }),BufferJSON.reviver)
    const saveState = () => {
      console.log('saving auth state')
      writeFileSync(
        filename,
        JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
      )
    }

    creds = result.creds
    keys = result.keys

    return {
      state: {
        creds,
        keys: {
          get: (type, ids) => {
            const key = KEY_MAP[type]
            return ids.reduce(
              (dict, id) => {
                let value = keys[key]?.[id]
                if(value) {
                  if(type === 'app-state-sync-key') {
                    value = proto.AppStateSyncKeyData.fromObject(value)
                  }
                  dict[id] = value
                }
                return dict
              }, { }
            )
          },
          set: (data) => {
            for(const _key in data) {
              const key = KEY_MAP[_key as keyof SignalDataTypeMap]
              keys[key] = keys[key] || { }
              Object.assign(keys[key], data[_key])
            }
            saveState()
          }
        }
      },
      saveState
    }
  }

  const webhookP = redis.hmget(mkwebhookkey({ shard: connect.shard }), 'main', 'teams', 'spy')

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
      socket.ev.on ('chats.set', ({ chats }) => {
        console.log('chats.set')

        const pipeline = redis.pipeline()
        pipeline.lpush(connect.cacapa, JSON.stringify({ type: 'connected' }))
        pipeline.expire(connect.cacapa, 90)
        pipeline.exec().catch(console.error)
      })
      socket.ev.on ('chats.update', () => {
        console.log('chats.update')
      })
      socket.ev.on ('chats.upsert', chat => {
        console.log('chats.upsert')
        console.dir(chat)
      })
      socket.ev.on ('connection.update', async ({ connection, lastDisconnect }) => {
        console.log(`connection.update ${connection}`)
        console.dir({ connection, lastDisconnect })
        // const [whMain, whTeams, whSpy] = await webhookP

        if (connection) {
          panopticbotkey
          const type = 'zuckershark'
          await redis.xadd(panopticbotkey, '*', 'type', type, 'whatsapp', connect.shard, 'connection', connection)
        }

        // deixa o socket servido pro IPC fácil
        if(!whatsappsocket && connection === 'open') {
          whatsappsocket = socket
        }

        if (connection === 'close') {
          //
          const err = lastDisconnect.error
          const data = lastDisconnect.date

          const err2 = err as any
          const statusCode = err2?.output?.statusCode
          if (statusCode === 401) {
            console.log(`apagando ${connect.auth}`)
            rmSync(connect.auth)
            const boxenginebotkey = mkboxenginebotkey({
              shard: connect.shard
            })

            const orgid_teamid = await redis.hget(boxenginebotkey, 'gsadmin')
            const botkey = mkbotkey({
              shard: orgid_teamid
            })
            await redis
              .pipeline()
              .hdel(botkey, 'whatsapp')
              .del(boxenginebotkey)
          }

          console.log('## process.exit(1) ##')
          process.exit(1)
        }
      })
      socket.ev.on ('contacts.upsert', async () => {
        console.log('contacts.upsert')
      })
      socket.ev.on ('group-participants.update', ({ id, participants, action }) => {
        console.log(`group-participants.update ${id}`)
        console.dir({ participants, action })
      })
      socket.ev.on ('groups.update', partialGroupInfo => {
        console.log('groups.update')
        console.dir(partialGroupInfo)
      })
      // socket.ev.on ('message-info.update', messageInfo => {
      //   console.log('message-info.update')
      //   console.dir(messageInfo)
      // })
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
          const cleanMessage = messages
            .map(baileys2gmapi)

          const [whMain, whTeams, whSpy] = await webhookP

          const allwait = []

          cleanMessage.forEach(async (json, idx) => {
            if (!json.nada && json.from !== 'status') {
              const type = 'zaphook'
              const data = JSON.stringify(json)
              // redis.xadd(panopticbotkey, '*', 'type', type, 'data', data, 'whatsapp', connect.shard)

              // const jidfrom = json.from.length > 14 ? `${json.from}@g.us` : `${json.from}@s.whatsapp.net`
              // const participant = json.author ? `${json.author}@s.whatsapp.net` : undefined
              // allwait.push(socket.sendReadReceipt(jidfrom, participant, [json.wid]))

              if (midiaMessage.includes(json.type)) {
                // fragile message[json.type]
                const original = messages[idx]?.message[json.type]
                if (original) {
                  const bucketName = process.env.MINIO_BUCKET
                  const stream = await downloadContentFromMessage(original, midiaMessageMap[json.type])
                  let ext
                  switch (json.type) {
                    case 'audioMessage':
                      ext = '.ogg'
                      break;
                    case 'imageMessage':
                      ext = '.jpeg'
                      break;
                    case 'videoMessage':
                      ext = '.mp4'
                      break;
                    case 'documentMessage':
                      ext = `_${json.filename}`
                      break;
                  }
                  const objectName = `${connect.shard}/${json.from}/${json.timestamp}_${json.wid}${ext}`
                  const metaData = { 'Content-Type': json.mimetype }

                  allwait.push(new Promise((res, rej) => {
                    minio.putObject(bucketName, objectName, stream, null, metaData, (err, data) => {
                      if(!err) {
                        minio.presignedGetObject(bucketName, objectName, (err, url) => {
                          if(!err) {
                            const data = JSON.stringify({
                              ...json,
                              url
                            })
                            res(redis.xadd(panopticbotkey, '*', 'type', type, 'data', data, 'whatsapp', connect.shard))
                          } else {
                            rej(err)
                          }
                        })
                      } else {
                        rej(err)
                      }
                    })
                  }))


                }
              } else {
                const data = JSON.stringify(json)
                allwait.push(redis.xadd(panopticbotkey, '*', 'type', type, 'data', data, 'whatsapp', connect.shard))
              }

            }
          })

          await Promise.all(allwait)

          // [ ] salvar nos minio
        } else if (type === 'append') {
          const chatMessages = messages
            .filter(el => !el.messageStubType)
            .filter(el => !el.status)

          if (chatMessages.length > 0) {
            const jids = new Set()
            chatMessages.forEach(m => {
              if(m.key.remoteJid) {
                jids.add(m.key.remoteJid)
              }
            })

            // redis allowedJids
            console.log(`allowedJids ${Array.from(jids).join(', ')}`)
            //mkbookphonekey

            const pipeline = redis.pipeline()
            const bookphonekey = mkbookphonekey({ shard: connect.shard })
            for(const jid of jids) {
              pipeline.hsetnx(bookphonekey, jid, 'nodatayet')
            }
            await pipeline.exec()
          }
        } else {
          console.log('any ')
          console.log(JSON.stringify({ messages, type }, null, 2))
        }
      })
      socket.ev.on ('presence.update', ({ id, presences }) => {
        console.log(`presence.update ${id} ${presences}}`)
      })

      // socket.fetchPrivacySettings()
    } else {
      rej("connectionActions.type === 'connect' && isConnect(connectionActions)")
    }
  })
}

const wacPC = async (connectionActions: ConnectionActions) => {
  switch (connectionActions.type) {
    case 'connect':
      if (isConnAdm.isConnect(connectionActions) && !patchpanel.has(connectionActions.shard)) {
        const { type, hardid, shard, cacapa } = connectionActions
        console.log('wacPC connect')

        const wacP = fork('./dist/index', {
          env: {
            ...process.env,
            SERVICE: 'wac',
            type,
            hardid,
            shard,
            cacapa,
            // ignore 2x :s
            auth: `./auth_info_multi/${shard}.json`
          }
        })

        patchpanel.set(connectionActions.shard, {
          connected: false,
          connecting: true,
          wacP
        })

        wacP.on('close', el => {
          console.log('wacP close')
          patchpanel.delete(connectionActions.shard)
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
      } else {
        console.log("JÁ TÁ CONECTADO")
      }
      break
    case 'connectionstate':
      console.log('wacPC connectionstate')
      if (isConnAdm.isConnectionstate(connectionActions)) {
        const { type, shard, hardid, cacapa } = connectionActions
        if (patchpanel.has(shard)) {
          const blueCable = patchpanel.get(shard)
          console.log(`connectionstate=${blueCable?.connected ? 'connected' : 'connecting'}`)
        } else {
          console.log('connectionstate trashed')
        }
      }
      break
    case 'disconnect':
      if (isConnAdm.isDisconnect(connectionActions)) {
        // mata processo
        const { type, hardid, shard, cacapa } = connectionActions
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
    case 'sendTextMessage':
      if (patchpanel.has(connectionActions.shard)) {
        console.log(`patchpanel[${connectionActions.shard}] sendTextMessage`)
        const { type, hardid, shard, to, msg, cacapa } = connectionActions
        const blueCable = patchpanel.get(shard)
        const wacP = blueCable.wacP
        wacP.send({
          type,
          hardid,
          shard,
          to,
          msg,
          cacapa
        })
      } else {
        console.log('sendTextMessage não tá conectado')
      }
      break
    case 'sendReadReceipt':
      if (patchpanel.has(connectionActions.shard)) {
        console.log(`patchpanel[${connectionActions.shard}] sendReadReceipt`)
        const { type, hardid, shard, from, participant, wid } = connectionActions

        const jid = `${ from }@${ from.length > 14 ? 'g.us' : 's.whatsapp.net' }`

        const blueCable = patchpanel.get(shard)
        const wacP = blueCable.wacP
        wacP.send({
          type,
          hardid,
          shard,
          jid,
          participant,
          wid
        })
      }
      break
    case 'sendPresenceAvailable':
      if (patchpanel.has(connectionActions.shard)) {
        console.log(`patchpanel[${connectionActions.shard}] sendPresenceAvailable`)
        const { type, hardid, shard, jidto } = connectionActions
        const blueCable = patchpanel.get(shard)
        const wacP = blueCable.wacP
        wacP.send({
          type,
          hardid,
          shard,
          jidto
        })
      }
      break
  }
}

export {
  wac,
  wacPC
}
