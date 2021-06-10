const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const forwardmessage = ({ redis, mkcontactskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const tskey = mktsroutekey({ shard, route: 'forwardmessage'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'forwardmessage')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},forwardmessage,to`)

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
    const markcountkey = mkmarkcountkey(shard)
    const deduplicated = Array.from(new Set(to))
    const pipeline = redis.pipeline()

    pipeline.incrby(markcountkey, deduplicated.length)// 0
    for (const el of deduplicated) {
      pipeline.sismember(mkcontactskey(shard), `${el}@s.whatsapp.net`)
    }
    const pipeback = await pipeline.exec().catch(() => {
      res.status(500).end()
      return []
    })

    const markend = pipeback[0][1]// 0
    const alreadytalkedto = pipeback.slice(1)

    const messages = alreadytalkedto.map((el, idx) => ({
      to: el[1] === 1 ? deduplicated[idx] : false
    }))
      .filter(el => !!el.to)
      .map((el, idx) => ({
        to: el.to,
        mark: `${markend - deduplicated.length + idx}`
      }))

    if (messages.length > 0) {
      const type = 'forwardMessage_v001'
      const sourceJid = `${source}@s.whatsapp.net`

      const pipeline = redis.pipeline()
      pipeline.incrby(markcountkey, messages.length - deduplicated.length)
      pipeline.lpush(mkrawbreadkey(shard), messages.map(el => {
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

      const pipeback = await pipeline.exec().catch(() => {
        res.status(500).end()
      })
        .then(([, [, queueSize]]) => {
          res.status(200).json({
            type: 'forwardmessage',
            source,
            wid,
            to: messages,
            from: shard,
            queueSize
          })
        })

      return pipeback
    }
  } else {
    res.status(400).end()
  }
}

module.exports = forwardmessage
