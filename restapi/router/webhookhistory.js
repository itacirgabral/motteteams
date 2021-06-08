const webhookhistory = ({ redis, mkwebhookhistorykey, mktskey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'webhookhistory'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'webhookhistory')
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
