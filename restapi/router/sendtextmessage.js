const sendtextmessage = ({ redis, mkcontactskey, mkmarkcountkey, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const quote = req.query.quote
  const msg = req.body.msg

  if (Number.isInteger(Number(req.body.to)) && msg) {
    const jid = `${req.body.to}@s.whatsapp.net`
    const markcountkey = mkmarkcountkey(shard)

    const pipeline = redis.pipeline()
    pipeline.sismember(mkcontactskey(shard), jid)
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
