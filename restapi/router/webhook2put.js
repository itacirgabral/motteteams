const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const webhook2put = ({ redis, mkwebhook2key, mktsroutekey }) => (req, res) => {
  const webhook2 = req.body.webhook2
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'webhook2put' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'webhook2put')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhook2put,to`)

  redis.getset(mkwebhook2key(shard), webhook2)
    .catch(() => {
      res.status(500).end()
    })
    .then(webhook2old => {
      res.status(200).json({
        type: 'updatewebhook2',
        shard,
        webhook2new: webhook2,
        webhook2old
      })
    })
}

module.exports = webhook2put
