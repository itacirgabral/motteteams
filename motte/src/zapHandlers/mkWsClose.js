const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

/**
 *  when the socket has closed
 * on (event: 'ws-close', listener: (err: {reason?: DisconnectReason | string}) => void): this
 */
const wsClose = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:ws-close`

  return async (err) => {
    // console.log('wsClose')
    const json = JSON.stringify({ event: 'ws-close', data: err })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'ws-close')

    await pipeline.exec()
  }
}

module.exports = wsClose
