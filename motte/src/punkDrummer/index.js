const sortingMessages = require('./sortingMessages')
const switcher = require('./switcher')

const punkDrummer = (seed) => {
  const keys = {
    panoptickey: 'zap:panoptic',
    spreadKey: `zap:${seed.shard}:spread`
  }
  const healthcare = {
    playing: true,
    fifoRawKey: keys.fifoRawKey,
    lastRawKey: keys.lastRawKey
  }

  // subscribe
  seed.redisB.subscribe(keys.spreadKey)
  seed.redisB.on('message', async (channel, message) => {
    if (healthcare.playing) {
      const wbi = JSON.parse(message)
      const wid = wbi.key.id
      const fromMe = wbi.key.fromMe
      const remoteJid = wbi.key.remoteJid.split('@s.whatsapp.net')[0]
      const participant = wbi.participant
        ? wbi.participant.split('@s.whatsapp.net')[0]
        : undefined

      const isGroup = remoteJid.indexOf('-') !== -1
      const groupId = isGroup
        ? remoteJid.split('@g.us')[0]
        : undefined

      const to = isGroup
        ? groupId
        : fromMe ? remoteJid : seed.shard

      const from = fromMe
        ? seed.shard
        : isGroup
          ? participant
          : remoteJid

      const timestamp = wbi.messageTimestamp

      if (!(from === 'status@broadcast' || fromMe || isGroup)) {
        const conversation = wbi.message.conversation
        const quoteMsg = wbi.message.extendedTextMessage
        const location = wbi.message.locationMessage
        const contact = wbi.message.contactMessage
        const image = wbi.message.imageMessage
        const document = wbi.message.documentMessage
        const audio = wbi.message.audioMessage

        const { type, isForwarded, isQuoted, msg } = sortingMessages({
          conversation,
          quoteMsg,
          location,
          contact,
          image,
          document,
          audio
        })

        const { file, params, jsontosend } = await switcher({
          type,
          timestamp,
          to,
          from,
          wid,
          isQuoted,
          isForwarded,
          seed,
          wbi,
          msg,
          quoteMsg,
          location,
          contact,
          document,
          image,
          audio
        })

        const hook = {
          type: 'sendhook',
          hardid: seed.hardid,
          shard: seed.shard,
          file, // only media messagens have it
          params,
          json: JSON.stringify(jsontosend)
        }

        await seed.redis.publish(keys.panoptickey, JSON.stringify(hook))
      }
    } else {
      seed.redisB.unsubscribe(keys.spreadKey)
    }
  })

  return healthcare
}

module.exports = punkDrummer
