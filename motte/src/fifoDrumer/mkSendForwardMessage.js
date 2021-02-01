const { Presence } = require('@adiwajshing/baileys')
const delay = require('./delay')

const forwardBuffer = {}

const mkSendForwardMessage = ({
  lastRawKey,
  markkey,
  statsKey,
  panoptickey,
  lastsentmessagetimestamp,
  lastdeltatimemessage,
  totalsentmessage
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, source, wid, mark } = crumb
  const waittime = 300 * (1 + Math.random())

  await seed.conn.chatRead(jid)
  await seed.conn.updatePresence(jid, Presence.composing)
  await delay(waittime)

  let m
  if (forwardBuffer.wid === wid) {
    m = forwardBuffer.message
  } else {
    m = await seed.conn.loadMessage(source, wid)
    forwardBuffer.message = m
    forwardBuffer.wid = wid
  }

  if (m) {
    const timestampStart = Date.now()
    const bakedBread = await seed.conn.forwardMessage(jid, m)
      .catch(() => {
        healthcare.playing = false
        return false
      })
    if (bakedBread) {
      const messageid = bakedBread.key.id
      const timestampFinish = Date.now()
      const deltatime = timestampFinish - timestampStart

      const WebMessageInfo = bakedBread.toJSON()
      const notifysent = {
        type: 'sendhook',
        hardid: seed.hardid,
        shard: seed.shard,
        json: JSON.stringify({
          type: 'sent',
          timestamp: WebMessageInfo.messageTimestamp,
          to: WebMessageInfo.key.remoteJid.split('@s.whatsapp.net')[0],
          from: seed.shard,
          wid: WebMessageInfo.key.id,
          mark
        })
      }

      const pipeline = seed.redis.pipeline()
      pipeline.ltrim(lastRawKey, 0, -2)
      pipeline.hset(markkey, messageid, mark)
      pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
      pipeline.hset(statsKey, lastdeltatimemessage, deltatime)
      pipeline.hincrby(statsKey, totalsentmessage, 1)
      pipeline.publish(panoptickey, JSON.stringify(notifysent))
      await pipeline.exec()

      await seed.conn.updatePresence(jid, Presence.available)
    } else {
      await seed.redis.hincrby(statsKey, totalsentmessage, 1)
    }
  }
}

module.exports = mkSendForwardMessage
