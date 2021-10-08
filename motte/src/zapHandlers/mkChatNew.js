const interestingupdates = ['s.whatsapp.net', 'g.us']
const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

/**
 * when a new chat is added
 * on (event: 'chat-new', listener: (chat: WAChat) => void): this
 */
const chatNew = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const chatsKeys = `zap:${seed.shard}:chats`
  const tskey = `zap:${seed.shard}:ts:event:chat-new`

  return async (chat) => {
    // console.log('chatNew')
    const json = JSON.stringify({ event: 'chat-new', data: chat })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'chat-new')

    const [number, host] = chat.jid.split('@')
    if (interestingupdates.includes(host)) {
      pipeline.sadd(chatsKeys, number)
    }
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = chatNew
