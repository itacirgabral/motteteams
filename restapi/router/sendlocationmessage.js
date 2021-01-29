const crypto = require('crypto')

const sendlocationmessage = ({ redis, mkcontactskey, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const quote = req.query.quote
  const description = req.body.description
  const latitude = req.body.latitude
  const longitude = req.body.longitude

  if (Number.isInteger(Number(req.body.to)) && description && latitude && longitude) {
    const jid = `${req.body.to}@s.whatsapp.net`
    const alreadyTalkedTo = await redis.sismember(mkcontactskey(shard), jid)

    if (alreadyTalkedTo) {
      const type = 'locationMessage_v001'
      const mark = crypto.randomBytes(8).toString('base64')
      const queueSize = await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
        type,
        mark,
        jid,
        quote,
        description,
        latitude,
        longitude
      }))

      res.status(200).json({
        type: 'sendlocationmessage',
        to: req.body.to,
        mark,
        quote: req.query.quote,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        from: shard,
        queueSize
      })
    } else {
      res.status(404).end()
    }
  } else {
    res.status(400).end()
  }
}

module.exports = sendlocationmessage
