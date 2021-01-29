const crypto = require('crypto')

const sendcontactmessage = ({ redis }) => async (req, res) => {
  const shard = req.shard
  const quote = req.query.quote
  const vcard = req.body.vcard

  if (Number.isInteger(Number(req.body.to)) && vcard) {
    const jid = `${req.body.to}@s.whatsapp.net`
    const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

    if (alreadyTalkedTo) {
      const type = 'contactMessage_v001'
      const mark = crypto.randomBytes(8).toString('base64')
      // const rawBreadKey = `zap:${shard}:fifo:rawBread`
      const queueSize = await redis.lpush(rawBreadKey, JSON.stringify({
        type,
        mark,
        jid,
        quote,
        vcard
      }))

      res.status(200).json({
        send: 'sendcontactmessage',
        to: req.body.to,
        mark,
        quote: req.query.quote,
        vcard,
        from: shard,
        queueSize
      })
    } else {
      res.status(404).end()
    }
  } else {
    res.status(400).end()
  }
}

module.exports = sendcontactmessage
