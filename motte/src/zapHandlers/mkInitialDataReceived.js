const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const initialDataReceived = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const credsKey = `zap:${seed.shard}:creds`
  const tskey = `zap:${seed.shard}:ts:event:credentials-updated`

  return async () => {
    // console.log('initialDataReceived')
    const creds = seed.conn.base64EncodedAuthInfo()

    const json = JSON.stringify({ event: 'credentials-updated', data: creds })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'credentials-updated')

    pipeline.set(credsKey, JSON.stringify(creds))
    pipeline.bgsave()

    await pipeline.exec()
  }
}

module.exports = initialDataReceived
