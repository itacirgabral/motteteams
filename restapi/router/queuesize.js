const queuesize = ({ redis, hardid, mkrawbreadkey, mktskey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'allchats'})

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
