const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const messageNew = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const spreadkey = `zap:${seed.shard}:spread`
  const tskey = `zap:${seed.shard}:ts:event:message-new`

  return async (message) => {
    console.log('messageNew')
    const json = JSON.stringify({ event: 'message-new', data: message })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.publish(newsKey, json)// 2
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'message-new')

    const wbi = message.toJSON()
    if (!wbi.key.fromMe) {
      pipeline.publish(spreadkey, JSON.stringify(wbi))
    }

    await pipeline.exec()
  }
}

module.exports = messageNew
