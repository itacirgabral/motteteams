const contactinfo = ({ redis, mkcontactskey, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const id = req.body.id
  if ((Array.isArray(id) && id.length > 0)) {
    const deduplicated = Array.from(new Set(id))
    const pipeline = redis.pipeline()
    for (const el of deduplicated) {
      pipeline.sismember(mkcontactskey(shard), `${el}@s.whatsapp.net`)
    }

    const pipeback = await pipeline.exec().catch(() => {
      res.status(500).end()
      return []
    })
    const prebreads = pipeback.map(([err, value], idx) => !err && value === 1 ? deduplicated[idx] : false).filter(el => !!el)

    res.status(200).json({
      type: 'contactinfo',
      id: prebreads
    })

    await redis.lpush(mkrawbreadkey(shard), prebreads.map(id => ({
      type: 'contactInfo_v001',
      jid: `${id}@s.whatsapp.net`
    })).map(el => JSON.stringify(el)))
  } else {
    res.status(400).end()
  }
}

module.exports = contactinfo
