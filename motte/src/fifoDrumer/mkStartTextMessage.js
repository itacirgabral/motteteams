const { MessageType, Presence } = require('@adiwajshing/baileys')
const delay = require('./delay')

const mkSendTextMessage = ({
  statsKey,
  totalsentmessage,
  lastRawKey,
  markkey,
  panoptickey,
  lastsentmessagetimestamp,
  lastdeltatimemessage
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, msg, mark } = crumb
  const delta = msg.length
  const waittime = delta > 50 ? 6000 : delta * 100 + 100

  const [isOnWhatsApp] = await Promise.all([
    seed.conn.isOnWhatsApp(jid),
    delay(waittime)
  ])

  await seed.redis.hincrby(statsKey, totalsentmessage, 1)

  console.dir({ isOnWhatsApp, jid })
  if (isOnWhatsApp) {
    const timestampStart = Date.now()

    let bakedBread
    bakedBread = false
    bakedBread = await seed.conn.sendMessage(jid, msg, MessageType.text)
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
    }
  } else {
    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'outofwhats',
        number: jid.split('@')[0],
        mark
      })
    }

    await seed.redis.publish(panoptickey, JSON.stringify(notifysent))
  }
}

module.exports = mkSendTextMessage
