const webhookget = ({ redis, mkwebhookkey, mktskey }) => (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookget,to`)

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
