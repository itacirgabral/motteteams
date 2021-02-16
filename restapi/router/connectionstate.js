const connectionstate = ({ redis, hardid, panoptickey }) => (req, res) => {
  const shard = req.shard
  const bread = JSON.stringify({ hardid, type: 'connectionstate', shard })

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type: 'connectionstate' })
    })
}

module.exports = connectionstate
