const alreadytalkedto = ({ redis }) => (req, res) => {
  const shard = req.shard
  if (req.params.number) {
    const number = req.params.number

    redis.sismember(`zap:${shard}:chats`, number)
      .catch(() => {
        res.status(500).end()
      })
      .then(alreadytalkedto => {
        res.status(200).json({
          type: 'alreadytalkedto',
          shard,
          number,
          alreadytalkedto: !!alreadytalkedto
        })
      })
  } else {
    res.status(400).end()
  }
}

module.exports = alreadytalkedto
