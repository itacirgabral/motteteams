const webhookdelete = ({ redis, mkwebhookkey }) => (req, res) => {
  const shard = req.shard

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
