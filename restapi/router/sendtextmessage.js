const sendtextmessage = ({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktskey }) => async (req, res) => {
  const shard = req.shard
  const to = req.body.to
  const quote = req.query.quote
  const msg = req.body.msg
  const tskey = mktskey({ shard, route: 'allchats'})

  console.log(`${(new Date()).toLocaleTimeString()},${shard},sendtextmessage,${to}`)

  if (to && msg) {
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
