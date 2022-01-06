const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const webhook2post = ({ redis, mkwebhook2key, mktsroutekey }) => (req, res) => {
  const webhook2 = req.body.webhook2
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'webhook2post' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'webhook2post')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhook2post,to`)

  if (webhook2) {
    redis.set(mkwebhook2key(shard), webhook2)
      .catch(() => {
        res.status(500)
      }).then(() => {
        res.status(200).json({
          type: 'createwebhook2',
          shard,
          webhook2
        })
      })
  } else {
    res.status(400)
  }
}
module.exports = webhook2post
