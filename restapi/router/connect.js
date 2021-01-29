const connect = ({ redis, hardid, panoptickey }) => (req, res) => {
  const shard = req.shard
  const typeDisconnect = 'disconnect'
  const bread = JSON.stringify({ hardid, type: typeDisconnect, shard })

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      setTimeout(() => {
        const typeConnect = 'connect'
        const bread = JSON.stringify({ hardid, type: typeConnect, shard })
        redis.publish(panoptickey, bread)
          .catch(() => {
            res.status(500).end()
          })
          .then(() => {
            res.status(200).json({ type: typeConnect, shard })
          })
      }, 500)
    })
}

module.exports = connect
