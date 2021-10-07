/**
 * when the connection has closed
 * on (event: 'close', listener: (err: {reason?: DisconnectReason | string, isReconnecting: boolean}) => void): this
 */

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const close = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookKey = `zap:${seed.shard}:webhook`
  const credsKey = `zap:${seed.shard}:creds`
  const closereasonkey = `zap:${seed.shard}:closereason`
  const tskey = `zap:${seed.shard}:ts:event:close`

  return async (err) => {
    console.log('close')
    const json = JSON.stringify({ event: 'close', data: err })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.get(webhookKey)// 2
    pipeline.publish(newsKey, json)// 3
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'close')

    const d = new Date()

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard,
      json: JSON.stringify({
        type: 'closed',
        shard: seed.shard,
        reason: err.reason,
        time: d.toLocaleTimeString()
      })
    }
    pipeline.publish(panoptickey, JSON.stringify(notifysent))

    pipeline.publish(panoptickey, JSON.stringify({
      type: 'disconnect',
      hardid: seed.hardid,
      shard: seed.shard
    }))

    pipeline.set(closereasonkey, err.reason)

    if (err.reason === 'invalid_session') {
      pipeline.del(credsKey)
    }

    await pipeline.exec()
  }
}

module.exports = close
