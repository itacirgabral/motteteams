/**
 * when the group is updated
 * on (event: 'group-update', listener: (update: Partial<WAGroupMetadata> & {jid: string, actor?: string}) => void): this
 */
const groupUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`

  return async (user) => {
    const json = JSON.stringify({ event: 'group-update', data: user })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = groupUpdate