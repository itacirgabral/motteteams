const sendtextmessage = ({ redis, mkmarkcountkey, mkrawbreadkey }) => async (req, res) => {
  const to = req.body.to
  const shard = req.shard
  const quote = req.query.quote
  const msg = req.body.msg

  if (to && msg) {
    const jid = to.indexOf('-') === -1
      ? `${to}@s.whatsapp.net` // se for pessoa
      : `${to}@g.us` // se for grupo

    const chatsKeys = `zap:${shard}:chats`
    const markcountkey = mkmarkcountkey(shard)

    const pipeline = redis.pipeline()
    pipeline.sismember(chatsKeys, to)
    pipeline.incr(markcountkey)
    const pipeback = await pipeline.exec()

    const alreadyTalkedTo = pipeback[0][1]
    const mark = pipeback[1][1]

    if (alreadyTalkedTo) {
      const type = 'textMessage_v001'
      const queueSize = await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
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
