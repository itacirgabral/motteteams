const fs = require('fs')
const path = require('path')
const stream = require('stream')
const fetch = require('node-fetch')
const FileType = require('file-type')

const sendmediamessage = ({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }) => async (req, res) => {
  const shard = req.shard
  const to = req.body.to
  const link = req.body.link
  const quote = req.query.quote
  const caption = req.query.caption

  if (to && link) {
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
      const response = await fetch(link)
      if (response.status === 200) {
        const filename = `${shard}-${Date.now()}.file`
        const pathname = path.join(process.cwd(), process.env.UPLOADFOLDER, filename)

        stream.pipeline(response.body, fs.createWriteStream(pathname), async (err, data) => {
          if (err) {
            res.status(500).end()
            fs.unlinkSync(pathname)
          } else {
            const extmime = await FileType.fromFile(pathname)
            const size = fs.statSync(pathname).size

            switch (extmime ? extmime.mime : null) {
              case 'image/jpeg':
              case 'image/png':
              case 'image/webp':
                await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
                  type: 'imageMessage_v001',
                  mark,
                  jid,
                  quote,
                  caption,
                  path: pathname,
                  ondiskname: filename,
                  filename,
                  mimetype: extmime.mime,
                  size
                }))
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
                      to,
                      filename,
                      mimetype: extmime.mime,
                      size,
                      queueSize
                    })
                  })
                break
              case 'audio/opus':
                await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
                  type: 'audioMessage_v001',
                  mark,
                  jid,
                  quote,
                  path: pathname,
                  ondiskname: filename,
                  filename,
                  mimetype: 'audio/ogg; codecs=opus',
                  size
                }))
                  .catch(() => {
                    res.status(500).end()
                  })
                  .then(queueSize => {
                    res.status(200).json({
                      type: 'sendaudiomessage',
                      from: shard,
                      mark,
                      quote,
                      to,
                      filename,
                      mimetype: 'audio/ogg; codecs=opus',
                      size,
                      queueSize
                    })
                  })
                break
              default:
                await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
                  type: 'documentMessage_v001',
                  mark,
                  jid,
                  quote,
                  path: pathname,
                  ondiskname: filename,
                  filename,
                  mimetype: extmime ? extmime.mime : 'text/plain',
                  size
                }))
                  .catch(() => {
                    res.status(500).end()
                  })
                  .then(queueSize => {
                    res.status(200).json({
                      type: 'senddocumentmessage',
                      from: shard,
                      mark,
                      to,
                      quote,
                      filename,
                      mimetype: extmime ? extmime.mime : 'text/plain',
                      size,
                      queueSize
                    })
                  })
                break
            }
          }
        })
      } else {
        res.status(400).end()
      }
    } else {
      res.status(404).end()
    }
  } else {
    res.status(400).end()
  }
}

module.exports = sendmediamessage
