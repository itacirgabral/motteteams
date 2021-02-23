const loadmessages = ({ redis, hardid, panoptickey }) => (req, res) => {
  const shard = req.shard
  const number = req.body.number
  const count = req.body.count
  const wid = req.body.wid
  const bread = JSON.stringify({ hardid, type: 'loadmessages', shard, number, count, wid })

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type: 'loadmessages', shard, number, count, wid })
    })
}

module.exports = loadmessages
