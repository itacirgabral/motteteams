const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const signupconnection = ({ redis, hardid, panoptickey, mktsroutekey }) => (req, res) => {
  const tskey = mktsroutekey({ shard: '000000000000', route: 'signupconnection'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', '000000000000', 'route', 'signupconnection')
  console.log(`${(new Date()).toLocaleTimeString()},000000000000,signupconnection,to`)

  if (req.body.url) {
    const mitochondria = req.shard
    const type = 'signupconnection'
    const bread = JSON.stringify({
      hardid,
      type,
      url: req.body.url,
      shard: req.body.shard,
      mitochondria
    })

    redis.publish(panoptickey, bread)
      .catch(() => {
        res.status(500).end()
      }).then(() => {
        res.status(200).json({ type, url: req.body.url, shard: req.body.shard })
      })
  } else {
    res.status(400).end()
  }
}

module.exports = signupconnection
