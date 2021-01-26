/**
 * when a user is blocked or unblockd
 * on (event: 'blocklist-update', listener: (update: BlocklistUpdate) => void): this
 */
const blocklistUpdate = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async (update) => {
    const json = JSON.stringify({ event: 'blocklist-update', data: update })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}

module.exports = blocklistUpdate
