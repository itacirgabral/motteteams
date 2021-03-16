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
        quoted: isQuoted ? contact.contextInfo.stanzaId : undefined,
        vcard: contact.vcard,
        wid
      }
      break
    case 'callMissed':
      jsontosend = {
        type,
        timestamp,
        from
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
