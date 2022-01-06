const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const webhook2get = ({ redis, mkwebhook2key, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'webhook2get' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'webhook2get')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhook2get,to`)

  redis.get(mkwebhook2key(shard))
    .catch(() => {
      res.status(500).end()
    }).then(webhook2 => {
      res.status(200).json({
        type: 'readweb2hook',
        shard,
        webhook2
      })
    })
}

module.exports = webhook2get
