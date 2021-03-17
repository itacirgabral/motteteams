const disconnect = ({ redis, hardid, panoptickey }) => (req, res) => {
  const shard = req.shard
  const type = 'disconnect'
  const bread = JSON.stringify({ hardid, type, shard })

  const date = new Date()
  console.log(`${date.toLocaleString('pt-br')} disconnect:${hardid}:${shard}`)

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type, shard })
    })
}

module.exports = disconnect
