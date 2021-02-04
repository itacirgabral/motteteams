const path = require('path')

const messageNew = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookkey = `zap:${seed.shard}:webhook`
  const panoptickey = 'zap:panoptic'

  return async (message) => {
    const json = JSON.stringify({ event: 'message-new', data: message })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.publish(newsKey, json)// 2
    pipeline.get(webhookkey)// 3

    const pipeback = await pipeline.exec()

    const wbi = message.toJSON()
    const number = wbi.key.remoteJid.split('@s.whatsapp.net')[0]
    const webhook = pipeback[3][1]
    if (webhook && !wbi.key.fromMe && number.indexOf('-') === -1) {
      const to = seed.shard
      const from = number
      const id = wbi.key.id

      let msg = wbi.message.conversation
      const location = wbi.message.locationMessage
      const contact = wbi.message.contactMessage
      const image = wbi.message.imageMessage
      const document = wbi.message.documentMessage
      const audio = wbi.message.audioMessage
      const quoteMsg = wbi.message.extendedTextMessage

      let type
      let isQuoted = false
      let isForwarded = false
      if (msg) {
        type = 'textMessage'
      } else if (quoteMsg) {
        type = 'textMessage'
        msg = quoteMsg.text
        if (quoteMsg.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (quoteMsg.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (contact) {
        type = 'contactMessage'
        if (contact?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (contact?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (location) {
        type = 'locationMessage'
        if (location?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (location?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (image) {
        type = 'imageMessage'
        if (image?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (image?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (document) {
        type = 'documentMessage'
        if (document?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (document?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      } else if (audio) {
        type = 'audioMessage'
        if (audio?.contextInfo?.isForwarded) {
          isForwarded = true
        }
        if (audio?.contextInfo?.stanzaId) {
          isQuoted = true
        }
      }

      let jsontosend
      let params
      let file
      switch (type) {
        case 'textMessage':
          jsontosend = {
            type,
            to,
            from,
            msg,
            forwarded: isForwarded ? true : undefined,
            quoted: isQuoted ? quoteMsg.contextInfo.stanzaId : undefined,
            wid: id
          }
          await seed.redis.publish(panoptickey, JSON.stringify({
            type: 'sendhook',
            hardid: seed.hardid,
            shard: seed.shard,
            json: JSON.stringify(jsontosend)
          }))
          break
        case 'locationMessage':
          jsontosend = {
            type,
            to,
            from,
            forwarded: isForwarded ? true : undefined,
            quoted: isQuoted ? location.contextInfo.stanzaId : undefined,
            wid: id,
            description: location.address,
            latitude: location.degreesLatitude,
            longitude: location.degreesLongitude
          }
          await seed.redis.publish(panoptickey, JSON.stringify({
            type: 'sendhook',
            hardid: seed.hardid,
            shard: seed.shard,
            json: JSON.stringify(jsontosend)
          }))
          break
        case 'contactMessage':
          jsontosend = {
            type,
            to,
            from,
            forwarded: isForwarded ? true : undefined,
            quoted: isQuoted ? contact.contextInfo.stanzaId : undefined,
            vcard: contact.vcard,
            wid: id
          }
          await seed.redis.publish(panoptickey, JSON.stringify({
            type: 'sendhook',
            hardid: seed.hardid,
            shard: seed.shard,
            json: JSON.stringify(jsontosend)
          }))
          break
        case 'imageMessage':
          // file = await seed.conn.downloadAndSaveMediaMessage(wbi, `../uploads/${Date.now()}`)
          // path.join(process.cwd(), process.env.UPLOADFOLDER, filename)
          file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
          params = {
            type,
            to,
            from,
            wid: id,
            forwarded: isForwarded ? true : undefined,
            quoted: isQuoted ? image.contextInfo.stanzaId : undefined,
            mimetype: image.mimetype,
            size: image.fileLength
          }
          await seed.redis.publish(panoptickey, JSON.stringify({
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
            to,
            from,
            wid: id,
            forwarded: isForwarded ? true : undefined,
            quoted: isQuoted ? document.contextInfo.stanzaId : undefined,
            filename: document.fileName,
            mimetype: document.mimetype,
            size: document.fileLength
          }
          await seed.redis.publish(panoptickey, JSON.stringify({
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
            to,
            from,
            wid: id,
            forwarded: isForwarded ? true : undefined,
            quoted: isQuoted ? audio.contextInfo.stanzaId : undefined,
            seconds: audio.seconds,
            mimetype: audio.mimetype,
            size: audio.fileLength
          }
          await seed.redis.publish(panoptickey, JSON.stringify({
            type: 'sendhook',
            hardid: seed.hardid,
            shard: seed.shard,
            file,
            params
          }))
          break
      }
    }
  }
}

module.exports = messageNew
