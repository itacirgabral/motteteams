/**
 * when multiple chats are updated (new message, updated message, deleted, pinned, etc)
 * on (event: 'chats-update', listener: (chats: WAChatUpdate[]) => void): this
 */

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const chatsUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:chats-update`

  return async (chats) => {
    console.log('chatsUpdate')
    const json = JSON.stringify({ event: 'chats-update', data: chats })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'chats-update')
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = chatsUpdate
