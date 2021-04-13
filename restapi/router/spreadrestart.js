const spreadrestart = ({ redis, hardid, panoptickey }) => (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},spreadrestart,destinho,tamanho`)

  const bread = JSON.stringify({ hardid, type: 'spreadrestart', shard })

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type: 'spreadrestart' })
    })
}

module.exports = spreadrestart
