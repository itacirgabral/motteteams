const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const sendtextmessage = ({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const to = req.body.to
  const quote = req.query.quote
  const msg = req.body.msg
  const tskey = mktsroutekey({ shard, route: 'sendtextmessage' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'sendtextmessage')
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
