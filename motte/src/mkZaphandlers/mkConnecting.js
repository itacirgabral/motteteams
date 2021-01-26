/**
 *  when the connection is opening
 * on (event: 'connecting', listener: () => void): this
 */
const connecting = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async () => {
    const json = JSON.stringify({ event: 'connecting', data: null })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)
    await pipeline.exec()
  }
}

module.exports = connecting
