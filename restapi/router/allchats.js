const allchats = ({ redis, mkchatskey, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'allchats'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'allchats')
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
