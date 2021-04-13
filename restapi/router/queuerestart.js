const queuerestart = ({ redis, hardid, panoptickey }) => (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},queuerestart,destinho,tamanho`)

  const bread = JSON.stringify({ hardid, type: 'queuerestart', shard })

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type: 'queuerestart' })
    })
}

module.exports = queuerestart
