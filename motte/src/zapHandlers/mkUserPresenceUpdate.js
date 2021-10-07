const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

// await conn.requestPresenceUpdate ("xyz@c.us") // request the update
const userPresenceUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:user-presence-update`

  return async (update) => {
    console.log('userPresenceUpdate')
    const json = JSON.stringify({ event: 'user-presence-update', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'user-presence-update')

    await pipeline.exec()
  }
}

module.exports = userPresenceUpdate
