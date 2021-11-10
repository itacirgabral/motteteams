const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const maxtpost = ({ redis, mkmaxtkey, mktsroutekey }) => (req, res) => {
  const maxt = String(req.body.maxt)
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'createmaxt' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'createmaxt')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},createmaxt,to`)

  if (maxt) {
    redis.set(mkmaxtkey(shard), maxt)
      .catch(() => {
        res.status(500)
      }).then(() => {
        res.status(200).json({
          type: 'createmaxt',
          shard,
          maxt
        })
      })
  } else {
    res.status(400)
  }
}
module.exports = maxtpost
