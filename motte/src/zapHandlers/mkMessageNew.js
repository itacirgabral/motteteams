const path = require('path')

const messageNew = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookkey = `zap:${seed.shard}:webhook`
  const spreadkey = `zap:${seed.shard}:spread`

  return async (message) => {
    const json = JSON.stringify({ event: 'message-new', data: message })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.publish(newsKey, json)// 2
    pipeline.get(webhookkey)// 3

    const wbi = message.toJSON()
    pipeline.publish(spreadkey, JSON.stringify(wbi))
    await pipeline.exec()
  }
}

module.exports = messageNew
