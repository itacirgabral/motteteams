/**
 * when chats are sent by WA, and when all messages are received from WhatsApp
 * on (event: 'chats-received', (update: {hasNewChats?: boolean, hasReceivedLastMessage?: boolean}) => void): this
 */
const chatsReceived = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async ({ hasNewChats, hasReceivedLastMessage }) => {
    const conn = await connP
    const json = JSON.stringify({ event: 'chat-new', data: { hasNewChats, hasReceivedLastMessage } })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)

    const knoweds = conn.chats.array
      .filter(({ jid = '' }) => jid.split('@s.whatsapp.net').length === 2)
      .map(({ jid }) => jid)

    const contactsKey = `zap:${shard}:contacts`
    pipeline.sadd(contactsKey, knoweds)
    await pipeline.exec()
  }
}
module.exports = chatsReceived
