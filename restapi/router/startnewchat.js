const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const startnewchat = ({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'startnewchat'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'startnewchat')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},startnewchat,to`)

  const to = req.body.to
  const msg = req.body.msg

  if (to && msg && to.indexOf('-') === -1 && !Number.isNaN(Number(to))) {
    const jid = `${to}@s.whatsapp.net`

    const chatsKeys = mkchatskey(shard)
    const markcountkey = mkmarkcountkey(shard)

    const pipeline = redis.pipeline()
    pipeline.sismember(chatsKeys, to)
    pipeline.incr(markcountkey)
    const pipeback = await pipeline.exec()

    const alreadyTalkedTo = pipeback[0][1]
    const mark = String(pipeback[1][1])

    if (!alreadyTalkedTo) {
      const type = 'startTextMessage_v001'
      const queueSize = await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
        type,
        mark,
        jid,
        msg
      }))

      res.status(200).json({
        type: 'startnewchat',
        to: req.body.to,
        mark,
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

module.exports = startnewchat
