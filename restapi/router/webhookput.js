const webhookput = ({ redis, mkwebhookkey }) => (req, res) => {
  const webhook = req.body.webhook
  const shard = req.shard

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