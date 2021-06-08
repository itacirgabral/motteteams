const alreadytalkedto = ({ redis, mktskey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'alreadytalkedto'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'alreadytalkedto')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},alreadytalkedto,to`)

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
