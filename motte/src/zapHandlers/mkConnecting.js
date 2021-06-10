/**
 *  when the connection is opening
 * on (event: 'connecting', listener: () => void): this
 */
const connecting = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:connecting`

  return async () => {
    const json = JSON.stringify({ event: 'connecting', data: null })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', seed.shard, 'event', 'connecting')

    await pipeline.exec()
  }
}

module.exports = connecting
