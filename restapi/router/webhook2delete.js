const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const webhook2delete = ({ redis, mkwebhook2key, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'webhook2delete' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'webhook2delete')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhook2delete,to`)

  const key = mkwebhook2key(shard)

  const pipeline = redis.pipeline()
  pipeline.get(key)// 0
  pipeline.del(key)// 1

  pipeline.exec()
    .catch(() => {
      res.status(500).end()
    })
    .then(result => {
      res.status(200).json({
        type: 'removewebhook2',
        shard,
        webhook2: result[0][1]
      })
    })
}

module.exports = webhook2delete
