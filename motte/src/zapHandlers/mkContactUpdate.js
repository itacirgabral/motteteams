/**
 * when a contact is updated
 * on (event: 'contact-update', listener: (update: WAContactUpdate) => void): this
 */

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const contactUpdate = (seed) => {
  const panoptickey = 'zap:panoptic'
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:contact-update`

  return async (update) => {
    const json = JSON.stringify({ event: 'contact-update', data: update })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'contact-update')
    pipeline.publish(newsKey, json)

    const notifysent = {
      type: 'sendhook',
      hardid: seed.hardid,
      shard: seed.shard
    }

    if (update.jid.indexOf('@s.whatsapp.nets') !== -1) {
      notifysent.json = JSON.stringify({
        type: 'contact update',
        shard: seed.shard,
        number: update.jid.split('@s.whatsapp.net')[0],
        name: update.name,
        notify: update.notify,
        status: update.status,
        avatar: update.imgUrl
      })
    } else {
      notifysent.json = JSON.stringify({
        type: 'group update',
        shard: seed.shard,
        number: update.jid.split('@g.us')[0],
        avatar: update.imgUrl
      })
    }

    pipeline.publish(panoptickey, JSON.stringify(notifysent))

    await pipeline.exec()
  }
}

module.exports = contactUpdate
