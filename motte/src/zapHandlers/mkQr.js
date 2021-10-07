const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

/**
 * when a new QR is generated, ready for scanning
 * on (event: 'qr', listener: (qr: string) => void): this
 */
const qr = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:qr`

  return async (qr) => {
    console.log('qr')
    const json = JSON.stringify({ event: 'qr', data: qr })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'qr')

    await pipeline.exec()
  }
}

module.exports = qr
