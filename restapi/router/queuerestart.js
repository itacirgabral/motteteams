const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const rediskeys = require('../rediskeys')
const crypto = require('crypto')

const queuerestart = ({ redis, hardid, mkconnstunkey, panoptickey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'queuerestart' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'queuerestart')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},queuerestart,to`)

  const connstunkey = mkconnstunkey(shard)
  const connstun = await redis.exists(connstunkey)

  if (!connstun) {
    const bread = JSON.stringify({ hardid, type: 'queuerestart', shard })

    redis.publish(panoptickey, bread)
      .catch(() => {
        res.status(500).end()
      })
      .then(() => {
        res.status(200).json({ type: 'queuerestart' })
      })

    /** WIP GMAPI-506 **/
    const cacapa = `hardid:${hardid}:zap:${shard}:cacapa_${crypto.randomBytes(16).toString('base64')}`
    redis.xadd(rediskeys.panoptickey, '*', 'hardid', hardid, 'type', 'queuerestart', 'shard', shard, 'cacapa', cacapa)
  } else {
    res.status(200).json({
      type: 'queuerestart',
      shard,
      reason: 'stunning'
    })
  }
}

module.exports = queuerestart
