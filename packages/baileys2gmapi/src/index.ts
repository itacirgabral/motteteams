import { WAMessage } from '@adiwajshing/baileys-md'
import { postalScraper } from './postalScraper'

import {
  Message,
  TextMessage,
  LocationMessage,
  ContactMessage
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
  } else {
    return { nada: true }
  }
}

export default baileys2gmapi
