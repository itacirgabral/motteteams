const fs = require('fs')

const sendimagemessage = ({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey }) => async (req, res) => {
  const to = req.params.to
  const shard = req.shard
  const upload = uploader().single('file')
  const quote = req.query.quote
  const caption = req.query.caption

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
          type: 'imageMessage_v001',
          mark,
          jid,
          quote,
          caption,
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
              type: 'sendimagemessage',
              from: shard,
              mark,
              quote,
              caption,
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

module.exports = sendimagemessage
