const fs = require('fs')
const { MessageType, Presence } = require('@adiwajshing/baileys')
const delay = require('./delay')

const mkSendImageMessage = ({
  statsKey,
  totalsentmessage,
  lastRawKey,
  markkey,
  lastsentmessagetimestamp,
  totalmediasize
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, quote, path, filename, mimetype, size, mark } = crumb
  const waittime = 300

  await seed.conn.chatRead(jid)
  await seed.conn.updatePresence(jid, Presence.composing)
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
      quotedmessage = await seed.conn.loadMessage(jid, quote)
    }

    let bakedBread
    if (quote && !quotedmessage) {
      bakedBread = false
      await seed.redis.hincrby(statsKey, totalsentmessage, 1)
    } else {
      bakedBread = await seed.conn.sendMessage(jid, imgfile, MessageType.image, { mimetype, filename, quoted: quotedmessage })
        .catch(() => {
          healthcare.playing = false
          return false
        })
    }

    if (bakedBread) {
      const messageid = bakedBread.key.id
      const timestampFinish = Date.now()

      const pipeline = seed.redis.pipeline()
      pipeline.ltrim(lastRawKey, 0, -2)
      pipeline.hset(markkey, messageid, mark)
      pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
      pipeline.hincrby(statsKey, totalmediasize, size)
      await pipeline.exec()

      await seed.conn.updatePresence(jid, Presence.available)
      fs.unlinkSync(path)
    } else {
      healthcare.playing = false
    }
  }
}

module.exports = mkSendImageMessage
