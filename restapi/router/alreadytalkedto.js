const alreadytalkedto = ({ redis }) => (req, res) => {
  const shard = req.shard
  if (req.params.number) {
    const jid = `${req.params.number}@s.whatsapp.net`
    redis.sismember(`zap:${shard}:contacts`, jid)
      .catch(() => {
        res.status(500).end()
      })
      .then(alreadytalkedto => {
        res.status(200).json({
          type: 'alreadytalkedto',
          alreadytalkedto: !!alreadytalkedto
        })
      })
  } else {
    res.status(400).end()
  }
}

module.exports = alreadytalkedto
