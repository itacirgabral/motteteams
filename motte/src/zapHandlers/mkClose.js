/**
 * when the connection has closed
 * on (event: 'close', listener: (err: {reason?: DisconnectReason | string, isReconnecting: boolean}) => void): this
 */
const close = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookKey = `zap:${seed.shard}:webhook`
  const credsKey = `zap:${seed.shard}:creds`
  const closereasonkey = `zap:${seed.shard}:closereason`
  const checkinkey = `zap:${seed.shard}:checkin`
  const tskey = `zap:${seed.shard}:ts:event:close`

  return async (err) => {
    const json = JSON.stringify({ event: 'close', data: err })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.get(webhookKey)// 2
    pipeline.del(checkinkey)// 3
    pipeline.publish(newsKey, json)// 4
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', seed.shard, 'event', 'close')

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
      hardid: seed.shard,
      shard: seed.hardid
    }))

    pipeline.set(closereasonkey, err.reason)

    if (err.reason === 'invalid_session') {
      pipeline.del(credsKey)
    }
    if (err.reason !== 'intentional ') {
      const gonnaDown = JSON.stringify({
        type: 'disconnectsilent', // skip "already" log
        hardid: seed.hardid,
        shard: seed.shard
      })
      pipeline.publish(panoptickey, gonnaDown)
    }

    await pipeline.exec()
  }
}

module.exports = close
