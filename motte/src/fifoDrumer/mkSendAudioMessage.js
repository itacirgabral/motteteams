const fs = require('fs')
const path = require('path')
const { MessageType, Presence, Mimetype } = require('@adiwajshing/baileys')
const delay = require('./delay')

const mkSendAudioMessage = ({
  statsKey,
  totalsentmessage,
  lastRawKey,
  markkey,
  panoptickey,
  lastsentmessagetimestamp,
  totalmediasize
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, quote, ondiskname, size, mark } = crumb
  const waittime = 300

  await seed.conn.chatRead(jid)
  await seed.conn.updatePresence(jid, Presence.composing)
  await delay(waittime)

  let voicefile
  try {
    voicefile = fs.readFileSync(path.join(process.cwd(), process.env.UPLOADFOLDER, ondiskname))
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

      const WebMessageInfo = bakedBread.toJSON()
      const notifysent = {
        type: 'sendhook',
        hardid: seed.hardid,
        shard: seed.shard,
        json: JSON.stringify({
          type: 'sent',
          timestamp: WebMessageInfo.messageTimestamp,
          to: WebMessageInfo.key.remoteJid.split('@')[0],
          from: seed.shard,
          wid: WebMessageInfo.key.id,
          mark
        })
      }

      const pipeline = seed.redis.pipeline()
      pipeline.ltrim(lastRawKey, 0, -2)
      pipeline.hset(markkey, messageid, mark)
      pipeline.hset(statsKey, lastsentmessagetimestamp, timestampFinish)
      pipeline.hincrby(statsKey, totalmediasize, size)
      pipeline.hincrby(statsKey, totalsentmessage, 1)
      pipeline.publish(panoptickey, JSON.stringify(notifysent))
      await pipeline.exec()

      await seed.conn.updatePresence(jid, Presence.available)
      fs.unlinkSync(path.join(process.cwd(), process.env.UPLOADFOLDER, ondiskname))
    } else {
      healthcare.playing = false
    }
  }
}

module.exports = mkSendAudioMessage
