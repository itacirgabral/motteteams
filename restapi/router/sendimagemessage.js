const crypto = require('crypto')
const fs = require('fs')

const sendimagemessage = ({ redis, uploader, mkcontactskey, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const upload = uploader().single('image')
  const quote = req.query.quote
  const caption = req.query.caption

  upload(req, res, async (err) => {
    if (!err) {
      const jid = `${req.params.to}@s.whatsapp.net`
      const alreadyTalkedTo = await redis.sismember(mkcontactskey(shard), jid)

      if (alreadyTalkedTo) {
        const mark = crypto.randomBytes(8).toString('base64')
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
