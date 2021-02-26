const allchats = ({ redis, mkchatskey }) => (req, res) => {
  const shard = req.shard
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
