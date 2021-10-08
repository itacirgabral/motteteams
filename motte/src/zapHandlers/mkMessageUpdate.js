const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const messageUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const spreadkey = `zap:${seed.shard}:spread`
  const tskey = `zap:${seed.shard}:ts:event:message-update`

  return async (update) => {
    // console.log('messageUpdate')
    const json = JSON.stringify({ event: 'message-update', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'message-update')

    const wbi = update.toJSON()
    pipeline.publish(spreadkey, JSON.stringify(wbi))
    await pipeline.exec()
  }
}

module.exports = messageUpdate
