const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const rediskeys = require('../rediskeys')
const crypto = require('crypto')

const connectionstate = ({ redis, hardid, panoptickey, mktsroutekey }) => (req, res) => {
  const shard = req.shard
  const blockingRedis = redis.duplicate()
  const tskey = mktsroutekey({ shard, route: 'connectionstate' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'connectionstate')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},connectionstate,to`)

  const cacapa = `hardid:${hardid}:zap:${shard}:cacapa_${crypto.randomBytes(16).toString('base64')}`
  const bread = JSON.stringify({
    hardid,
    type: 'connectionstate',
    shard,
    cacapa
  })

  blockingRedis.blpop(cacapa, 20)
    .catch(err => {
      console.error(err)
      res.status(500).end()

      return false
    })
    .then(el => {
      if (el) {
        const connectionstate = JSON.parse(el[1])
        res.status(200).json(connectionstate)
      }
    })

  redis.publish(panoptickey, bread)

  /** WIP GMAPI-506 **/
  redis.xadd(rediskeys.panoptickey, '*', 'hardid', hardid, 'type', 'connectionstate', 'shard', shard, 'cacapa', cacapa)
}

module.exports = connectionstate
