const hardid = process.env.HARDID
const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

/**
 * when a message's status is updated (deleted, delivered, read, sent etc.)
 * on (event: 'message-status-update', listener: (message: WAMessageStatusUpdate) => void): this
 */
const messageStatusUpdate = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookkey = `zap:${seed.shard}:webhook`
  const markkey = `zap:${seed.shard}:mark`
  const tskey = `zap:${seed.shard}:ts:event:message-status-update`

  const types = {
    2: 'sent',
    3: 'received',
    4: 'read'
  }

  return async (message) => {
    console.log('messageStatusUpdate')
    const json = JSON.stringify({ event: 'message-status-update', data: message })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.publish(newsKey, json)// 2
    pipeline.get(webhookkey)// 3
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'message-status-update')

    const isntGroup = message.to.indexOf('-') === -1

    if (isntGroup) {
      message.ids.forEach(id => {
        pipeline.hget(markkey, id)// 4, 5, 6 ...
      })
    }
    const pipeback = await pipeline.exec()
    const webhook = pipeback[3][1]
    if (isntGroup && webhook) {
      const from = message.from.split('@s.whatsapp.net')[0]
      const timestamp = new Date(message.timestamp)

      const pipehook = seed.redis.pipeline()

      message.ids.forEach((id, idx) => {
        const mark = pipeback[4 + idx][1]
        if (mark) {
          const statusUpdate = {
            type: types[message.type],
            timestamp: String(timestamp.getTime()).slice(0, 10),
            to: message.to.split('@s.whatsapp.net')[0],
            from,
            wid: id,
            mark
          }

          const notifysent = {
            type: 'sendhook',
            hardid,
            shard: seed.shard,
            json: JSON.stringify(statusUpdate)
          }

          pipehook.publish(panoptickey, JSON.stringify(notifysent))
        }
      })

      await pipehook.exec()
    }
  }
}

module.exports = messageStatusUpdate
