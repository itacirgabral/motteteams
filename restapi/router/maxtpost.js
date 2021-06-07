const maxtpost = ({ redis, mkmaxtkey, mktskey }) => (req, res) => {
  const maxt = String(req.body.maxt)
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},webhookpost,to`)

  if (maxt) {
    redis.set(mkmaxtkey(shard), maxt)
      .catch(() => {
        res.status(500)
      }).then(() => {
        res.status(200).json({
          type: 'createmaxt',
          shard,
          maxt
        })
      })
  } else {
    res.status(400)
  }
}
module.exports = maxtpost
