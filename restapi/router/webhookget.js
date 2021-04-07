const webhookget = ({ redis, mkwebhookkey }) => (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookget`)

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
