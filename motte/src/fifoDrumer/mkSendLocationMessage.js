const { MessageType, Presence } = require('@adiwajshing/baileys')
const delay = require('./delay')

const mkSendLocationMessage = ({
  statsKey,
  totalsentmessage,
  lastRawKey,
  markkey,
  lastsentmessagetimestamp,
  lastdeltatimemessage
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, quote, description, latitude, longitude, mark } = crumb
  const waittime = 300

  await seed.conn.chatRead(jid)
  await seed.conn.updatePresence(jid, Presence.composing)
  await delay(waittime)

  const timestampStart = Date.now()

  let quotedmessage
  if (quote) {
    quotedmessage = await seed.conn.loadMessage(jid, quote)
  }

  let bakedBread
  if (quote && !quotedmessage) {
    bakedBread = false
    await seed.redis.hincrby(statsKey, totalsentmessage, 1)
  } else {
    bakedBread = await seed.conn.sendMessage(jid, { address: description, degreesLatitude: latitude, degreesLongitude: longitude }, MessageType.location, { quoted: quotedmessage })
      .catch(() => {
        healthcare.playing = false
        return false
      })
  }

  if (bakedBread) {
    const messageid = bakedBread.key.id
    const timestampFinish = Date.now()
    await seed.conn.updatePresence(jid, Presence.available)
    const deltatime = timestampFinish - timestampStart

    const pipeline = seed.redis.pipeline()
    pipeline.ltrim(lastRawKey, 0, -2)
    pipeline.hset(markkey, messageid, mark)
    pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
    pipeline.hset(statsKey, lastdeltatimemessage, deltatime)
    pipeline.hincrby(statsKey, totalsentmessage, 1)
    await pipeline.exec()
  }
}

module.exports = mkSendLocationMessage
