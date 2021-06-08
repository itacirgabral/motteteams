const connectionstate = ({ redis, hardid, panoptickey, mktskey }) => (req, res) => {
  const shard = req.shard
  const blockingRedis = redis.duplicate()
  const tskey = mktskey({ shard, route: 'connectionstate'})

  redis.call('TS.ADD', tskey, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'connectionstate')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},connectionstate,to`)

  const cacapa = `zap:${shard}:cacapa_${Math.random()}`
  const bread = JSON.stringify({
    hardid,
    type: 'connectionstate',
    shard,
    cacapa
  })

  blockingRedis.blpop(cacapa, 20)
    .catch(err => {
      console.error(err)
      res.status(500).end()

      return false
    })
    .then(el => {
      if (el) {
        const connectionstate = JSON.parse(el[1])
        res.status(200).json(connectionstate)
      }
    })

  redis.publish(panoptickey, bread)
}

module.exports = connectionstate
