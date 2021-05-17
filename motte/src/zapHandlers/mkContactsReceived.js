/**
 * when the contacts has received
 * on (event: 'contacts-received', listener: () => void): this
 */
const contactsReceived = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const checkinkey = `zap:${seed.shard}:checkin`

  return async () => {
    const json = JSON.stringify({ event: 'contacts-received', data: null })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    await pipeline.exec()

    let n = 0
    const checkinloop = () => {
      if (seed.conn.chats.array.length !== 0) {
        const pipeline = seed.redis.pipeline()
        const checkin = seed.conn.chats.array.map(el => el.jid.split('@')[0])

        console.log(JSON.stringify(seed.conn.chats.array[0], null, 2))

        const notifysent = {
          type: 'sendhook',
          hardid: seed.hardid,
          shard: seed.shard,
          json: JSON.stringify({
            type: 'checkin',
            shard: seed.shard,
            checkin
          })
        }
        pipeline.publish(panoptickey, JSON.stringify(notifysent))
        pipeline.set(checkinkey, JSON.stringify(checkin))
        pipeline.exec()
      } else {
        n++
        console.log(`checkin loop ${n}`)
        setTimeout(checkinloop, 100)
      }
    }
    checkinloop()
  }
}

module.exports = contactsReceived
