/**
 * when the contacts has received
 * on (event: 'contacts-received', listener: () => void): this
 */

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const contactsReceived = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const checkinkey = `zap:${seed.shard}:checkin`
  const tskey = `zap:${seed.shard}:ts:event:contacts-received`

  return async () => {
    const json = JSON.stringify({ event: 'contacts-received', data: null })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'contacts-received')
    await pipeline.exec()

    // const checkinloop = () => {
    //   if (seed.conn.chats.array.length !== 0) {
    //     const pipeline = seed.redis.pipeline()
    //     const checkin = seed.conn.chats.array
    //       .filter(el => el.count)
    //       .map(({ jid, count }) => ({
    //         jid,
    //         count
    //       }))

    //     pipeline.set(checkinkey, JSON.stringify(checkin))

    //     // o contacts-received pode demorar muito se a conexão do aparelho for ruim
    //     // // libera o punk drummer
    //     // const breadSpread = JSON.stringify({ hardid: seed.hardid, type: 'spreadrestart', shard: seed.shard })
    //     // pipeline.publish(panoptickey, breadSpread)

    //     // // liga o baterista
    //     // const breadQueue = JSON.stringify({ hardid: seed.hardid, type: 'queuerestart', shard: seed.shard })
    //     // pipeline.publish(panoptickey, breadQueue)

    //     pipeline.exec()
    //   } else {
    //     setTimeout(checkinloop, 100)
    //   }
    // }
    // checkinloop()
  }
}

module.exports = contactsReceived
