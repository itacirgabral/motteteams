const maxtdelete = ({ redis, mkmaxtkey, mktskey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'allchats'})

  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookdelete,to`)

  const key = mkmaxtkey(shard)

  const pipeline = redis.pipeline()
  pipeline.get(key)// 0
  pipeline.del(key)// 1

  pipeline.exec()
    .catch(() => {
      res.status(500).end()
    })
    .then(result => {
      res.status(200).json({
        type: 'removemaxt',
        shard,
        webhook: result[0][1]
      })
    })
}

module.exports = maxtdelete
