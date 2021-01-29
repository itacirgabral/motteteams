const fetch = require('node-fetch')

/**
 * when a new chat is added
 * on (event: 'chat-new', listener: (chat: WAChat) => void): this
 */
const chatNew = (seed) => {
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

    const pipeback = await pipeline.exec()

    if (!pipeback[3][0] && pipeback[3][1] && number) {
      const webhook = pipeback[3][1]

      await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'new contact',
          shard: seed.shard,
          number
        })
      }).catch(() => {})
    }
  }
}

module.exports = chatNew
