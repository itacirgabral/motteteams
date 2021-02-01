const fs = require('fs')
const { MessageType, Presence, Mimetype } = require('@adiwajshing/baileys')
const delay = require('./delay')

const mkSendAudioMessage = ({
  statsKey,
  totalsentmessage,
  lastRawKey,
  markkey,
  lastsentmessagetimestamp,
  totalmediasize
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, quote, path, size, mark } = crumb
  const waittime = 300

  await seed.conn.chatRead(jid)
  await seed.conn.updatePresence(jid, Presence.composing)
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
      quotedmessage = await seed.conn.loadMessage(jid, quote)
    }

    let bakedBread
    if (quote && !quotedmessage) {
      bakedBread = false
      await seed.redis.hincrby(statsKey, totalsentmessage, 1)
    } else {
      bakedBread = await seed.conn.sendMessage(jid, voicefile, MessageType.audio, { mimetype: Mimetype.ogg, ptt: true, quoted: quotedmessage })
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
      pipeline.hincrby(statsKey, totalsentmessage, 1)
      await pipeline.exec()

      await seed.conn.updatePresence(jid, Presence.available)
      fs.unlinkSync(path)
    } else {
      healthcare.playing = false
    }
  }
}

module.exports = mkSendAudioMessage
