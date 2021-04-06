const { Presence } = require('@adiwajshing/baileys')
const delay = require('./delay')

const mkEraseMessage = ({
  statsKey,
  totalsentmessage,
  lastRawKey,
  panoptickey
}) => async ({ crumb, seed, healthcare }) => {
  const { jid, wid } = crumb
  const waittime = 300 * (1 + Math.random())

  await seed.conn.chatRead(jid).catch(() => {})
  await seed.conn.updatePresence(jid, Presence.composing)
  await delay(waittime)

  const [message] = await Promise.all([
    seed.conn.loadMessage(jid, wid),
    seed.redis.hincrby(statsKey, totalsentmessage, 1)
  ])

  const pipeline = seed.redis.pipeline()
  let notifysent

  if (message) {
    const WMI = message.toJSON()
    if (WMI.messageStubType !== 'REVOKE') {
      if (WMI.key.fromMe) {
        await seed.conn.deleteMessage(jid, WMI.key)
        notifysent = {
          type: 'sendhook',
          hardid: seed.hardid,
          shard: seed.shard,
          json: JSON.stringify({
            type: 'eraseMessage',
            to: jid.split('@')[0],
            wid
          })
        }
      } else {
        notifysent = {
          type: 'sendhook',
          hardid: seed.hardid,
          shard: seed.shard,
          json: JSON.stringify({
            type: 'eraseMessageError',
            notFromMe: true,
            to: jid.split('@')[0],
            wid
          })
        }
      }
    } else {
      notifysent = {
        type: 'sendhook',
        hardid: seed.hardid,
        shard: seed.shard,
        json: JSON.stringify({
          type: 'eraseMessageError',
          alreadyDeleted: true,
          to: jid.split('@')[0],
          wid
        })
      }
    }
  } else {
    notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'eraseMessageError',
        notFound: true,
        to: jid.split('@')[0],
        wid
      })
    }
  }

  pipeline.ltrim(lastRawKey, 0, -2)
  pipeline.publish(panoptickey, JSON.stringify(notifysent))
  await pipeline.exec()
}

module.exports = mkEraseMessage
