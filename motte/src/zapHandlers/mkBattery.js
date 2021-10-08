// await conn.requestPresenceUpdate ("xyz@c.us") // request the update
const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const mkBattery = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:battery`

  return async (data) => {
    // console.log('mkBattery')
    const json = JSON.stringify({ event: 'battery', data: data })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'battery')
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = mkBattery
