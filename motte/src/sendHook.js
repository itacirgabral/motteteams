const fetch = require('node-fetch')

const sendHook = async ({ redis, json, shard }) => {
  if (typeof json === 'string') {
    const webhookkey = `zap:${shard}:webhook`
    const webhook = await redis.get(webhookkey)
    if (webhook) {
      return fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: json
      }).catch(() => {})
    }
  }
}

module.exports = sendHook
