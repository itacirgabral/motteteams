const { WAConnection } = require('@adiwajshing/baileys')
const Redis = require('ioredis')

const zapHandlers = require('./zapHandlers')
const fifoDrumer = require('./fifoDrumer')
const punkDrummer = require('./punkDrummer')
const zygote = require('./zygote')
const gqlzygote = require('./gqlzygote')
const sendHook = require('./sendHook')

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
              console.log(`gracefuldown ${hardid}`)

              await speaker.sadd(
                `zap:${hardid}:upuntilreboot`,
                ...Array.from(patchpanel.keys()).map(shard => `county:${hardid}:zap:${shard}`)
              )
              clearInterval(healthreportintervalid)
              gracefuldownresolver()
              break
            case 'connect':
              if (!patchpanel.has(leftover.shard)) {
                const conn = new WAConnection()

                const seed = {
                  shard: leftover.shard,
                  hardid,
                  redis: speaker,
                  conn
                }

                const creds = await speaker.get(`zap:${leftover.shard}:creds`)
                if (creds) {
                  const authInfo = JSON.parse(creds)
                  conn.loadAuthInfo(authInfo)
                  conn.browserDescription = [description, 'Chrome', version]

                  zapHandlers({ conn, seed })

                  // conn.logger.level = 'trace'

                  patchpanel.set(leftover.shard, seed)

                  let errcon = false
                  await conn.connect()
                    .catch(() => {
                      patchpanel.delete(leftover.shard)
                      errcon = true
                    })
                  console.log(`${errcon ? 'tried to ' : ''}connect ${leftover.shard}`)
                }
              } else {
                const notifysent = {
                  type: 'sendhook',
                  hardid, // send to myself
                  shard: leftover.shard,
                  json: JSON.stringify({
                    type: 'opened',
                    shard: leftover.shard,
                    reason: 'it was already opened'
                  })
                }
                speaker.publish(panoptickey, JSON.stringify(notifysent))
              }
              break
            case 'disconnect':
              if (patchpanel.has(leftover.shard)) {
                const seed = patchpanel.get(leftover.shard)
                patchpanel.delete(leftover.shard)

                if (seed?.fifoDrummer?.playing) {
                  seed.fifoDrummer.playing = false
                }
                if (seed?.punkDrummer?.playing) {
                  seed.punkDrummer.playing = false
                  // manda uma mensagem vazia
                  // para o punk ver o novo valor
                  seed.redis.publish(`zap:${seed.shard}:spread`, '{}')
                }

                seed.conn.close()

                console.log(`disconnect ${leftover.shard}`)
              } else {
                const notifysent = {
                  type: 'sendhook',
                  hardid, // send to myself
                  shard: leftover.shard,
                  json: JSON.stringify({
                    type: 'closed',
                    shard: leftover.shard,
                    reason: 'it was already closed'
                  })
                }
                speaker.publish(panoptickey, JSON.stringify(notifysent))
              }
              break
            case 'disconnectsilent':
              if (patchpanel.has(leftover.shard)) {
                const seed = patchpanel.get(leftover.shard)
                patchpanel.delete(leftover.shard)

                if (seed?.fifoDrummer?.playing) {
                  seed.fifoDrummer.playing = false
                }
                if (seed?.punkDrummer?.playing) {
                  seed.punkDrummer.playing = false
                  seed.redis.publish(`zap:${seed.shard}:spread`, '{}')
                }

                seed.conn.close()
              }
              break
            case 'signupconnection':
              zygote({ leftover, hardid })
              break
            case 'gql.signupconnection':
              gqlzygote({ leftover, hardid })
              break
            case 'sendhook':
              sendHook({ redis: speaker, json: leftover.json, file: leftover.file, shard: leftover.shard, params: leftover.params })
              break
            case 'queuerestart':
              if (patchpanel.has(leftover.shard)) {
                const seed = patchpanel.get(leftover.shard)
                if (seed.conn.state === 'open') {
                  // descongestiona
                  const lastRawKey = `zap:${leftover.shard}:last:rawBread`
                  const lastFifoKey = `zap:${leftover.shard}:fifo:rawBread`
                  const pipeline = seed.redis.pipeline()
                  pipeline.lrange(lastRawKey, 0, -1)// 0
                  pipeline.del(lastRawKey)// 1
                  pipeline.llen(lastFifoKey)// 2
                  const pipeback = await pipeline.exec()

                  const peas = pipeback[0][1]
                  if (peas.length > 0) {
                    const notifysent = {
                      type: 'sendhook',
                      hardid: seed.hardid,
                      shard: seed.shard,
                      json: JSON.stringify({
                        type: 'queue get uncongested',
                        lost: peas.map(el => JSON.parse(el)).map(el => ({ ...el, jid: undefined, to: el.jid.split('@s.whatsapp.net')[0] }))
                      })
                    }
                    await seed.redis.publish(panoptickey, JSON.stringify(notifysent))
                  }

                  let alreadyPlaying = true
                  if (!seed?.fifoDrummer?.playing) {
                    seed.fifoDrummer = fifoDrumer({ ...seed, redisB: listener.duplicate() })
                    alreadyPlaying = false
                  }

                  const notifysent = {
                    type: 'sendhook',
                    hardid: seed.hardid,
                    shard: seed.shard,
                    json: JSON.stringify({
                      type: 'queue starting',
                      shard: leftover.shard,
                      reason: alreadyPlaying
                        ? 'it was already playing'
                        : undefined,
                      queueSize: pipeback[2][1]
                    })
                  }
                  await seed.redis.publish(panoptickey, JSON.stringify(notifysent))
                }
              }
              break
            case 'spreadrestart':
              if (patchpanel.has(leftover.shard)) {
                const seed = patchpanel.get(leftover.shard)
                if (seed.conn.state === 'open') {
                  const notifysent = {
                    type: 'sendhook',
                    hardid: seed.hardid,
                    shard: seed.shard,
                    json: JSON.stringify({
                      type: 'spread starting',
                      shard: leftover.shard
                    })
                  }
                  await seed.redis.publish(panoptickey, JSON.stringify(notifysent))

                  if (!seed?.punkDrummer?.playing) {
                    seed.punkDrummer = punkDrummer({ ...seed, redisB: listener.duplicate() })
                  } else {
                    const notifysent = {
                      type: 'sendhook',
                      hardid, // send to myself
                      shard: leftover.shard,
                      json: JSON.stringify({
                        type: 'spread starting',
                        shard: leftover.shard,
                        reason: 'it was already playing'
                      })
                    }
                    speaker.publish(panoptickey, JSON.stringify(notifysent))
                  }
                }
              }
              break
            case 'connectionstate':
              if (patchpanel.has(leftover.shard)) {
                const seed = patchpanel.get(leftover.shard)
                const state = seed.conn.state

                const notifysent = {
                  type: 'sendhook',
                  hardid,
                  shard: seed.shard,
                  json: JSON.stringify({
                    type: 'connectionstate',
                    state
                  })
                }

                await seed.redis.publish(panoptickey, JSON.stringify(notifysent))
              } else {
                const notifysent = {
                  type: 'sendhook',
                  hardid,
                  shard: leftover.shard,
                  json: JSON.stringify({
                    type: 'connectionstate',
                    state: 'trashed'
                  })
                }
                await speaker.publish(panoptickey, JSON.stringify(notifysent))
              }
              break
            case 'loadmessages':
              if (patchpanel.has(leftover.shard)) {
                const spreadkey = `zap:${leftover.shard}:spread`
                const seed = patchpanel.get(leftover.shard)
                const { number, count = 1, wid } = leftover
                const jid = `${number}@s.whatsapp.net`

                let messages
                if (wid) {
                  const wbis1 = await seed.conn.loadMessages(jid, count, { fromMe: false, id: wid })
                  const wbis2 = await seed.conn.loadMessages(jid, count, { fromMe: true, id: wid })

                  messages = wbis1.messages
                    .concat(wbis2.messages)
                    .map(message => message.toJSON())
                } else {
                  const loaded = await seed.conn.loadMessages(jid, count)
                  messages = loaded.messages.map(message => message.toJSON())
                }

                const pipeline = seed.redis.pipeline()
                messages
                  .map(m => ({ ...m, isFromHistory: true }))
                  .map(JSON.stringify)
                  .forEach(el => {
                    pipeline.publish(spreadkey, el)
                  })

                await pipeline.exec()
              }
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
