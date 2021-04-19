const path = require('path')

const switcher = async ({
  type,
  timestamp,
  to,
  from,
  wid,
  author,
  isQuoted,
  isForwarded,
  isFromHistory,
  seed,
  wbi,
  msg,
  quoteMsg,
  location,
  contact,
  document,
  image,
  audio,
  video
}) => {
  let file, params, jsontosend
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
        wid
      }
      break
    case 'imageMessage':
      file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
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
        mimetype: image.mimetype,
        size: image.fileLength
      }
      break
    case 'documentMessage':
      file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
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
        filename: document.fileName,
        mimetype: document.mimetype,
        size: document.fileLength
      }
      break
    case 'audioMessage':
      file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
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
        seconds: audio.seconds,
        mimetype: audio.mimetype,
        size: audio.fileLength
      }
      break
    case 'videoMessage':
      file = await seed.conn.downloadAndSaveMediaMessage(wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
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
        quoted: isQuoted ? video.contextInfo.stanzaId : undefined,
        seconds: video.seconds,
        loop: !!video.gifPlayback,
        mimetype: video.mimetype,
        size: video.fileLength
      }
      break
  }

  return { file, params, jsontosend }
}

module.exports = switcher
