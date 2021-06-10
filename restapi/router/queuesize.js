const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const queuesize = ({ redis, hardid, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'queuesize'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'queuesize')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},queuesize,to`)

  const fifokey = mkrawbreadkey(shard)

  const queuesize = await redis.llen(fifokey)

  res.status(200).json({
    type: 'queuesize',
    shard,
    queuesize
  })
}

module.exports = queuesize
