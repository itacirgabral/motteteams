const interestingupdates = ['s.whatsapp.net', 'g.us']
/**
 * when a new chat is added
 * on (event: 'chat-new', listener: (chat: WAChat) => void): this
 */
const chatNew = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const chatsKeys = `zap:${seed.shard}:chats`

  return async (chat) => {
    const json = JSON.stringify({ event: 'chat-new', data: chat })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1

    const [number, host] = chat.jid.split('@')[0]
    if (interestingupdates.includes(host)) {
      pipeline.sadd(chatsKeys, number)
    }
    pipeline.publish(newsKey, json)

    await pipeline.exec()

    /*
    // buscar info de grupo ou de contato
    if (number) {
      // buscar quem é esta pessoa
      const { notify } = seed.conn.contacts[jid]
      const [avatar, { status }] = await Promise.all([seed.conn.getProfilePicture(jid), seed.conn.getStatus(jid)])

      const notifysent = {
        type: 'sendhook',
        hardid: seed.hardid,
        shard: seed.shard,
        json: JSON.stringify({
          type: 'new contact',
          shard: seed.shard,
          number,
          name: notify,
          status,
          avatar
        })
      }
      seed.redis.publish(panoptickey, JSON.stringify(notifysent))
    }
    */
  }
}

module.exports = chatNew
