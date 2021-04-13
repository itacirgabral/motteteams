const connect = ({ redis, mkcredskey, hardid, panoptickey }) => async (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},connect,destinho,tamanho`)

  const typeDisconnect = 'disconnectsilent'
  const bread = JSON.stringify({ hardid, type: typeDisconnect, shard })

  const credsExists = await redis.exists(mkcredskey(shard))

  if (credsExists) {
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
  } else {
    res.status(400).json({ type: 'connect', shard, reason: 'invalid_session' })
  }
}

module.exports = connect
