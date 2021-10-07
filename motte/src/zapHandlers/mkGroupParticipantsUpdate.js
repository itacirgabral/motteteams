/**
 * when participants are added to a group
 * on (event: 'group-participants-update', listener: (update: {jid: string, participants: string[], actor?: string, action: WAParticipantAction}) => void): this
 */

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const groupParticipantsUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const tskey = `zap:${seed.shard}:ts:event:group-participants-update`

  return async (user) => {
    console.log('groupParticipantsUpdate')
    const json = JSON.stringify({ event: 'group-participants-update', data: user })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'group-participants-update')
    pipeline.publish(newsKey, json)

    await pipeline.exec()
  }
}
module.exports = groupParticipantsUpdate
