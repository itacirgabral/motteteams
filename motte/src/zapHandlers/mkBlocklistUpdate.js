/**
 * when a user is blocked or unblockd
 * on (event: 'blocklist-update', listener: (update: BlocklistUpdate) => void): this
 */
const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const blocklistUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:blocklist-update`

  return async (update) => {
    const json = JSON.stringify({ event: 'blocklist-update', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'blocklist-update')
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = blocklistUpdate
