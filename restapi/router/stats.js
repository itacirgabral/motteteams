const stats = ({ redis, mktskey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'stats'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'stats')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},stats,to`)

  const pipeline = redis.pipeline()
  pipeline.get(`zap:${shard}:pong`) // 0
  pipeline.hget(`zap:${shard}:stats`, 'lastsentmessagetimestamp') // 1
  pipeline.hget(`zap:${shard}:stats`, 'sortmeandelta') // 2
  pipeline.hget(`zap:${shard}:stats`, 'longmeandelta') // 3
  pipeline.hget(`zap:${shard}:stats`, 'totalsentmessage') // 4

  pipeline.exec()
    .catch(() => {
      res.status(500).end()
    })
    .then(([
      [, pong],
      [, lastsentmessagetimestamp],
      [, sortmeandelta],
      [, longmeandelta],
      [, totalsentmessage]
    ]) => {
      res.status(200).json({
        type: 'stats',
        pong,
        lastsentmessagetimestamp,
        sortmeandelta,
        longmeandelta,
        totalsentmessage
      })
    })
}

module.exports = stats
