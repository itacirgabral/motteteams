const crypto = require('crypto')

const sendtextmessage = ({ redis }) => async (req, res) => {
  const shard = req.shard
  const quote = req.query.quote
  const msg = req.body.msg

  if (Number.isInteger(Number(req.body.to)) && msg) {
    const jid = `${req.body.to}@s.whatsapp.net`
    const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

    if (alreadyTalkedTo) {
      const type = 'textMessage_v001'
      const mark = crypto.randomBytes(8).toString('base64')
      // const rawBreadKey = `zap:${shard}:fifo:rawBread`
      const queueSize = await redis.lpush(rawBreadKey, JSON.stringify({
        type,
        mark,
        jid,
        quote,
        msg
      }))

      res.status(200).json({
        type: 'sendtextmessage',
        to: req.body.to,
        mark,
        quote: req.query.quote,
        msg: req.body.msg,
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

module.exports = sendtextmessage