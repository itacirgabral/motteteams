const path = require('path')
const sortingMessages = require('./sortingMessages')

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

      if (!(from === 'status@broadcast' || isGroup)) {
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

        console.dir({ from, fromMe, to, isGroup, groupId, timestamp, type, isForwarded, isQuoted, msg })

        let jsontosend
        let params
        let file

        switch (type) {
          case 'textMessage':
            jsontosend = {
              type,
              timestamp,
              to,
              from,
              msg,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? quoteMsg.contextInfo.stanzaId : undefined,
              wid
            }
            await seed.redis.publish(keys.panoptickey, JSON.stringify({
              type: 'sendhook',
              hardid: seed.hardid,
              shard: seed.shard,
              json: JSON.stringify(jsontosend)
            }))
            break
          case 'locationMessage':
            jsontosend = {
              type,
              timestamp,
              to,
              from,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? location.contextInfo.stanzaId : undefined,
              wid,
              description: location.address,
              latitude: location.degreesLatitude,
              longitude: location.degreesLongitude
            }
            await seed.redis.publish(keys.panoptickey, JSON.stringify({
              type: 'sendhook',
              hardid: seed.hardid,
              shard: seed.shard,
              json: JSON.stringify(jsontosend)
            }))
            break
          case 'contactMessage':
            jsontosend = {
              type,
              timestamp,
              to,
              from,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? contact.contextInfo.stanzaId : undefined,
              vcard: contact.vcard,
              wid
            }
            await seed.redis.publish(keys.panoptickey, JSON.stringify({
              type: 'sendhook',
              hardid: seed.hardid,
              shard: seed.shard,
              json: JSON.stringify(jsontosend)
            }))
            break
          case 'imageMessage':
            file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
            params = {
              type,
              timestamp,
              to,
              from,
              wid,
              caption: image.caption,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? image.contextInfo.stanzaId : undefined,
              mimetype: image.mimetype,
              size: image.fileLength
            }
            await seed.redis.publish(keys.panoptickey, JSON.stringify({
              type: 'sendhook',
              hardid: seed.hardid,
              shard: seed.shard,
              file,
              params
            }))
            break
          case 'documentMessage':
            file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
            params = {
              type,
              timestamp,
              to,
              from,
              wid,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? document.contextInfo.stanzaId : undefined,
              filename: document.fileName,
              mimetype: document.mimetype,
              size: document.fileLength
            }
            await seed.redis.publish(keys.panoptickey, JSON.stringify({
              type: 'sendhook',
              hardid: seed.hardid,
              shard: seed.shard,
              file,
              params
            }))
            break
          case 'audioMessage':
            file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
            params = {
              type,
              timestamp,
              to,
              from,
              wid,
              forwarded: isForwarded ? true : undefined,
              quoted: isQuoted ? audio.contextInfo.stanzaId : undefined,
              seconds: audio.seconds,
              mimetype: audio.mimetype,
              size: audio.fileLength
            }
            await seed.redis.publish(keys.panoptickey, JSON.stringify({
              type: 'sendhook',
              hardid: seed.hardid,
              shard: seed.shard,
              file,
              params
            }))
            break
        }
      }
    } else {
      seed.redisB.unsubscribe(keys.spreadKey)
    }
  })

  return healthcare
}

module.exports = punkDrummer
