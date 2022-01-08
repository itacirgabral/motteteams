import { fork } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import got from 'got'
import nano from 'nano'
import { Connect, Disconnect, Connectionstate, isConnAdm } from '@gmapi/types'
import baileys, { BufferJSON, WABrowserDescription, AuthenticationCreds, SignalDataTypeMap, proto, AuthenticationState  } from '@adiwajshing/baileys-md'
import { client as redis, mkbookphonekey, mkwebhookkey, mkattkey, mkattmetakey } from '@gmapi/redispack'
import baileys2gmapi from '@gmapi/baileys2gmapi'
import { patchpanel } from './patchpanel'

type ConnectionSwitch = Connect | Disconnect | Connectionstate

const coudhdbUrl = process.env.COUCHDB_URL || 'http://localhost:5984'
console.log(`coudhdbUrl=${coudhdbUrl}`)
const couch = nano(coudhdbUrl)
const jsonStore = couch.db.use('gestormessenger')

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
      socket.ev.on ('chats.set', ({ chats, messages }) => {
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
        console.dir({ lastDisconnect })
        const [whMain, whTeams, whSpy] = await webhookP
        if (connection || lastDisconnect) {
          if (whMain) {
            got.post(whMain, {
              json: {
                connection,
                lastDisconnect
              }
            }).catch(console.error)
          }
          if (whTeams) {
            got.post({
              url: whTeams,
              json: {
                type: 'message',
                attachments: [{
                  contentType: 'application/vnd.microsoft.card.adaptive',
                  contentUrl: null,
                  content:{
                    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                    type: 'AdaptiveCard',
                    version: '1.2',
                    body:[{
                      type: 'RichTextBlock',
                      inlines: [{
                        type: 'TextRun',
                        text: JSON.stringify({
                          connection,
                          lastDisconnect
                        })
                      }]
                    }]
                  }
                }]
              }
            })
          }
          // extra webhook
          if (whSpy) {
            got.post(whSpy, {
              json: {
                connection,
                lastDisconnect
              }
            }).catch(console.error)
          }
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
          const cleanMessage = messages
            .map(baileys2gmapi)

          const [whMain, whTeams, whSpy] = await webhookP

          cleanMessage.forEach(json => {
            // redis atendimento
            const attid = json.from
            // mkattkey, mkattmetakey
            const attkey = mkattkey({
              shard: connect.shard,
              attid
            })
            const attmetakey = mkattmetakey({
              shard: connect.shard,
              attid
            })
            // salvar no redis, sem duplicar
            const pipeline = redis.pipeline()
            pipeline.xadd(attkey, '*', 'type', 'zapfront', 'data', JSON.stringify(json))
            pipeline.xlen(attkey)
            pipeline.hsetnx(attmetakey, 'status', JSON.stringify({ stage: 0 }))

            pipeline.exec().then(([[err0, _xid], [err1, attlen], [err2, isFirst]]) => {
              if (isFirst) {
                console.log(`iniciando atendimento ${connect.shard}:${attid}`)
              } else {
                console.log(`${attlen}-ésima de ${connect.shard}:${attid}`)
              }
            }).catch(console.error)

            // couchdb
            jsonStore.insert(json)

            // webhook
            if (whMain) {
              got.post(whMain, {
                json
              }).catch(console.error)
            }

            //teams
            if (whTeams) {
              got.post({
                url: whTeams,
                json: {
                  type: 'message',
                  attachments: [{
                    contentType: 'application/vnd.microsoft.card.adaptive',
                    contentUrl: null,
                    content:{
                      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
                      type: 'AdaptiveCard',
                      version: '1.2',
                      body:[{
                        type: 'RichTextBlock',
                        inlines: [{
                          type: 'TextRun',
                          text: JSON.stringify(json, null, 2)
                        }]
                      }]
                    }
                  }]
                }
              })
            }

            // extra webhook
            if (whSpy) {
              got.post(whSpy, {
                json
              }).catch(console.error)
            }
          })

          // TODO
          // [x] salvar no redis
          // [x] salvar no couchdb
          // [ ] salvar nos minio
        } else if (type === 'prepend') {
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
        } else if (type === 'append') {
          //
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
            // ignore 2x :s
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
