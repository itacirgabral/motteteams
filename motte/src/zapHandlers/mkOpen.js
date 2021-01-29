const fetch = require('node-fetch')

/**
 * when the connection has opened successfully
 * on (event: 'open', listener: (result: WAOpenResult) => void): this
 */
const open = (seed) => {
  const logKey = `zap:${seed.shard}:log`
  const newsKey = `zap:${seed.shard}:news`
  const webhookKey = `zap:${seed.shard}:webhook`

  return async (result) => {
    const json = JSON.stringify({ event: 'open', data: result })
    const pipeline = seed.redis.pipeline()
    pipeline.lpush(logKey, json)// 0
    pipeline.ltrim(logKey, 0, 999)// 1
    pipeline.get(webhookKey)// 2
    pipeline.publish(newsKey, json)// 3

    const pipeback = await pipeline.exec()

    if (!pipeback[2][0] && pipeback[2][1]) {
      const webhook = pipeback[2][1]

      await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'opened',
          shard: seed.shard
        })
      }).catch(() => {})
    }
  }
}

module.exports = open
