const messageUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`

  return async (update) => {
    const json = JSON.stringify({ event: 'message-update', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = messageUpdate
