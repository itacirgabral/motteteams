const fetch = require('node-fetch')

/**
 * when the connection has opened successfully
 * on (event: 'open', listener: (result: WAOpenResult) => void): this
 */
const open = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookKey = `zap:${seed.shard}:webhook`
  const closereasonkey = `zap:${seed.shard}:closereason`

  return async (result) => {
    const json = JSON.stringify({ event: 'open', data: result })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.get(webhookKey)// 2
    pipeline.publish(newsKey, json)// 3
    pipeline.del(closereasonkey)// 4

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'opened',
        shard: seed.shard
      })
    }
    pipeline.publish(panoptickey, JSON.stringify(notifysent))

    await pipeline.exec()
  }
}

module.exports = open
