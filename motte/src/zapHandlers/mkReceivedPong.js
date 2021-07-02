const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')
/**
 * when WA sends back a pong
 * on (event: 'received-pong', listener: () => void): this
 */

const receivedPong = (seed) => {
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:received-pong`
  const pongKey = `zap:${seed.shard}:pong`
  const EX = 'EX'
  const ttl = 30

  return async () => {
    const now = Date.now()
    const json = JSON.stringify({ event: 'received-pong', data: null })

    const pipeline = seed.redis.pipeline()
    pipeline.set(pongKey, now, EX, ttl)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'received-pong')

    await pipeline.exec()
  }
}

module.exports = receivedPong
