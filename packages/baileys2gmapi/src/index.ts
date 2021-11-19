import { WAMessage } from '@adiwajshing/baileys-md'
import { postalScraper } from './postalScraper'

import {
  Message
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

  return 'olá mundo'
}

export default baileys2gmapi

/**
const sortingMessages = require('./sortingMessages')
const switcher = require('./switcher')

      // const wbi = JSON.parse(message)
      // const wid = wbi.key.id
      // const fromMe = wbi.key.fromMe
      // const isFromHistory = wbi.isFromHistory
      // const isFromCheckin = wbi.isFromCheckin
      // const isFromMe = wbi.isFromMe
      // const remoteJid = wbi.key.remoteJid.split('@s.whatsapp.net')[0]
      // const participant = wbi.participant
      //   ? wbi.participant.split('@s.whatsapp.net')[0]
      //   : undefined

      // const isCallMissed = wbi.messageStubType === 'CALL_MISSED_VOICE'
      // if (isCallMissed) {
      //   wbi.message = {
      //     appNotification: 'callMissed'
      //   }
      // }

      // const isMessageDeleted = wbi.messageStubType === 'REVOKE'
      // if (isMessageDeleted) {
      //   wbi.message = {
      //     appNotification: 'messageDeleted'
      //   }
      // }

      // const isGroup = remoteJid.indexOf('-') !== -1
      // const groupId = isGroup
      //   ? remoteJid.split('@g.us')[0]
      //   : undefined

      // const to = isGroup
      //   ? seed.shard
      //   : fromMe ? remoteJid : seed.shard

      // const from = fromMe
      //   ? seed.shard
      //   : isGroup
      //     ? groupId
      //     : remoteJid

      // const author = isGroup
      //   ? participant
      //   : undefined

      // const timestamp = wbi.messageTimestamp

      // if (from !== 'status@broadcast') {
      //   const conversation = wbi.message.conversation
      //   const quoteMsg = wbi.message.extendedTextMessage
      //   const location = wbi.message.locationMessage
      //   const contact = wbi.message.contactMessage
      //   const image = wbi.message.imageMessage
      //   const document = wbi.message.documentMessage
      //   const audio = wbi.message.audioMessage
      //   const video = wbi.message.videoMessage
      //   const appNotification = wbi.message.appNotification

      //   const { type, isForwarded, isQuoted, msg, notification } = sortingMessages({
      //     conversation,
      //     quoteMsg,
      //     location,
      //     contact,
      //     image,
      //     document,
      //     audio,
      //     video,
      //     appNotification
      //   })

      //   const { file, params, jsontosend } = await switcher({
      //     type,
      //     timestamp,
      //     to,
      //     from,
      //     wid,
      //     author,
      //     isQuoted,
      //     isForwarded,
      //     isFromHistory,
      //     isFromCheckin,
      //     isFromMe,
      //     seed,
      //     wbi,
      //     msg,
      //     quoteMsg,
      //     location,
      //     contact,
      //     document,
      //     image,
      //     audio,
      //     video,
      //     notification
      //   })

      //   const pipeline = await seed.redis.pipeline()

      //   if (file) {
      //     const msgid = `${keys.messageKey}:${params.wid}`
      //     pipeline.setnx(msgid, JSON.stringify(params))
      //     pipeline.expire(msgid, retention)
      //     pipeline.zadd(keys.messageAscKey, 'NX', params.timestamp, params.wid)
      //   } else {
      //     const msgid = `${keys.messageKey}:${jsontosend.wid}`
      //     pipeline.setnx(msgid, JSON.stringify(jsontosend))
      //     pipeline.expire(msgid, retention)
      //     pipeline.zadd(keys.messageAscKey, 'NX', jsontosend.timestamp, jsontosend.wid)
      //   }

      //   const hook = {
      //     type: 'sendhook',
      //     hardid: seed.hardid,
      //     shard: seed.shard,
      //     file, // only media messagens have it
      //     params,
      //     json: JSON.stringify(jsontosend)
      //   }

      //   pipeline.publish(keys.panoptickey, JSON.stringify(hook))

      //   await pipeline.exec()
*/