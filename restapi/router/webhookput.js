const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const webhookput = ({ redis, mkwebhookkey, mktsroutekey }) => (req, res) => {
  const webhook = req.body.webhook
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'webhookput'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'webhookput')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookput,to`)

  redis.getset(mkwebhookkey(shard), webhook)
    .catch(() => {
      res.status(500).end()
    })
    .then(webhookold => {
      res.status(200).json({
        type: 'updatewebhook',
        shard,
        webhooknew: webhook,
        webhookold
      })
    })
}

module.exports = webhookput
