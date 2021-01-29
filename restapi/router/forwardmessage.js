const crypto = require('crypto')

const forwardmessage = ({ redis, mkcontactskey, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const source = req.body.source
  const wid = req.body.wid
  const to = req.body.to
  if (
    source &&
      wid &&
      typeof wid === 'string' &&
      Array.isArray(to) &&
      to.length > 0 &&
      to.every(el => typeof el === 'string')
  ) {
    const mark = crypto.randomBytes(8).toString('base64')
    const deduplicated = Array.from(new Set(to))
    const pipeline = redis.pipeline()
    for (const el of deduplicated) {
      pipeline.sismember(mkcontactskey(shard), `${el}@s.whatsapp.net`)
    }
    const alreadytalkedto = await pipeline.exec().catch(() => {
      res.status(500).end()
      return []
    })

    const messages = alreadytalkedto.map((el, idx) => ({
      to: el[1] === 1 ? deduplicated[idx] : false
    }))
      .filter(el => !!el.to)
      .map((el, idx) => ({
        to: el.to,
        mark: `${mark}${idx}`
      }))

    if (messages.length > 0) {
      const type = 'forwardMessage_v001'
      const sourceJid = `${source}@s.whatsapp.net`
      redis.lpush(mkrawbreadkey(shard), messages.map(el => {
        const obj = {
          ...el,
          source: sourceJid,
          type,
          wid,
          to: undefined,
          jid: `${el.to}@s.whatsapp.net`
        }

        return JSON.stringify(obj)
      }))
        .catch(() => {
          res.status(500).end()
        })
        .then(queueSize => {
          res.status(200).json({
            type: 'forwardmessage',
            source,
            wid,
            to: messages,
            from: shard,
            queueSize
          })
        })
    }
  } else {
    res.status(400).end()
  }
}

module.exports = forwardmessage
