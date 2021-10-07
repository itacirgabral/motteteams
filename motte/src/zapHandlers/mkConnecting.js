/**
 *  when the connection is opening
 * on (event: 'connecting', listener: () => void): this
 */

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const connecting = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:connecting`

  return async () => {
    console.log('connecting')
    const json = JSON.stringify({ event: 'connecting', data: null })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'connecting')

    await pipeline.exec()
  }
}

module.exports = connecting
