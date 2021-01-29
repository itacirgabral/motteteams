const crypto = require('crypto')
const fs = require('fs')

const senddocumentmessage = ({ redis, uploader, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const upload = uploader().single('document')
  const quote = req.query.quote

  upload(req, res, async (err) => {
    if (!err) {
      const jid = `${req.params.to}@s.whatsapp.net`
      const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

      if (alreadyTalkedTo) {
        const mark = crypto.randomBytes(8).toString('base64')
        const rawBread = {
          type: 'documentMessage_v001',
          mark,
          jid,
          quote,
          path: req.file.path,
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
              type: 'senddocumentmessage',
              from: shard,
              mark,
              to: req.params.to,
              quote,
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

module.exports = senddocumentmessage
