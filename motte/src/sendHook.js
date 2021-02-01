const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')

const sendHook = async ({ redis, json, shard, params, file }) => {
  const webhookkey = `zap:${shard}:webhook`
  const webhookhistory = `zap:${shard}:webhook:history`

  if (typeof json === 'string') {
    const webhook = await redis.get(webhookkey)

    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: json
      }).catch(() => {})
    }

    const pipeline = redis.pipeline()
    pipeline.lpush(webhookhistory, json)
    pipeline.ltrim(webhookhistory, 0, 99)
    await pipeline.exec()
  } else if (typeof file === 'string') {
    const webhook = await redis.get(webhookkey)

    if (webhook) {
      const url = new URL(webhook)
      Object.entries(params).forEach(el => {
        url.searchParams.append(el[0], el[1])
      })
      const form = new FormData()
      form.append('file', fs.createReadStream(file))

      await fetch(url.href, {
        method: 'POST', body: form
      }).catch(() => {})
    }

    fs.unlinkSync(file)

    const pipeline = redis.pipeline()
    pipeline.lpush(webhookhistory, JSON.stringify(params))
    pipeline.ltrim(webhookhistory, 0, 99)
    await pipeline.exec()
  }
}

module.exports = sendHook
