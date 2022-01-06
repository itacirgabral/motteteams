const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const webhookdelete = ({ redis, mkwebhookkey, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'webhookdelete' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'webhookdelete')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookdelete,to`)

  const key = mkwebhookkey(shard)

  const pipeline = redis.pipeline()
  pipeline.get(key)// 0
  pipeline.del(key)// 1

  pipeline.exec()
    .catch(() => {
      res.status(500).end()
    })
    .then(result => {
      res.status(200).json({
        type: 'removewebhook',
        shard,
        webhook: result[0][1]
      })
    })
}

module.exports = webhookdelete
