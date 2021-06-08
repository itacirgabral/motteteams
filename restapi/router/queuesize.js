const queuesize = ({ redis, hardid, mkrawbreadkey, mktskey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'queuesize'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'queuesize')
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
