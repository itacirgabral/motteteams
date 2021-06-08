const webhookpost = ({ redis, mkwebhookkey, mktskey }) => (req, res) => {
  const webhook = req.body.webhook
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'webhookpost'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'webhookpost')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookpost,to`)

  if (webhook) {
    redis.set(mkwebhookkey(shard), webhook)
      .catch(() => {
        res.status(500)
      }).then(() => {
        res.status(200).json({
          type: 'createwebhook',
          shard,
          webhook
        })
      })
  } else {
    res.status(400)
  }
}
module.exports = webhookpost
