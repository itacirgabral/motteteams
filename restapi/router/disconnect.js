const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const disconnect = ({ redis, hardid, panoptickey, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'disconnect'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'disconnect')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},disconnect,to`)

  const type = 'disconnect'
  const bread = JSON.stringify({ hardid, type, shard })

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type, shard })
    })
}

module.exports = disconnect
