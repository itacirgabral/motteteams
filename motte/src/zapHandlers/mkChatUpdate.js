/**
 *  when a chat is updated (new message, updated message, deleted, pinned, presence updated etc)
 * on (event: 'chat-update', listener: (chat: Partial<WAChat> & { jid: string }) => void): this
 */
const path = require('path')
const chatprocessor = require('./chatprocessor')

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const chatUpdate = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const panoptickey = 'zap:panoptic'
  const tskey = `zap:${seed.shard}:ts:event:chat-update`

  return async (chat) => {
    const json = JSON.stringify({ event: 'chat-update', data: chat })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)
    pipeline.ltrim(logKey, 0, 999)
    pipeline.publish(newsKey, json)
    pipeline.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', seed.shard, 'event', 'chat-update')
    await pipeline.exec()
    //
    const messages = chat?.messages?.all()
    if (Array.isArray(messages) && messages.length > 0) {
      const wbis = messages
        .map(message => message.toJSON())
        .map(wbi => ({
          shard: seed.shard,
          wbi
        }))

      const newones = wbis.map(chatprocessor)
      newones.forEach(async ({ filename, newone }, idx) => {
        if (newone) {
          let json
          const params = newone
          let file
          if (filename) {
            file = await seed.conn.downloadAndSaveMediaMessage(wbis[idx].wbi, path.join(process.cwd(), process.env.UPLOADFOLDER, String(Date.now())))
          } else {
            json = JSON.stringify(newone)
          }
          const hook = {
            type: 'sendhook',
            hardid: seed.hardid,
            shard: seed.shard,
            file, // only media messagens have it
            params,
            json
          }

          await seed.redis.publish(panoptickey, JSON.stringify(hook))

          // TODO couchdb + minio
        } else {
          // console.dir({ chat })
        }
      })
    }

    await pipeline.exec()
  }
}

module.exports = chatUpdate
