const queuesize = ({ redis, hardid, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const fifokey = mkrawbreadkey(shard)

  const queuesize = await redis.llen(fifokey)

  res.status(200).json({
    type: 'queuesize',
    shard,
    queuesize
  })
}

module.exports = queuesize
