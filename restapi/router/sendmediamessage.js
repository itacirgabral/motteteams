const fs = require('fs')
const path = require('path')
const stream = require('stream')
const fetch = require('node-fetch')
const FileType = require('file-type')

const retention = Number(process.env.REDIS_RETENTION_TIMESERIES_MS || '86400000')

const sendmediamessage = ({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }) => async (req, res) => {
  const shard = req.shard
  const to = req.body.to
  const link = req.body.link
  const quote = req.query.quote
  const caption = req.query.caption
  const tskey = mktsroutekey({ shard, route: 'sendmediamessage' })

  redis.call('TS.ADD', tskey, '*', 1, 'RETENTION', retention, 'LABELS', 'shard', shard, 'route', 'sendmediamessage')
  console.log(`${(new Date()).toLocaleTimeString()},${shard},sendmediamessage,${to}`)

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
        const ondiskname = `${shard}-${Date.now()}.file`
        const url = new URL(link)
        const filename = decodeURIComponent(url.pathname).split('/').pop()
        const pathname = path.join(process.cwd(), process.env.UPLOADFOLDER, ondiskname)

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
                  ondiskname,
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
                  ondiskname,
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
              case 'video/mp4':
                await redis.lpush(mkrawbreadkey(shard), JSON.stringify({
                  type: 'videoMessage_v001',
                  mark,
                  jid,
                  quote,
                  caption,
                  path: pathname,
                  ondiskname,
                  filename,
                  mimetype: extmime.mime,
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
                      caption,
                      to,
                      filename,
                      mimetype: extmime.mime,
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
                  ondiskname,
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
