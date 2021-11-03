const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')
// const stunttl = 60

const rediskeys = require('../rediskeys')
const crypto = require('crypto')

const connect = ({ redis, mkcredskey, mkconnstunkey, hardid, panoptickey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'connect' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'connect')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},connect,to`)

  const typeDisconnect = 'disconnectsilent'
  const connstunkey = mkconnstunkey(shard)
  const bread = JSON.stringify({ hardid, type: typeDisconnect, shard })

  const pipeline = redis.pipeline()
  pipeline.exists(mkcredskey(shard)) // 0
  pipeline.exists(connstunkey) // 1

  const [[, credsExists], [, connstun]] = await pipeline.exec()

  if (credsExists && !connstun) {
    // disconnect
    redis.publish(panoptickey, bread)
      .catch(() => {
        res.status(500).end()
      })
      .then(() => {
        const typeConnect = 'connect'
        const bread = JSON.stringify({ hardid, type: typeConnect, shard })

        const pipeline2 = redis.pipeline()
        // DESLIGANDO STUN
        // pipeline2.set(connstunkey, true, 'EX', stunttl)
        pipeline2.publish(panoptickey, bread)

        // connect && stun
        pipeline2.exec()
          .catch(() => {
            res.status(500).end()
          })
          .then(() => {
            res.status(200).json({ type: typeConnect, shard })
          })
      })

    /** WIP GMAPI-506 **/
    const cacapa = `hardid:${hardid}:zap:${shard}:cacapa_${crypto.randomBytes(16).toString('base64')}`
    redis.xadd(rediskeys.panoptickey, '*', 'hardid', hardid, 'type', 'connect', 'shard', shard, 'cacapa', cacapa)
  } else {
    res.status(400).json({
      type: 'connect',
      shard,
      reason: connstun ? 'stunning' : 'invalid_session'
    })
  }
}

module.exports = connect
