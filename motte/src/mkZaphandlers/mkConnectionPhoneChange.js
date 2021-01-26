/**
 * when the connection to the phone changes
 * on (event: 'connection-phone-change', listener: (state: {connected: boolean}) => void): this
 */
const connectionPhoneChange = ({ shard, redis, connP }) => {
  const logKey = `zap:${shard}:log`
  const newsKey = `zap:${shard}:news`

  return async (state) => {
    const json = JSON.stringify({ event: 'connection-phone-change', data: state })
    const pipeline = redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 99)
    pipeline.publish(newsKey, json)
    await pipeline.exec()
  }
}

module.exports = connectionPhoneChange
