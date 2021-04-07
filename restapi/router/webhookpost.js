const webhookpost = ({ redis, mkwebhookkey }) => (req, res) => {
  const webhook = req.body.webhook
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookpost`)

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
