/**
 * when a contact is updated
 * on (event: 'contact-update', listener: (update: WAContactUpdate) => void): this
 */
const contactUpdate = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async (update) => {
    const json = JSON.stringify({ event: 'contact-update', data: update })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = contactUpdate
