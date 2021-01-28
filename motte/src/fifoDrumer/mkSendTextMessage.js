const { MessageType, Presence } = require('@adiwajshing/baileys')
const delay = require('./delay')

const mkSendTextMessage = ({
  statsKey,
  totalsentmessage,
  lastRawKey,
  markkey,
  lastsentmessagetimestamp,
  lastdeltatimemessage
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, quote, msg, mark } = crumb
  const delta = msg.length
  const waittime = delta > 50 ? 6000 : delta * 100 + 100

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
    bakedBread = await seed.conn.sendMessage(jid, msg, MessageType.text, { quoted: quotedmessage })
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

module.exports = mkSendTextMessage
