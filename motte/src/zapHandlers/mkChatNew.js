/**
 * when a new chat is added
 * on (event: 'chat-new', listener: (chat: WAChat) => void): this
 */
const chatNew = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const contactsKey = `zap:${seed.shard}:contacts`
  const webhookKey = `zap:${seed.shard}:webhook`

  return async (chat) => {
    const json = JSON.stringify({ event: 'chat-new', data: chat })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1

    const jid = chat.jid || ''
    let number
    if (jid.indexOf('-') === -1) {
      pipeline.sadd(contactsKey, chat.jid)// 2
      number = jid.split('@s.whatsapp.net')[0]
    }

    pipeline.get(webhookKey)// 3
    pipeline.publish(newsKey, json)// 4

    await pipeline.exec()

    if (number) {
      // buscar quem é esta pessoa
      const { notify } = seed.conn.contacts[jid]
      const [avatar, { status }] = await Promise.all([
        seed.conn.getProfilePicture(jid).catch(() => undefined),
        seed.conn.getStatus(jid).catch(() => ({ status: undefined }))
      ])

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
  }
}

module.exports = chatNew
