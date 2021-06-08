const loadmessages = ({ redis, mkchatskey, mkrawbreadkey, mktskey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktskey({ shard, route: 'loadmessages'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', 86400000, 'LABELS', 'shard', shard, 'route', 'loadmessages')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},loadmessages,to`)

  const number = req.body.number
  const count = req.body.count
  const wid = req.body.wid

  if (number) {
    const chatsKeys = mkchatskey(shard)
    const alreadyTalkedTo = await redis.sismember(chatsKeys, number)

    if (alreadyTalkedTo) {
      const jid = number.indexOf('-') === -1
        ? `${number}@s.whatsapp.net` // se for pessoa
        : `${number}@g.us` // se for grupo

      const type = 'loadMessages_v001'
      const queueSize = await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
        type,
        jid,
        count,
        wid
      }))

      res.status(200).json({
        type: 'loadmessages',
        count,
        wid,
        queueSize
      })
    } else {
      res.status(404).end()
    }
  } else {
    res.status(400).end()
  }
}

module.exports = loadmessages
