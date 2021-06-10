const fs = require('fs')
const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const sendvideomessage = ({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const to = req.params.to
  const loop = req.query.loop === 'true'
  const upload = uploader().single('file')
  const quote = req.query.quote
  const caption = req.query.caption
  const tskey = mktsroutekey({ shard, route: 'sendvideomessage'})

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'sendvideomessage')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},sendvideomessage,${to}`)

  upload(req, res, async (err) => {
    if (!err) {
      const jid = to.indexOf('-') === -1
        ? `${to}@s.whatsapp.net` // se for pessoa
        : `${to}@g.us` // se for grupo

      const chatsKeys = mkchatskey(shard)
      const markcountkey = mkmarkcountkey(shard)

      const pipeline = redis.pipeline()
      pipeline.sismember(chatsKeys, to)
      pipeline.incr(markcountkey)
      const pipeback = await pipeline.exec()

      const alreadyTalkedTo = pipeback[0][1]
      const mark = String(pipeback[1][1])

      if (alreadyTalkedTo) {
        const rawBread = {
          type: 'videoMessage_v001',
          mark,
          jid,
          quote,
          caption,
          loop,
          path: req.file.path,
          ondiskname: req.file.filename,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }

        redis.lpush(mkrawbreadkey(shard), JSON.stringify(rawBread))
          .catch(() => {
            res.status(500).end()
          })
          .then(queueSize => {
            res.status(200).json({
              type: 'sendvideomessage',
              from: shard,
              mark,
              quote,
              caption,
              loop,
              to: req.params.to,
              filename: rawBread.filename,
              mimetype: rawBread.mimetype,
              size: rawBread.size,
              queueSize
            })
          })
      } else {
        res.status(404).end()
        fs.unlink(req.file.path, () => {})
      }
    } else {
      console.error(err)
      res.status(500)
    }
  })
}

module.exports = sendvideomessage
