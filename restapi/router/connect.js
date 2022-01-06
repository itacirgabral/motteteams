const rediskeys = require('../rediskeys')
const crypto = require('crypto')

const connect = ({ redis, mkcredskey, mkconnstunkey, hardid, panoptickey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},connect,to`)

  /** WIP GMAPI-506 **/
  // GMAPI 2 passthru
  const cacapa = `hardid:${hardid}:zap:${shard}:cacapa_${crypto.randomBytes(16).toString('base64')}`
  await redis.xadd(rediskeys.panoptickey, '*', 'hardid', hardid, 'type', 'connect', 'shard', shard, 'cacapa', cacapa)
}

module.exports = connect
