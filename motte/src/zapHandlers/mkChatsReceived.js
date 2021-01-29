/**
 * when chats are sent by WA, and when all messages are received from WhatsApp
 * on (event: 'chats-received', (update: {hasNewChats?: boolean, hasReceivedLastMessage?: boolean}) => void): this
 */
const chatsReceived = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`

  return async (update) => {
    const json = JSON.stringify({ event: 'chats-received', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}
module.exports = chatsReceived
