const { WAConnection } = require('@adiwajshing/baileys')
const Redis = require('ioredis')

const mkBlocklistUpdate = require('./events/mkBlocklistUpdate')
const mkChatNew = require('./events/mkChatNew')
const mkChatUpdate = require('./events/mkChatUpdate')
const mkChatsReceived = require('./events/mkChatsReceived')
const mkChatsUpdate = require('./events/mkChatsUpdate')
const mkClose = require('./events/mkClose')
const mkConnecting = require('./events/mkConnecting')
const mkConnectionPhoneChange = require('./events/mkConnectionPhoneChange')
const mkConnectionValidated = require('./events/mkConnectionValidated')
const mkContactsReceived = require('./events/mkContactsReceived')
const mkContactUpdate = require('./events/mkContactUpdate')
const mkCredentialsUpdated = require('./events/mkCredentialsUpdated')
const mkGroupParticipantsUpdate = require('./events/mkGroupParticipantsUpdate')
const mkGroupUpdate = require('./events/mkGroupUpdate')
const mkMessageNew = require('./events/mkMessageNew')
const mkMessageStatusUpdate = require('./events/mkMessageStatusUpdate')
const mkMessageUpdate = require('./events/mkMessageUpdate')
const mkOpen = require('./events/mkOpen')
const mkQr = require('./events/mkQr')
const mkReceivedPong = require('./events/mkReceivedPong')
const mkUserPresenceUpdate = require('./events/mkUserPresenceUpdate')
const mkUserStatusUpdate = require('./events/mkUserStatusUpdate')
const mkWsClose = require('./events/mkWsClose')

const fifoDrumer = require('./fifoDrumer')
const zygote = require('./zygote')

const redisConn = process.env.REDIS_CONN
const myhardid = process.env.HARDID
const description = process.env.APP_DESCRIPTION || 'Baileys'
const version = process.env.APP_VERSION || '3.3.1'
const healthreportinterval = process.env.HEALTHREPORTINTERVAL
let healthreportintervalid = 0
const panoptickey = 'zap:panoptic'
const catcherrKey = 'zap:catcherr'

const patchpanel = new Map()

const actbooting = JSON.stringify({ type: 'booting', hardid: myhardid, timestamp: Date.now() })
const mkactbigerr = ({ err }) => JSON.stringify({ type: 'bigerr', hardid: myhardid, err, timestamp: Date.now() })
const mkhealthreport = () => JSON.stringify({ type: 'healthreport', hardid: myhardid, totalconnections: patchpanel.size, timestamp: Date.now() })

const speaker = new Redis(redisConn)
const listener = new Redis(redisConn)

const trafficwand = async () => {
  let sisyphus = true
  while (sisyphus) {
    try {
      // open the while loop
      sisyphus = false
      await speaker.publish(panoptickey, actbooting)

      // promise gate
      let gracefuldownresolver
      const gracefuldownpromise = new Promise((resolve, reject) => {
        gracefuldownresolver = resolve
      })

      // screw on the redis
      await listener.subscribe(panoptickey)
      listener.on('message', async (channel, message) => {
        const { hardid, type, ...leftover } = JSON.parse(message)

        // is it to me?
        if (hardid === myhardid) {
          switch (type) {
            case 'gracefuldown':
              clearInterval(healthreportintervalid)
              gracefuldownresolver()
              break
            case 'connect':
              if (!patchpanel.has(leftover.shard)) {
                const conn = new WAConnection()

                const seed = {
                  shard: leftover.shard,
                  redis: speaker,
                  conn
                }

                const creds = await speaker.get(`zap:${leftover.shard}:creds`)
                if (creds) {
                  conn.browserDescription = [description, 'Chrome', version]
                  const authInfo = JSON.parse(creds)
                  conn.connectOptions.alwaysUseTakeover = true
                  conn.loadAuthInfo(authInfo)

                  conn.on('open', mkOpen(seed))
                  conn.on('connecting', mkConnecting(seed))
                  conn.on('connection-validated', mkConnectionValidated(seed))
                  conn.on('close', mkClose(seed))
                  conn.on('ws-close', mkWsClose(seed))
                  conn.on('credentials-updated', mkCredentialsUpdated(seed))
                  conn.on('qr', mkQr(seed))
                  conn.on('connection-phone-change', mkConnectionPhoneChange(seed))
                  conn.on('user-status-update', mkUserStatusUpdate(seed))
                  conn.on('chat-new', mkChatNew(seed))
                  conn.on('contacts-received', mkContactsReceived(seed))
                  conn.on('chats-received', mkChatsReceived(seed))
                  conn.on('chats-update', mkChatsUpdate(seed))
                  conn.on('chat-update', mkChatUpdate(seed))
                  conn.on('message-status-update', mkMessageStatusUpdate(seed))
                  conn.on('message-update', mkMessageUpdate(seed))
                  conn.on('group-participants-update', mkGroupParticipantsUpdate(seed))
                  conn.on('group-update', mkGroupUpdate(seed))
                  conn.on('received-pong', mkReceivedPong(seed))
                  conn.on('blocklist-update', mkBlocklistUpdate(seed))
                  conn.on('contact-update', mkContactUpdate(seed))
                  conn.on('message-new', mkMessageNew(seed))
                  conn.on('user-presence-update', mkUserPresenceUpdate(seed))

                  await conn.connect()

                  seed.drummer = fifoDrumer({ ...seed, conn, redisB: listener.duplicate() })

                  patchpanel.set(leftover.shard, seed)

                  console.log(`connect ${leftover.shard}`)
                }
              }
              break
            case 'disconnect':
              if (patchpanel.has(leftover.shard)) {
                const seed = patchpanel.get(leftover.shard)
                patchpanel.delete(leftover.shard)

                seed.drummer.playing = false
                seed.conn.close()

                console.log(`disconnect ${leftover.shard}`)
              }
              break
            case 'signupconnection':
              zygote({ leftover })
              break
          }
        }
      })

      // I'm OK bro
      await speaker.publish(panoptickey, mkhealthreport())
      healthreportintervalid = setInterval(async () => {
        await speaker.publish(panoptickey, mkhealthreport())
      }, Number(healthreportinterval))

      // promise gate door
      await gracefuldownpromise
      console.log('gracefuldown')
    } catch (err) {
      // lock the while loop
      sisyphus = true

      const actbigerr = mkactbigerr({ err })
      const warnlogs = await Promise.all([
        speaker.publish(panoptickey, actbigerr),
        speaker.lpush(catcherrKey, actbigerr)
      ])

      console.error(warnlogs)
    }
  }

  process.exit(0)
}

trafficwand()
