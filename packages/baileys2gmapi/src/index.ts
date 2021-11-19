import { WAMessage } from '@adiwajshing/baileys-md'
import { postalScraper } from './postalScraper'

import {
  Message,
  TextMessage,
  LocationMessage,
  ContactMessage,
  AudioMessage,
  ImageMessage,
  VideoMessage,
  DocumentMessage
} from 'types'

const baileys2gmapi = (wam: WAMessage): Message => {
  const {
    wid,
    from,
    to,
    timestamp,
    author,
    forward,
    reply
  } = postalScraper(wam)

  // const isCallMissed = wbi.messageStubType === 'CALL_MISSED_VOICE'
  // const isMessageDeleted = wbi.messageStubType === 'REVOKE'

  // !== 'status@broadcast'

  const conversation = !!wam?.message?.conversation
  const extendedText = !!wam?.message?.extendedTextMessage
  const location = !!wam?.message?.locationMessage
  const contact = !!wam?.message?.contactMessage
  const audio = !!wam?.message?.audioMessage
  const image = !!wam?.message?.imageMessage
  const video = !!wam?.message?.videoMessage
  const document = !!wam?.message?.documentMessage

  if (conversation) {
    const type = 'textMessage'
    const msg = wam?.message?.conversation || ''

    const message: TextMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      msg,
      author,
      reply,
      forward
    }

    return message
  } else if (extendedText) {
    const type = 'textMessage'
    const msg = wam?.message?.extendedTextMessage?.text || ''

    const message: TextMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      msg,
      author,
      reply,
      forward
    }

    return message
  } else if (location) {
    const type = 'locationMessage'
    const description = wam?.message?.locationMessage?.address || ''
    const latitude = wam?.message?.locationMessage?.degreesLatitude || 0
    const longitude = wam?.message?.locationMessage?.degreesLongitude || 0

    const message: LocationMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      description,
      latitude,
      longitude,
      author,
      reply,
      forward
    }

    return message
  } else if (contact) {
    const type = 'contactMessage'
    const vcard = wam?.message?.contactMessage?.vcard || ''

    const message: ContactMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      vcard,
      author,
      reply,
      forward
    }

    return message
  } else if (audio) {
    const type = 'audioMessage'
    const seconds = wam?.message?.audioMessage?.seconds
    const mimetype = wam?.message?.audioMessage?.mimetype
    const bytes = wam?.message?.audioMessage?.fileLength

    const message: AudioMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      mimetype,
      seconds,
      bytes,
      author,
      reply,
      forward
    }

    return message
  } else if (image) {
    const type = 'imageMessage'
    const mimetype = wam?.message?.imageMessage?.mimetype
    const bytes = wam?.message?.imageMessage?.fileLength
    const caption = wam?.message?.imageMessage?.caption

    const message: ImageMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      mimetype,
      bytes,
      caption,
      author,
      reply,
      forward
    }

    return message
  } else if (video) {
    const type = 'videoMessage'
    const mimetype = wam?.message?.videoMessage?.mimetype
    const bytes = wam?.message?.videoMessage?.fileLength
    const seconds = wam?.message?.videoMessage?.seconds
    const loop = wam?.message?.videoMessage?.gifPlayback
    const caption = wam?.message?.videoMessage?.caption

    const message: VideoMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      mimetype,
      bytes,
      seconds,
      loop,
      caption,
      author,
      reply,
      forward
    }

    return message
  } else if (document) {
    const type = 'documentMessage'
    const mimetype = wam?.message?.documentMessage?.mimetype
    const bytes = wam?.message?.documentMessage?.fileLength
    const filename = wam?.message?.documentMessage?.fileName

    const message: DocumentMessage = {
      type,
      wid,
      from,
      to,
      timestamp,
      mimetype,
      bytes,
      filename,
      author,
      reply,
      forward
    }

    return message
  } else {
    return { nada: true }
  }
}

export default baileys2gmapi
