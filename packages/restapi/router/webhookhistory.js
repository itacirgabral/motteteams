const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const webhookhistory = ({ redis, mkwebhookhistorykey, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'webhookhistory' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'webhookhistory')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookhistory,to`)

  redis.lrange(mkwebhookhistorykey(shard), 0, -1)
    .catch(() => {
      res.status(500).end()
    }).then(history => {
      res.status(200).json({
        type: 'webhookhistory',
        shard,
        history: history.map(el => JSON.parse(el))
      })
    })
}

module.exports = webhookhistory
