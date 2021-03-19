/**
 * when the contacts has received
 * on (event: 'contacts-received', listener: () => void): this
 */
const contactsReceived = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`

  const n = 0

  return async () => {
    const json = JSON.stringify({ event: 'contacts-received', data: null })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    await pipeline.exec()

    setTimeout(() => {
      const checkin = seed.conn.chats.array.map((el, idx) => {
        const r = {}
        r.chat = el.jid.split('@')[0]
        r.name = el.name

        if (el.messages.array[0]?.key?.id) {
          const wid = el.messages.array[0].key.id
          r.wid = wid
        }

        return r
      })
        .filter(el => !!el.wid)

      const checkinString = JSON.stringify(checkin)
      console.log(checkinString)
    }, 5_000)
  }
}

module.exports = contactsReceived
