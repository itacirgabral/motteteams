const queuerestart = ({ redis, hardid, mkconnstunkey, panoptickey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'queuerestart'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'queuerestart')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},queuerestart,to`)

  const connstunkey = mkconnstunkey(shard)
  const connstun = await redis.exists(connstunkey)

  if (!connstun) {
    const bread = JSON.stringify({ hardid, type: 'queuerestart', shard })
    redis.publish(panoptickey, bread)
      .catch(() => {
        res.status(500).end()
      })
      .then(() => {
        res.status(200).json({ type: 'queuerestart' })
      })
  } else {
    res.status(200).json({
      type: 'queuerestart',
      shard,
      reason: 'stunning'
    })
  }
}

module.exports = queuerestart
