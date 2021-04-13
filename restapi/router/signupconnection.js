const signupconnection = ({ redis, hardid, panoptickey }) => (req, res) => {
  console.log(`${(new Date()).toLocaleTimeString()},000000000000,signupconnection,destinho,tamanho`)

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
