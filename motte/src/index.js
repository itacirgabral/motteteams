const { WAConnection } = require('@adiwajshing/baileys')
const Redis = require('ioredis')

const zapHandlers = require('./zapHandlers')
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

                  zapHandlers({ conn, seed })

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
