const fetch = require('node-fetch')

/**
 * when the connection has closed
 * on (event: 'close', listener: (err: {reason?: DisconnectReason | string, isReconnecting: boolean}) => void): this
 */
const close = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookKey = `zap:${seed.shard}:webhook`

  return async (err) => {
    const json = JSON.stringify({ event: 'close', data: err })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.get(webhookKey)// 2
    pipeline.publish(newsKey, json)// 3

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'closed',
        shard: seed.shard,
        reason: err.reason
      })
    }
    pipeline.publish(panoptickey, JSON.stringify(notifysent))

    await pipeline.exec()
  }
}

module.exports = close
