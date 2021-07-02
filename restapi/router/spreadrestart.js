const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const spreadrestart = ({ redis, hardid, mkconnstunkey, panoptickey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'spreadrestart' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'spreadrestart')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},spreadrestart,to`)

  const connstunkey = mkconnstunkey(shard)
  const connstun = await redis.exists(connstunkey)

  if (!connstun) {
    const bread = JSON.stringify({ hardid, type: 'spreadrestart', shard })

    redis.publish(panoptickey, bread)
      .catch(() => {
        res.status(500).end()
      })
      .then(() => {
        res.status(200).json({ type: 'spreadrestart' })
      })
  } else {
    res.status(200).json({
      type: 'spreadrestart',
      shard,
      reason: 'stunning'
    })
  }
}

module.exports = spreadrestart
