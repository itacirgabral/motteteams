const allchats = ({ redis, mkchatskey, mktskey }) => (req, res) => {
  const shard = req.shard

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
