/**
 * when the group is updated
 * on (event: 'group-update', listener: (update: Partial<WAGroupMetadata> & {jid: string, actor?: string}) => void): this
 */
const groupUpdate = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async (user) => {
    const json = JSON.stringify({ event: 'group-update', data: user })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)
    await pipeline.exec()
  }
}

module.exports = groupUpdate
