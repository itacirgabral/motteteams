const fetch = require('node-fetch')
const FormData = require('form-data')
const fs = require('fs')

const method = 'POST'
const headers = {
  'Content-Type': 'application/json'
}

const sendHook = async ({ redis, json, shard, params, file }) => {
  const webhookkey = `zap:${shard}:webhook`
  const webhookkey2 = `zap:${shard}:webhook2`
  const webhookhistory = `zap:${shard}:webhook:history`
  const radiohookkey = `zap:${shard}:radiohook`

  let tohookhistory
  const pipeline = redis.pipeline()
  pipeline.get(webhookkey)
  pipeline.get(webhookkey2)
  const [
    [, webhook],
    [, webhook2]
  ] = await pipeline.exec()

  if (typeof json === 'string') {
    await Promise.all([
      webhook
        ? fetch(webhook, {
            method,
            headers,
            body: json
          }).catch(() => {})
        : Promise.resolve(),
      webhook2
        ? fetch(webhook2, {
            method,
            headers,
            body: json
          }).catch(() => {})
        : Promise.resolve()
    ])
    tohookhistory = json
  } else if (typeof file === 'string') {
    if (webhook) {
      const url = new URL(webhook)
      Object.entries(params).forEach(el => {
        url.searchParams.append(el[0], el[1])
      })
      const form = new FormData()
      form.append('file', fs.createReadStream(file))

      await fetch(url.href, {
        method, body: form
      }).catch(() => {})
    }

    if (webhook2) {
      const url = new URL(webhook2)
      Object.entries(params).forEach(el => {
        url.searchParams.append(el[0], el[1])
      })
      const form = new FormData()
      form.append('file', fs.createReadStream(file))

      await fetch(url.href, {
        method, body: form
      }).catch(() => {})
    }

    fs.unlinkSync(file)
    tohookhistory = JSON.stringify(params)
  }

  if (tohookhistory) {
    const pipeline = redis.pipeline()
    pipeline.lpush(webhookhistory, tohookhistory)
    pipeline.ltrim(webhookhistory, 0, 99)
    pipeline.publish(radiohookkey, tohookhistory)
    await pipeline.exec()
  }
}

module.exports = sendHook
