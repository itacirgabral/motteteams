/**
 * when a new chat is added
 * on (event: 'chat-new', listener: (chat: WAChat) => void): this
 */
const chatNew = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const contactsKey = `zap:${shard}:contacts`
  const newsKey = `zap:${shard}:news`

  return async (chat) => {
    const json = JSON.stringify({ event: 'chat-new', data: chat })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)

    if (chat.jid.split('@s.whatsapp.net').length === 2) {
      pipeline.sadd(contactsKey, chat.jid)
    }

    await pipeline.exec()
  }
}

module.exports = chatNew
