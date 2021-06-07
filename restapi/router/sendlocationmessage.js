const sendlocationmessage = ({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktskey }) => async (req, res) => {
  const shard = req.shard
  const to = req.body.to
  const quote = req.query.quote
  const description = req.body.description
  const latitude = req.body.latitude
  const longitude = req.body.longitude

  console.log(`${(new Date()).toLocaleTimeString()},${shard},sendlocationmessage,${to}`)

  if (to && description && latitude && longitude) {
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
      const type = 'locationMessage_v001'
      const queueSize = await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
        type,
        mark,
        jid,
        quote,
        description,
        latitude,
        longitude
      }))

      res.status(200).json({
        type: 'sendlocationmessage',
        to: req.body.to,
        mark,
        quote: req.query.quote,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
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

module.exports = sendlocationmessage
