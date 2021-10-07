const chatprocessor = ({
  hardid,
  shard,
  wbi
}) => {
  const wid = wbi.key.id
  const fromMe = wbi.key.fromMe
  const isFromHistory = wbi.isFromHistory
  const isFromCheckin = wbi.isFromCheckin
  const isFromMe = wbi.isFromMe
  const remoteJid = wbi.key.remoteJid.split('@s.whatsapp.net')[0]
  const participant = wbi.participant
    ? wbi.participant.split('@s.whatsapp.net')[0]
    : undefined

  const isCallMissed = wbi.messageStubType === 'CALL_MISSED_VOICE'
  if (isCallMissed) {
    wbi.message = {
      appNotification: 'callMissed'
    }
  }

  const isMessageDeleted = wbi.messageStubType === 'REVOKE'
  if (isMessageDeleted) {
    wbi.message = {
      appNotification: 'messageDeleted'
    }
  }

  const isGroup = remoteJid.indexOf('-') !== -1
  const groupId = isGroup
    ? remoteJid.split('@g.us')[0]
    : undefined

  const to = isGroup
    ? shard
    : fromMe ? remoteJid : shard

  const from = fromMe
    ? shard
    : isGroup
      ? groupId
      : remoteJid

  const author = isGroup
    ? participant
    : undefined

  const timestamp = wbi.messageTimestamp

  if (from !== 'status@broadcast') {
    const conversation = wbi.message.conversation
    const quoteMsg = wbi.message.extendedTextMessage
    const location = wbi.message.locationMessage
    const contact = wbi.message.contactMessage
    const image = wbi.message.imageMessage
    const document = wbi.message.documentMessage
    const audio = wbi.message.audioMessage
    const video = wbi.message.videoMessage
    const appNotification = wbi.message.appNotification

    // WHAT TYPE
    let type
    let isQuoted = false
    let isForwarded = false
    let msg

    if (conversation) {
      type = 'textMessage'
      msg = conversation
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
    } else if (video) {
      type = 'videoMessage'
      if (video?.contextInfo?.isForwarded) {
        isForwarded = true
      }
      if (video?.contextInfo?.stanzaId) {
        isQuoted = true
      }
    } else if (appNotification) {
      type = appNotification
    }

    // TRANSFORM
    let mimetype, params, jsontosend
    switch (type) {
      case 'textMessage':
        jsontosend = {
          type,
          author,
          timestamp,
          to,
          from,
          msg,
          forwarded: isForwarded ? true : undefined,
          quoted: isQuoted ? quoteMsg.contextInfo.stanzaId : undefined,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          wid
        }
        break
      case 'locationMessage':
        jsontosend = {
          type,
          author,
          timestamp,
          to,
          from,
          forwarded: isForwarded ? true : undefined,
          quoted: isQuoted ? location.contextInfo.stanzaId : undefined,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          wid,
          description: location.address,
          latitude: location.degreesLatitude,
          longitude: location.degreesLongitude
        }
        break
      case 'contactMessage':
        jsontosend = {
          type,
          author,
          timestamp,
          to,
          from,
          forwarded: isForwarded ? true : undefined,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          quoted: isQuoted ? contact.contextInfo.stanzaId : undefined,
          vcard: contact.vcard,
          wid
        }
        break
      case 'callMissed':
        jsontosend = {
          type,
          timestamp,
          from,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          to
        }
        break
      case 'messageDeleted':
        jsontosend = {
          type,
          author,
          timestamp,
          to,
          from,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          wid
        }
        break
      case 'imageMessage':
        mimetype = image.mimetype
        params = {
          type,
          timestamp,
          to,
          author,
          from,
          wid,
          caption: image.caption,
          forwarded: isForwarded ? true : undefined,
          quoted: isQuoted ? image.contextInfo.stanzaId : undefined,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          mimetype,
          size: image.fileLength
        }
        break
      case 'documentMessage':
        mimetype = document.mimetype
        params = {
          type,
          timestamp,
          to,
          author,
          from,
          wid,
          forwarded: isForwarded ? true : undefined,
          quoted: isQuoted ? document.contextInfo.stanzaId : undefined,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          filename: document.fileName,
          mimetype,
          size: document.fileLength
        }
        break
      case 'audioMessage':
        mimetype = audio.mimetype
        params = {
          type,
          timestamp,
          to,
          author,
          from,
          wid,
          forwarded: isForwarded ? true : undefined,
          quoted: isQuoted ? audio.contextInfo.stanzaId : undefined,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          seconds: audio.seconds,
          mimetype,
          size: audio.fileLength
        }
        break
      case 'videoMessage':
        mimetype = video.mimetype
        params = {
          type,
          timestamp,
          to,
          author,
          from,
          wid,
          caption: video.caption,
          forwarded: isForwarded ? true : undefined,
          isFromHistory,
          isFromMe,
          isFromCheckin,
          quoted: isQuoted ? video.contextInfo.stanzaId : undefined,
          seconds: video.seconds,
          loop: !!video.gifPlayback,
          mimetype,
          size: video.fileLength
        }
        break
    }

    const newone = JSON.stringify(mimetype ? params : jsontosend)
    const filename = mimetype ? wid : undefined
    return {
      newone,
      filename
    }
  } else {
    // ao retornar falso
    // sera descartado
    return false
  }
}

module.exports = chatprocessor
