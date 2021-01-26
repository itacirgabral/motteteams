/**
 *  when the socket has closed
 * on (event: 'ws-close', listener: (err: {reason?: DisconnectReason | string}) => void): this
 */
const wsClose = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async (err) => {
    const json = JSON.stringify({ event: 'ws-close', data: err })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)
    await pipeline.exec()
  }
}

module.exports = wsClose
