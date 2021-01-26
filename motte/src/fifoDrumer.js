const { MessageType, Presence, Mimetype } = require('@adiwajshing/baileys')
const fs = require('fs')
const delay = require('./delay')
/*
** Fee-fi-fo-fum,
** I smell the blood of an Englishman,
** Be he alive, or be he dead
** I'll grind his bones to make my bread.
*/

const fifoDrumer = ({ shard, redis, connP, redisB }) => {
  const fifoRawKey = `zap:${shard}:fifo:rawBread`
  const lastRawKey = `zap:${shard}:last:rawBread`

  const statsKey = `zap:${shard}:stats`
  const markkey = `zap:${shard}:mark`
  const lastsentmessagetimestamp = 'lastsentmessagetimestamp'
  const lastdeltatimemessage = 'lastdeltatimemessage'
  const totalsentmessage = 'totalsentmessage'
  const totalmediasize = 'totalmediasize'

  const healthcare = {
    playing: true,
    fifoRawKey,
    lastRawKey
  }

  process.nextTick(async () => {
    const pea = await redis.llen(lastRawKey)
    healthcare.playing = healthcare.playing || pea === 0
    const forwardBuffer = {}

    while (healthcare.playing) {
      const rawBread = await redisB.brpoplpush(fifoRawKey, lastRawKey, 0)
      const { type, ...crumb } = JSON.parse(rawBread)

      /*
      ** oh my ugly ifs...
      */
      if (type === 'textMessage_v001') {
        const { jid, quote, msg, mark } = crumb
        const delta = msg.length
        const waittime = delta > 50 ? 6000 : delta * 100 + 100

        const conn = await connP

        await conn.chatRead(jid)
        await conn.updatePresence(jid, Presence.composing)
        await delay(waittime)

        const timestampStart = Date.now()

        let quotedmessage
        if (quote) {
          quotedmessage = await conn.loadMessage(jid, quote)
        }

        let bakedBread
        if (quote && !quotedmessage) {
          bakedBread = false
          await redis.hincrby(statsKey, totalsentmessage, 1)
        } else {
          bakedBread = await conn.sendMessage(jid, msg, MessageType.text, { quoted: quotedmessage })
            .catch(() => {
              healthcare.playing = false
              return false
            })
        }

        if (bakedBread) {
          const messageid = bakedBread.key.id
          const timestampFinish = Date.now()
          await conn.updatePresence(jid, Presence.available)
          const deltatime = timestampFinish - timestampStart

          const pipeline = redis.pipeline()
          pipeline.ltrim(lastRawKey, 0, -2)
          pipeline.hset(markkey, messageid, mark)
          pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
          pipeline.hset(statsKey, lastdeltatimemessage, deltatime)
          pipeline.hincrby(statsKey, totalsentmessage, 1)
          await pipeline.exec()
        }
      }

      if (type === 'contactMessage_v001') {
        const { jid, quote, vcard, mark } = crumb
        const waittime = 300

        const conn = await connP

        await conn.chatRead(jid)
        await conn.updatePresence(jid, Presence.composing)
        await delay(waittime)

        const timestampStart = Date.now()

        let quotedmessage
        if (quote) {
          quotedmessage = await conn.loadMessage(jid, quote)
        }

        let bakedBread
        if (quote && !quotedmessage) {
          bakedBread = false
          await redis.hincrby(statsKey, totalsentmessage, 1)
        } else {
          bakedBread = await conn.sendMessage(jid, { vcard }, MessageType.contact, { quoted: quotedmessage })
            .catch(() => {
              healthcare.playing = false
              return false
            })
        }

        if (bakedBread) {
          const messageid = bakedBread.key.id
          const timestampFinish = Date.now()
          await conn.updatePresence(jid, Presence.available)
          const deltatime = timestampFinish - timestampStart

          const pipeline = redis.pipeline()
          pipeline.ltrim(lastRawKey, 0, -2)
          pipeline.hset(markkey, messageid, mark)
          pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
          pipeline.hset(statsKey, lastdeltatimemessage, deltatime)
          pipeline.hincrby(statsKey, totalsentmessage, 1)
          await pipeline.exec()
        }
      }

      if (type === 'locationMessage_v001') {
        const { jid, quote, description, latitude, longitude, mark } = crumb
        const waittime = 300

        const conn = await connP

        await conn.chatRead(jid)
        await conn.updatePresence(jid, Presence.composing)
        await delay(waittime)

        const timestampStart = Date.now()

        let quotedmessage
        if (quote) {
          quotedmessage = await conn.loadMessage(jid, quote)
        }

        let bakedBread
        if (quote && !quotedmessage) {
          bakedBread = false
          await redis.hincrby(statsKey, totalsentmessage, 1)
        } else {
          bakedBread = await conn.sendMessage(jid, { address: description, degreesLatitude: latitude, degreesLongitude: longitude }, MessageType.location, { quoted: quotedmessage })
            .catch(() => {
              healthcare.playing = false
              return false
            })
        }

        if (bakedBread) {
          const messageid = bakedBread.key.id
          const timestampFinish = Date.now()
          await conn.updatePresence(jid, Presence.available)
          const deltatime = timestampFinish - timestampStart

          const pipeline = redis.pipeline()
          pipeline.ltrim(lastRawKey, 0, -2)
          pipeline.hset(markkey, messageid, mark)
          pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
          pipeline.hset(statsKey, lastdeltatimemessage, deltatime)
          pipeline.hincrby(statsKey, totalsentmessage, 1)
          await pipeline.exec()
        }
      }

      if (type === 'forwardMessage_v001') {
        const { jid, source, wid, mark } = crumb
        const waittime = 300 * (1 + Math.random())

        const conn = await connP

        await conn.chatRead(jid)
        await conn.updatePresence(jid, Presence.composing)
        await delay(waittime)

        let m
        if (forwardBuffer.wid === wid) {
          m = forwardBuffer.message
        } else {
          m = await conn.loadMessage(source, wid)
          forwardBuffer.message = m
          forwardBuffer.wid = wid
        }

        if (m) {
          const timestampStart = Date.now()
          const bakedBread = await conn.forwardMessage(jid, m)
            .catch(() => {
              healthcare.playing = false
              return false
            })
          if (bakedBread) {
            const messageid = bakedBread.key.id
            const timestampFinish = Date.now()
            await conn.updatePresence(jid, Presence.available)
            const deltatime = timestampFinish - timestampStart
            const pipeline = redis.pipeline()
            pipeline.ltrim(lastRawKey, 0, -2)
            pipeline.hset(markkey, messageid, mark)
            pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
            pipeline.hset(statsKey, lastdeltatimemessage, deltatime)
            pipeline.hincrby(statsKey, totalsentmessage, 1)
            await pipeline.exec()
          } else {
            await redis.hincrby(statsKey, totalsentmessage, 1)
          }
        }
      }

      if (type === 'documentMessage_v001') {
        const { jid, quote, path, filename, mimetype, size, mark } = crumb
        const waittime = 300

        const conn = await connP

        await conn.chatRead(jid)
        await conn.updatePresence(jid, Presence.composing)
        await delay(waittime)

        let docfile
        try {
          docfile = fs.readFileSync(path)
        } catch (error) {
          healthcare.playing = false
          console.error(error)
        }
        if (docfile) {
          let quotedmessage
          if (quote) {
            quotedmessage = await conn.loadMessage(jid, quote)
          }

          let bakedBread
          if (quote && !quotedmessage) {
            bakedBread = false
            await redis.hincrby(statsKey, totalsentmessage, 1)
          } else {
            bakedBread = await conn.sendMessage(jid, docfile, MessageType.document, { mimetype, filename, quoted: quotedmessage })
              .catch(() => {
                healthcare.playing = false
                return false
              })
          }

          if (bakedBread) {
            const messageid = bakedBread.key.id
            const timestampFinish = Date.now()
            await conn.updatePresence(jid, Presence.available)
            fs.unlinkSync(path)
            const pipeline = redis.pipeline()
            pipeline.ltrim(lastRawKey, 0, -2)
            pipeline.hset(markkey, messageid, mark)
            pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
            pipeline.hincrby(statsKey, totalmediasize, size)
            pipeline.hincrby(statsKey, totalsentmessage, 1)
            await pipeline.exec()
          } else {
            healthcare.playing = false
          }
        }
      }

      if (type === 'audioMessage_v001') {
        const { jid, quote, path, size, mark } = crumb
        const waittime = 300

        const conn = await connP

        await conn.chatRead(jid)
        await conn.updatePresence(jid, Presence.composing)
        await delay(waittime)

        let voicefile
        try {
          voicefile = fs.readFileSync(path)
        } catch (error) {
          healthcare.playing = false
          console.error(error)
        }
        if (voicefile) {
          let quotedmessage
          if (quote) {
            quotedmessage = await conn.loadMessage(jid, quote)
          }

          let bakedBread
          if (quote && !quotedmessage) {
            bakedBread = false
            await redis.hincrby(statsKey, totalsentmessage, 1)
          } else {
            bakedBread = await conn.sendMessage(jid, voicefile, MessageType.audio, { mimetype: Mimetype.ogg, ptt: true, quoted: quotedmessage })
              .catch(() => {
                healthcare.playing = false
                return false
              })
          }

          if (bakedBread) {
            const messageid = bakedBread.key.id
            const timestampFinish = Date.now()
            await conn.updatePresence(jid, Presence.available)
            fs.unlinkSync(path)
            const pipeline = redis.pipeline()
            pipeline.ltrim(lastRawKey, 0, -2)
            pipeline.hset(markkey, messageid, mark)
            pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
            pipeline.hincrby(statsKey, totalmediasize, size)
            pipeline.hincrby(statsKey, totalsentmessage, 1)
            await pipeline.exec()
          } else {
            healthcare.playing = false
          }
        }
      }

      if (type === 'imageMessage_v001') {
        const { jid, quote, path, filename, mimetype, size, mark } = crumb
        const waittime = 300

        const conn = await connP

        await conn.chatRead(jid)
        await conn.updatePresence(jid, Presence.composing)
        await delay(waittime)

        let imgfile
        try {
          imgfile = fs.readFileSync(path)
        } catch (error) {
          healthcare.playing = false
          console.error(error)
        }
        if (imgfile) {
          let quotedmessage
          if (quote) {
            quotedmessage = await conn.loadMessage(jid, quote)
          }

          let bakedBread
          if (quote && !quotedmessage) {
            bakedBread = false
            await redis.hincrby(statsKey, totalsentmessage, 1)
          } else {
            bakedBread = await conn.sendMessage(jid, imgfile, MessageType.image, { mimetype, filename, quoted: quotedmessage })
              .catch(() => {
                healthcare.playing = false
                return false
              })
          }

          if (bakedBread) {
            const messageid = bakedBread.key.id
            const timestampFinish = Date.now()
            await conn.updatePresence(jid, Presence.available)
            fs.unlinkSync(path)
            const pipeline = redis.pipeline()
            pipeline.ltrim(lastRawKey, 0, -2)
            pipeline.hset(markkey, messageid, mark)
            pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
            pipeline.hincrby(statsKey, totalmediasize, size)
            await pipeline.exec()
          } else {
            healthcare.playing = false
          }
        }
      }
    }
  })

  return healthcare
}

module.exports = fifoDrumer
