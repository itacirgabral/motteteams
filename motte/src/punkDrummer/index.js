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

      console.dir({ from, fromMe, to, isGroup, groupId, timestamp })

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

      console.dir({ type, isForwarded, isQuoted })
    } else {
      seed.redisB.unsubscribe(keys.spreadKey)
    }
  })

  return healthcare
}

module.exports = punkDrummer
