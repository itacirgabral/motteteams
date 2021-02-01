const webhookhistory = ({ redis, mkwebhookhistorykey }) => (req, res) => {
  const shard = req.shard

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
