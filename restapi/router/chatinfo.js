const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const chatinfo = ({ redis, mkchatskey, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'chatinfo'})
  const id = req.body.id

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'chatinfo')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},chatinfo,${id}`)

  if ((Array.isArray(id) && id.length > 0)) {
    const deduplicated = Array.from(new Set(id))
    const pipeline = redis.pipeline()
    for (const el of deduplicated) {
      pipeline.sismember(mkchatskey(shard), el)
    }

    const pipeback = await pipeline.exec().catch(() => {
      res.status(500).end()
      return []
    })
    const prebreads = pipeback.map(([err, value], idx) => !err && value === 1 ? deduplicated[idx] : false).filter(el => !!el)

    res.status(200).json({
      type: 'contactinfo',
      id: prebreads
    })

    const pipeline2 = redis.pipeline()
    prebreads.forEach(id => {
      if (id.indexOf('-') === -1) {
        pipeline2.lpush(mkrawbreadkey(shard), JSON.stringify({
          type: 'contactInfo_v001',
          jid: `${id}@s.whatsapp.net`
        }))
      } else {
        pipeline2.lpush(mkrawbreadkey(shard), JSON.stringify({
          type: 'groupInfo_v001',
          jid: `${id}@g.us`
        }))
      }
    })
    pipeline2.exec()
  } else {
    res.status(400).end()
  }
}

module.exports = chatinfo
