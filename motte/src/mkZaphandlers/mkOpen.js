/**
 * when the connection has opened successfully
 * on (event: 'open', listener: (result: WAOpenResult) => void): this
 */
const open = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async (result) => {
    const json = JSON.stringify({ event: 'open', data: result })
    const pipeline = redis.pipeline(json)
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)
    await pipeline.exec()
  }
}

module.exports = open
