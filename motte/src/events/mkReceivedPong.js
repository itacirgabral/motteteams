/**
 * when WA sends back a pong
 * on (event: 'received-pong', listener: () => void): this
 */

const receivedPong = (seed) => {
  const newsKey = `zap:${seed.shard}:news`
  const pongKey = `zap:${seed.shard}:pong`
  const EX = 'EX'
  const ttl = 30

  return async () => {
    const now = Date.now()
    const json = JSON.stringify({ event: 'received-pong', data: null })

    const pipeline = seed.redis.pipeline()
    pipeline.set(pongKey, now, EX, ttl)
    pipeline.publish(newsKey, json)
    await pipeline.exec()

    console.log('### received-pong conn ########')
    console.dir(seed?.conn)
  }
}

module.exports = receivedPong
