const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

/**
 * when a user's status is updated
 * on (event: 'user-status-update', listener: (update: {jid: string, status?: string}) => void): this
 */
const userStatusUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:user-status-update`

  return async (update) => {
    console.log('userStatusUpdate')
    const json = JSON.stringify({ event: 'user-status-update', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'user-status-update')

    await pipeline.exec()
  }
}

module.exports = userStatusUpdate
