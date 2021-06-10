const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const allchats = ({ redis, mkchatskey, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'allchats'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'allchats')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},allchats,to`)

  redis.smembers(mkchatskey(shard))
    .catch(() => {
      res.status(500).end()
    })
    .then(chats => {
      res.status(200).json({
        type: 'allchats',
        shard: req.shard,
        chats
      })
    })
}

module.exports = allchats
