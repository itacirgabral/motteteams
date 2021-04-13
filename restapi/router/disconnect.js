const disconnect = ({ redis, hardid, panoptickey }) => (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},disconnect,destinho,tamanho`)

  const type = 'disconnect'
  const bread = JSON.stringify({ hardid, type, shard })

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type, shard })
    })
}

module.exports = disconnect
