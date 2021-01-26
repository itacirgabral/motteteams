/**
 * when WA sends back a pong
 * on (event: 'received-pong', listener: () => void): this
 */

const receivedPong = ({ shard, redis, connP }) => {
  const newsKey = `zap:${shard}:news`
  const pongKey = `zap:${shard}:pong`
  const EX = 'EX'
  const ttl = 30

  return async () => {
    const now = Date.now()
    const json = JSON.stringify({ event: 'received-pong', data: null })

    const pipeline = redis.pipeline()
    pipeline.set(pongKey, now, EX, ttl)
    pipeline.publish(newsKey, json)
    await pipeline.exec()
  }
}

module.exports = receivedPong
