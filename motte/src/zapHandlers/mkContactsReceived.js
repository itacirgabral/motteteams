/**
 * when the contacts has received
 * on (event: 'contacts-received', listener: () => void): this
 */

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')
const checkin = process.env.CHECKIN === 'yes'

const contactsReceived = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:contacts-received`
  const rawbreadkey = `zap:${seed.shard}:fifo:rawBread`

  return async () => {
    const json = JSON.stringify({ event: 'contacts-received', data: null })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'contacts-received')

    if (checkin) {
      // processar o checkin tem prioridade, vai pela direita
      pipeline.rpush(rawbreadkey, JSON.stringify({ type: 'checkin_v001', jid: `${seed.shard}@s.whatsapp.net` }))
    }

    await pipeline.exec()
  }
}

module.exports = contactsReceived
