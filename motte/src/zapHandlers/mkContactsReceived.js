/**
 * when the contacts has received
 * on (event: 'contacts-received', listener: () => void): this
 */
const contactsReceived = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const panoptickey = 'zap:panoptic'
  const bread = JSON.stringify({ hardid: seed.hardid, type: 'queuerestart', shard: seed.shard })

  return async () => {
    const json = JSON.stringify({ event: 'contacts-received', data: null })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.publish(panoptickey, bread)
    await pipeline.exec()
  }
}

module.exports = contactsReceived
