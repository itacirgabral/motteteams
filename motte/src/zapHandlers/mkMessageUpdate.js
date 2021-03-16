const messageUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const spreadkey = `zap:${seed.shard}:spread`

  return async (update) => {
    const json = JSON.stringify({ event: 'message-update', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)

    const wbi = update.toJSON()
    pipeline.publish(spreadkey, JSON.stringify(wbi))
    await pipeline.exec()
  }
}

module.exports = messageUpdate
