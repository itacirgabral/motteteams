const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const cleanqueue = ({ redis, hardid, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'cleanqueue' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'cleanqueue')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},cleanqueue,to`)

  const fifokey = mkrawbreadkey(shard)

  const posfix = 'posfixname__c43887towv5t879pm5y4w67'
  const posname = `${fifokey}:${posfix}`

  const pipeline = redis.pipeline()
  pipeline.rename(fifokey, posname) // 0
  pipeline.lrange(posname, 0, -1) // 1
  pipeline.del(posname) // 2

  const pipeback = await pipeline.exec().catch(() => {
    res.status(500).end()
    return false
  })

  if (pipeback) {
    const err = pipeback[1][0]
    const data = pipeback[1][1]
    if (err) {
      res.status(500).end()
    } else {
      const queue = data.map(JSON.parse).map(el => ({
        ...el,
        type: el.type.split('_')[0],
        jid: el.jid.split('@')[0],
        path: undefined,
        ondiskname: undefined
      }))

      res.status(200).json({
        type: 'cleanqueue',
        shard,
        queue
      })
    }
  }
}

module.exports = cleanqueue
