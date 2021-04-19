const messageNew = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const spreadkey = `zap:${seed.shard}:spread`

  return async (message) => {
    const json = JSON.stringify({ event: 'message-new', data: message })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.publish(newsKey, json)// 2

    const wbi = message.toJSON()
    if (!wbi.key.fromMe) {
      pipeline.publish(spreadkey, JSON.stringify(wbi))
    }

    await pipeline.exec()
  }
}

module.exports = messageNew
