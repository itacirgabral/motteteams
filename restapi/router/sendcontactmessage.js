const sendcontactmessage = ({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }) => async (req, res) => {
  const to = req.body.to
  const shard = req.shard
  const quote = req.query.quote
  const vcard = req.body.vcard

  if (to && vcard) {
    const jid = to.indexOf('-') === -1
      ? `${to}@s.whatsapp.net` // se for pessoa
      : `${to}@g.us` // se for grupo

    const chatsKeys = mkchatskey(shard)
    const markcountkey = mkmarkcountkey(shard)

    const pipeline = redis.pipeline()
    pipeline.sismember(chatsKeys, to)
    pipeline.incr(markcountkey)
    const pipeback = await pipeline.exec()

    const alreadyTalkedTo = pipeback[0][1]
    const mark = String(pipeback[1][1])

    if (alreadyTalkedTo) {
      const type = 'contactMessage_v001'
      const queueSize = await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
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
