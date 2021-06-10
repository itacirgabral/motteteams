// await conn.requestPresenceUpdate ("xyz@c.us") // request the update
const mkBattery = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:battery`

  return async (data) => {
    const json = JSON.stringify({ event: 'battery', data: data })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', seed.shard, 'event', 'battery')
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = mkBattery
