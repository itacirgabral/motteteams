// await conn.requestPresenceUpdate ("xyz@c.us") // request the update
const mkCall = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`

  return async (data) => {
    const json = JSON.stringify({ event: 'call', data: data })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = mkCall
