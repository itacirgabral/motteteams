const fetch = require('node-fetch')

/**
 * when a message's status is updated (deleted, delivered, read, sent etc.)
 * on (event: 'message-status-update', listener: (message: WAMessageStatusUpdate) => void): this
 */
const messageStatusUpdate = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`
  const webhookkey = `zap:${shard}:webhook`
  const markkey = `zap:${shard}:mark`

  const types = {
    2: 'sent',
    3: 'received',
    4: 'read'
  }

  return async (message) => {
    const json = JSON.stringify({ event: 'message-status-update', data: message })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 99)// 1
    pipeline.publish(newsKey, json)// 2
    pipeline.get(webhookkey)// 3

    message.ids.forEach(id => {
      pipeline.hget(markkey, id)
    })
    const result = await pipeline.exec()

    const to = message.to.split('@s.whatsapp.net')[0]
    if (to.indexOf('-') === -1) {
      const from = message.from.split('@s.whatsapp.net')[0]
      const timestamp = new Date(message.timestamp)
      const type = types[message.type]

      const webhook = result[3][1]
      message.ids.forEach((id, idx) => {
        const mark = result[4 + idx][1]
        if (mark) {
          const statusUpdate = {
            type,
            timestamp: timestamp.getTime(),
            to,
            from,
            wid: id,
            mark
          }

          if (webhook) {
            fetch(webhook, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(statusUpdate)
            }).catch(() => {})
          }
        }
      })
    }
  }
}

module.exports = messageStatusUpdate
