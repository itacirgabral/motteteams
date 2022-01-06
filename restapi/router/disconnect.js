const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const rediskeys = require('../rediskeys')
const crypto = require('crypto')

const disconnect = ({ redis, hardid, panoptickey, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'disconnect' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'disconnect')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},disconnect,to`)

  const type = 'disconnect'
  const bread = JSON.stringify({ hardid, type, shard })

  /** WIP GMAPI-506 **/
  const cacapa = `hardid:${hardid}:zap:${shard}:cacapa_${crypto.randomBytes(16).toString('base64')}`
  redis.xadd(rediskeys.panoptickey, '*', 'hardid', hardid, 'type', 'disconnect', 'shard', shard, 'cacapa', cacapa)

  redis.publish(panoptickey, bread)
    .catch(() => {
      res.status(500).end()
    })
    .then(() => {
      res.status(200).json({ type, shard })
    })
}

module.exports = disconnect
