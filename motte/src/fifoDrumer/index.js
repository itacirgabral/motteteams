const mkStartTextMessage = require('./mkStartTextMessage')
const mkSendTextMessage = require('./mkSendTextMessage')
const mkSendContactMessage = require('./mkSendContactMessage')
const mkSendLocationMessage = require('./mkSendLocationMessage')
const mkSendForwardMessage = require('./mkSendForwardMessage')
const mkSendDocumentMessage = require('./mkSendDocumentMessage')
const mkSendAudioMessage = require('./mkSendAudioMessage')
const mkSendImageMessage = require('./mkSendImageMessage')
const mkSendVideoMessage = require('./mkSendVideoMessage')
const mkContactInfo = require('./mkContactInfo')
const mkGroupInfo = require('./mkGroupInfo')
const mkEraseMessage = require('./mkEraseMessage')
const mkLoadMessages = require('./mkLoadMessages')
const mkCheckIn = require('./mkCheckIn')
const mkQueueStop = require('./mkQueueStop')

/*
** Fee-fi-fo-fum,
** I smell the blood of an Englishman,
** Be he alive, or be he dead
** I'll grind his bones to make my bread.
*/
const fifoDrumer = (seed) => {
  const keys = {
    panoptickey: 'zap:panoptic',
    fifoRawKey: `zap:${seed.shard}:fifo:rawBread`,
    lastRawKey: `zap:${seed.shard}:last:rawBread`,
    statsKey: `zap:${seed.shard}:stats`,
    markkey: `zap:${seed.shard}:mark`,
    maxtkey: `zap:${seed.shard}:maxt`,
    spreadkey: `zap:${seed.shard}:spread`,
    messageAscKey: `zap:${seed.shard}:messageAsc`,
    lastsentmessagetimestamp: 'lastsentmessagetimestamp',
    lastdeltatimemessage: 'lastdeltatimemessage',
    totalsentmessage: 'totalsentmessage',
    totalmediasize: 'totalmediasize'
  }

  const startTextMessage = mkStartTextMessage(keys)
  const sendTextMessage = mkSendTextMessage(keys)
  const sendContactMessage = mkSendContactMessage(keys)
  const sendLocationMessage = mkSendLocationMessage(keys)
  const sendForwardMessage = mkSendForwardMessage(keys)
  const sendDocumentMessage = mkSendDocumentMessage(keys)
  const sendAudioMessage = mkSendAudioMessage(keys)
  const sendImageMessage = mkSendImageMessage(keys)
  const sendVideoMessage = mkSendVideoMessage(keys)
  const contactInfo = mkContactInfo(keys)
  const groupInfo = mkGroupInfo(keys)
  const eraseMessage = mkEraseMessage(keys)
  const loadMessages = mkLoadMessages(keys)
  const checkIn = mkCheckIn(keys)
  const queueStop = mkQueueStop(keys)

  const healthcare = {
    playing: true,
    fifoRawKey: keys.fifoRawKey,
    lastRawKey: keys.lastRawKey
    // botar aqui um promessa que é a função assync do nexttick
  }

  process.nextTick(async () => {
    while (healthcare.playing) {
      const rawBread = await seed.redisB.brpoplpush(keys.fifoRawKey, keys.lastRawKey, 0)
      const { type, ...crumb } = JSON.parse(rawBread)

      if (healthcare.playing) {
        switch (type) {
          case 'startTextMessage_v001':
            await startTextMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'textMessage_v001':
            await sendTextMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'contactMessage_v001':
            await sendContactMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'locationMessage_v001':
            await sendLocationMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'forwardMessage_v001':
            await sendForwardMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'documentMessage_v001':
            await sendDocumentMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'audioMessage_v001':
            await sendAudioMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'imageMessage_v001':
            await sendImageMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'videoMessage_v001':
            await sendVideoMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'contactInfo_v001':
            await contactInfo({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'groupInfo_v001':
            await groupInfo({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'eraseMessage_v001':
            await eraseMessage({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'loadMessages_v001':
            await loadMessages({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'checkin_v001':
            await checkIn({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
          case 'queueStop_v001':
            await queueStop({ crumb, seed, healthcare })
              .catch(err => {
                console.error(err)
                healthcare.playing = false
              })
            break
        }
      } else {
        // backward fifo
        const pipeline = seed.redis.pipeline()

        if (crumb.type !== 'queueStop_v001') {
          pipeline.rpush(keys.fifoRawKey, rawBread)
        }
        pipeline.lpop(keys.lastRawKey)

        await pipeline.exec()
      }
    }

    // baterista parou :(
    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'queue stopped'
      })
    }
    await seed.redis.publish(keys.panoptickey, JSON.stringify(notifysent))
  })

  return healthcare
}

module.exports = fifoDrumer
