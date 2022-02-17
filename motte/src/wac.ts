import { fork } from 'child_process'
import { readFileSync, writeFileSync, rmSync } from 'fs'
import { Connect, Disconnect, Connectionstate, isConnAdm } from '@gmapi/types'
import baileys, { BufferJSON, WABrowserDescription, AuthenticationCreds, SignalDataTypeMap, proto, downloadContentFromMessage, WASocket } from '@gmapi/baileys'
import { client as redis, mkbookphonekey, mkwebhookkey, panopticbotkey, mkboxenginebotkey, Bread, mkbotkey, mkchatkey, mkfifokey, stream2bread } from '@gmapi/redispack'
import baileys2gmapi from '@gmapi/baileys2gmapi'
import { patchpanel } from './patchpanel'
import { minio } from './minio'

import { Redis } from 'ioredis'
const trafficwandGen = async function * trafficwandGen ({ redis, streamkey, startAt = '$', stopAt }: { redis: Redis; streamkey: string; startAt?: string; stopAt?: string }) {
  const redisBlock = redis.duplicate()
  let lastlogid = startAt
  let ends = false
  while (!ends) {
    const stream = await redisBlock.xread('BLOCK', 0, 'STREAMS', streamkey, lastlogid)
    for (const county of stream) {
      // const countyHead = county[0]
      const countyBody = county[1]
      for (const log of countyBody) {
        const logHead = log[0]
        const logBody = log[1]
        lastlogid = logHead

        if (stopAt && lastlogid.localeCompare(stopAt) === 1) {
          ends = true
        } else {
          const bread = stream2bread({ log: logBody })
          yield bread
        }
      }
    }
  }
}

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
  if (whatsappsocket) {
    if (message.type === 'sendTextMessage') {
      const { to, msg, cacapa } = message
      const posfix = to.indexOf('-') === -1 ? 's.whatsapp.net' : 'g.us'
      const id = `${to}@${posfix}`
      console.log(`id=${id} sendTextMessage`)
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

    } else  if (message.type === 'getallchats') {
      // /////////////////////////////// //
      // seria cosultado direto do redis //
      // /////////////////////////////// //

      // const { shard } = message
      // console.log(`get all chats of ${shard}`)
      // const type = 'chatlistupdate'
      // const chatkeys = mkchatkey({ shard, chatid: '*' })
      // const chatids = await redis.keys(chatkeys)
      // await redis.xadd(panopticbotkey, '*', 'type', type, 'whatsapp', shard, 'chats', JSON.stringify(chatids))
    } else if (message.type === 'getchatinfo') {
      const chatkey = mkchatkey({ shard: message.shard, chatid: message.chat })
      const hadChat = await redis.exists(chatkey)

      if (hadChat) {
        if (message.chat.length > 14) {
          // group
          const jid = `${ message.chat }@g.us`
          const [
            profile,
            status,
            groupMetadata
          ] = await Promise.all([
            whatsappsocket.profilePictureUrl(jid, 'image'),
            whatsappsocket.fetchStatus(jid),
            whatsappsocket.groupMetadata(jid)
          ])

          const groupInfoTxt = JSON.stringify({
            isGroup: true,
            profile,
            status,
            groupMetadata
          })

          // respoder na cacapa
          const pipeline = redis.pipeline()
          pipeline.lpush(message.cacapa, groupInfoTxt)
          pipeline.expire(message.cacapa, 90)
          await pipeline.exec()

        } else {
          // person
          const jid = `${ message.chat }@s.whatsapp.net`
          const [
            profile,
            status,
            businessProfile
          ] = await Promise.all([
            whatsappsocket.profilePictureUrl(jid, 'image'),
            whatsappsocket.fetchStatus(jid),
            whatsappsocket.getBusinessProfile(jid)
          ])

          // respoder na cacapa
          const personInfoTxt = JSON.stringify({
            isGroup: false,
            profile,
            status,
            businessProfile
          })
          const pipeline = redis.pipeline()
          pipeline.lpush(message.cacapa, personInfoTxt)
          pipeline.expire(message.cacapa, 90)
          await pipeline.exec()
        }

      } else {
        console.log('nops')
        // cacapa -> chat não reconhecido
      }


      // const [result] = await sock.onWhatsApp(id)
      // const status = await sock.fetchStatus("xyz@s.whatsapp.net")
      // for low res picture
      // const ppUrl = await sock.profilePictureUrl("xyz@g.us")
      // for high res picture
      // const ppUrl = await sock.profilePictureUrl("xyz@g.us", 'image')
      // onst profile = await sock.getBusinessProfile("xyz@s.whatsapp.net")
      // const metadata = await sock.groupMetadata("abcd-xyz@g.us")

      // await redis.xadd(panopticbotkey, '*', 'type', type, 'whatsapp', connect.shard, 'connection', connection)
    } else if (message.type === 'sendFileMessage') {
      const { to, link, mimetype, filename, cacapa } = message
      const posfix = to.indexOf('-') === -1 ? 's.whatsapp.net' : 'g.us'
      const id = `${to}@${posfix}`
      console.log(`id=${id} sendFileMessage`)

      const sentmessage = await whatsappsocket.sendMessage(id, {
        document: {
          url: link
        },
        fileName: filename,
        mimetype
      })
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

  return new Promise((wacRes, wacRej) => {
    if(connect.type === 'connect') {
      console.log('iniciando o processo BAILEY CONNECT')
      const browser: WABrowserDescription = ['GMTeams', 'Chrome', '97']

      const { state, saveState } = saveConnect(connect.auth)
      const socket = baileys({
        auth: state,
        browser
      })

      socket.ev.on('creds.update', saveState)
      socket.ev.on ('connection.update', async ({ connection, lastDisconnect }) => {
        console.log(`connection.update ${connection}`)
        console.dir({ connection, lastDisconnect })
        // const [whMain, whTeams, whSpy] = await webhookP

        if (connection) {
          const type = 'zuckershark'
          await redis.xadd(panopticbotkey, '*', 'type', type, 'whatsapp', connect.shard, 'connection', connection)
        }

        if(!whatsappsocket && connection === 'open') {
          whatsappsocket = socket // deixa o socket servido pro IPC fácil

          if (connect.drummerStartAt === 'agora' && connect.drummerStopAt === 'nunca') {
            const fifokey = mkfifokey({ shard: connect.shard })
            const breads = trafficwandGen({ redis, streamkey: fifokey })

            for await (const bread of breads) {
              console.dir(bread)
            }
            console.log(`drummer ${fifokey} finish `)
          }
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
              .exec()
          }

          console.log('## process.exit(1) ##')
          process.exit(1)
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

      // CHATS
      socket.ev.on ('chats.delete', ids => {
        console.log(`chats.delete ${ids}`)
      })
      socket.ev.on ('chats.set', ({ chats }) => {
        console.log('chats.set')

        const toSet = new Map<string, number>()
        const toDel = new Set<string>()

        chats.forEach(el => {
          // o delete não funciona
          // aparentemente também se reflete aqui
          // é quando vem sem timestamp Long {}
          const chatid = el.id
          const timestamp = Number(el.conversationTimestamp)
          if (Number.isInteger(timestamp) && timestamp > 0) {
            if (toSet.has(chatid)) {
              const lastTimestamp = toSet.get(chatid)
              if (timestamp > lastTimestamp) {
                toSet.set(chatid, timestamp)
              }
            } else {
              toSet.set(chatid, timestamp)
            }
          } else {
            toDel.add(chatid)
            console.log(`toDel ${chatid}`)
          }
        })

        const pipeline = redis.pipeline()
        toSet.forEach((timestamp, jid) => {
          const chatkey = mkchatkey({
            shard: connect.shard,
            chatid: jid.split('@')[0]
          })
          pipeline.hset(chatkey, 'timestamp', timestamp)
        })
        toDel.forEach(jid => {
          const chatkey = mkchatkey({
            shard: connect.shard,
            chatid: jid.split('@')[0]
          })
          pipeline.del(chatkey)
        })

        // chats.set -> con ready
        pipeline.lpush(connect.cacapa, JSON.stringify({ type: 'connected' }))
        pipeline.expire(connect.cacapa, 90)

        pipeline.exec().catch(console.error)
      })
      socket.ev.on ('chats.update', updates => {
        console.log('chats.update')

        const toSet = new Map<string, number>()
        const toDel = new Set<string>()
        updates.forEach(el => {
          const chatid = el.id
          const timestamp = Number(el.conversationTimestamp)
          if (Number.isInteger(timestamp) && timestamp > 0) {
            if (toSet.has(chatid)) {
              const lastTimestamp = toSet.get(chatid)
              if (timestamp > lastTimestamp) {
                toSet.set(chatid, timestamp)
              }
            } else {
              toSet.set(chatid, timestamp)
            }
          } else {
            toDel.add(chatid)
            console.log(`toDel ${chatid}`)
          }
        })

        const pipeline = redis.pipeline()
        toSet.forEach((timestamp, jid) => {
          const chatkey = mkchatkey({
            shard: connect.shard,
            chatid: jid.split('@')[0]
          })
          pipeline.hset(chatkey, 'timestamp', timestamp)
        })
        toDel.forEach(jid => {
          const chatkey = mkchatkey({
            shard: connect.shard,
            chatid: jid.split('@')[0]
          })
          pipeline.del(chatkey)
        })
        pipeline.exec().catch(console.error)

      })
      socket.ev.on ('chats.upsert', chats => {
        console.log("CHAT ABORDAGEM")
        console.log('chats.upsert')
        console.log(JSON.stringify(chats, null, 2))
      })

      // CONTACTS
      socket.ev.on ('contacts.update', async contact => {
        console.log('contacts.update')
        const pipeline = redis.pipeline()
        contact.forEach(el => {
          // contacts.upsert
          const { id, imgUrl, name, notify, status } = el
          const cid = id.split('@')[0]
          const bookphonekey = mkbookphonekey({ shard: connect.shard, cid })
          if (imgUrl) {
            pipeline.hset(bookphonekey, 'imgUrl', imgUrl)
          }
          if (name) {
            pipeline.hset(bookphonekey, 'name', name)
          }
          if (notify) {
            pipeline.hset(bookphonekey, 'notify', notify)
          }
          if (status) {
            pipeline.hset(bookphonekey, 'status', status)
          }
        })
        await pipeline.exec()
      })
      socket.ev.on ('contacts.upsert', async contact => {
        console.log('contacts.upsert')
      })

      // GROUPS
      socket.ev.on ('group-participants.update', ({ id, participants, action }) => {
        console.log(`group-participants.update ${id}`)
        console.dir({ participants, action })
      })
      socket.ev.on ('groups.update', async partialGroupInfo => {
        console.log('groups.update')
        console.dir(partialGroupInfo)

        const pipeline = redis.pipeline()
        partialGroupInfo.forEach(el => {
          const { id, announce, creation, desc, descId, descOwner, ephemeralDuration, owner, participants, restrict, subject } = el

          const cid = id.split('@')[0]
          const bookphonekey = mkbookphonekey({ shard: connect.shard, cid })
          if (announce !== undefined) {
            // announce is set when the group only allows admins to write messages
            pipeline.hset(bookphonekey, 'announce', announce)
          }
          if (restrict !== undefined) {
            // restrict is set when the group only allows admins to change group settings
            pipeline.hset(bookphonekey, 'restrict', restrict)
          }
          if (subject) {
            pipeline.hset(bookphonekey, 'subject', subject)
          }
          if (owner) {
            pipeline.hset(bookphonekey, 'owner', owner)
          }
          if (descOwner) {
            pipeline.hset(bookphonekey, 'descOwner', descOwner)
          }
          if (descId) {
            pipeline.hset(bookphonekey, 'descId', descId)
          }
          if (desc) {
            pipeline.hset(bookphonekey, 'desc', desc)
          }
          if (creation) {
            pipeline.hset(bookphonekey, 'creation', creation)
          }
          if (ephemeralDuration) {
            pipeline.hset(bookphonekey, 'ephemeralDuration', ephemeralDuration)
          }
        })
        await pipeline.exec()
      })
      socket.ev.on ('groups.upsert', el => {
        console.log('groups.upsert')
        console.dir(el)
      })

      // MESSAGES
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
          console.log('type append')
          // baloes de meta mensagens, tipo "vc é adm agora"
        } else {
          console.log('type ')
          console.log(JSON.stringify({ messages, type }, null, 2))
        }
      })
      socket.ev.on ('presence.update', ({ id, presences }) => {
        console.log(`presence.update ${id} ${presences}}`)
      })
    } else {
      wacRej("connectionActions.type === 'connect' && isConnect(connectionActions)")
    }
  })
}

const wacPC = async (connectionActions: ConnectionActions) => {
  // encontra o processo correto e despacha
  switch (connectionActions.type) {
    case 'connect':
      if (isConnAdm.isConnect(connectionActions) && !patchpanel.has(connectionActions.shard)) {
        const { type, hardid, shard, cacapa } = connectionActions
        console.log('wacPC connect')

        // busca onde o baterista deve
        // começar e terminar
        // envia por env

        const wacP = fork('./dist/index', {
          env: {
            ...process.env,
            SERVICE: 'wac',
            type,
            hardid,
            shard,
            cacapa,
            drummerStartAt: 'agora',
            drummerStopAt: 'nunca',
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
    case 'waclist':
      return JSON.stringify(Array.from(patchpanel.keys()))
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
    case 'getallchats':
      console.log(`patchpanel[${connectionActions.shard}] getallchats`)
      if (patchpanel.has(connectionActions.shard)) {
        const { type, hardid, shard } = connectionActions
        const blueCable = patchpanel.get(shard)
        const wacP = blueCable.wacP
        wacP.send({
          type,
          hardid,
          shard
        })

      }
      break
    case 'getchatinfo':
      console.log(`patchpanel[${connectionActions.shard}] getchatinfo`)

      // apenas se tiver conectado?
      if (patchpanel.has(connectionActions.shard)) {
        const { type, hardid, shard, chat, cacapa } = connectionActions
        const blueCable = patchpanel.get(shard)
        const wacP = blueCable.wacP
        wacP.send({
          type,
          hardid,
          shard,
          chat,
          cacapa
        })
      }
      break
    // o baterista que vai mandar mensagens
    case 'sendFileMessage':
      if (patchpanel.has(connectionActions.shard)) {
        console.log(`patchpanel[${connectionActions.shard}] sendFileMessage`)
        const { type, hardid, shard, to, link, mimetype, filename, cacapa } = connectionActions
        const blueCable = patchpanel.get(shard)
        const wacP = blueCable.wacP
        wacP.send({
          type,
          hardid,
          shard,
          to,
          link,
          mimetype,
          filename,
          cacapa
        })
      } else {
        console.log('sendFileMessage não tá conectado')
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
  }
}

export {
  wac,
  wacPC
}
