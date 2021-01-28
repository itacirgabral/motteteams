const webhookget = ({ redis, mkwebhookkey }) => (req, res) => {
  const shard = req.shard

  redis.get(mkwebhookkey(shard))
    .catch(() => {
      res.status(500).end()
    }).then(webhook => {
      res.status(200).json({
        type: 'readwebhook',
        shard,
        webhook
      })
    })
}

module.exports = webhookget
