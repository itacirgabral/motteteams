const maxtdelete = ({ redis, mkmaxtkey, mktskey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'removemaxt'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'removemaxt')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},removemaxt,to`)

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
