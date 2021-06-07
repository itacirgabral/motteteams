const erasemessage = ({ redis, mkchatskey, mkrawbreadkey, mktskey }) => async (req, res) => {
  const shard = req.shard

  console.log(`${(new Date()).toLocaleTimeString()},${shard},erasemessage,to`)

  const to = String(req.body.to)
  const wid = req.body.wid

  if (to && wid) {
    const chatsKeys = mkchatskey(shard)
    const alreadyTalkedTo = await redis.sismember(chatsKeys, to)

    if (alreadyTalkedTo) {
      const jid = to.indexOf('-') === -1
        ? `${to}@s.whatsapp.net` // se for pessoa
        : `${to}@g.us` // se for grupo
      const type = 'eraseMessage_v001'

      const queueSize = await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
        type,
        jid,
        wid
      }))

      res.status(200).json({
        type: 'erasemessage',
        to: req.body.to,
        wid,
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

module.exports = erasemessage
