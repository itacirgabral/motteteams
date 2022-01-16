import { fork } from 'child_process'
import { writeFileSync, renameSync, existsSync, rmSync } from 'fs'
import baileys, { BufferJSON, SignalDataTypeMap, WABrowserDescription, initAuthCreds, proto } from '@adiwajshing/baileys-md'
import { client as redis, bornskey } from '@gmapi/redispack'
import { Signupconnection } from '@gmapi/types'
import { makeCountyToken } from './jwt'

const KEY_MAP: { [T in keyof SignalDataTypeMap]: string } = {
  'pre-key': 'preKeys',
  'session': 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory'
}

interface Birth {
  type: 'jwt',
  mitochondria: string;
  shard: string;
  jwt: string;
  timestamp: string;
  qrcode: string;
  auth: string;
}

const saveSignup = (filename: string) => {
  const creds = initAuthCreds()
  const keys = { }

  const saveState = () => {
    console.log('saving auth state')
    writeFileSync(
      filename,
      JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
    )
  }

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

const zygote = function zygote (signupconnection: Signupconnection): Promise<Birth> {
  return new Promise((res, rej) => {
    const { mitochondria, /*shard, url,*/ cacapa } = signupconnection
    const browser: WABrowserDescription = ['GMAPI2', 'Chrome', '95']
    let lastQrcode = ''

    const zygotetempcreds = `./auth_info_multi.zygote.${String(Math.random()).slice(2)}.json`

    const { state, saveState } = saveSignup(zygotetempcreds)

    // TODO PROM-CLIENT SIGNUP_START
    const socket = baileys({
      printQRInTerminal: true,
      auth: state,
      browser
    })

    socket.ev.on('creds.update', saveState)

    socket.ev.on('connection.update', async (update) => {
      const me = socket.authState.creds.me?.id.split(':')[0] || ''
      // me override shard param

      if(update.connection === 'close') {
        const auth = cacapa
        const jwt = makeCountyToken({ shard: me })

        const timestamp = (new Date()).toLocaleString('pt-BR')
        const newFileName = `./auth_info_multi/${me}.json`
        const isNotNew = existsSync(newFileName)
        if (isNotNew) {
          const birth: Birth = {
            type: 'jwt',
            mitochondria,
            shard: 'nops',
            jwt,
            timestamp,
            qrcode: lastQrcode,
            auth
          }

          rmSync(zygotetempcreds)

          if (process.send) {
            process.send(birth)
          }
          res(birth)
        } else {
          renameSync(zygotetempcreds, newFileName)

          const birth: Birth = {
            type: 'jwt',
            mitochondria,
            shard: me,
            jwt,
            timestamp,
            qrcode: lastQrcode,
            auth
          }
          const birthcert = JSON.stringify(birth)

          const pipeline = redis.pipeline()
          pipeline.sadd(bornskey, birthcert)
          pipeline.rpush(cacapa, birthcert)
          pipeline.expire(cacapa, 90)

          pipeline.exec().then(() => {
            if (process.send) {
              process.send(birth)
            }
            res(birth)
          })
        }



      } else if(update.qr) {
        lastQrcode = update.qr || ''
        const response = {
          shard: me,
          type: 'qr',
          qr: update.qr
        }

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