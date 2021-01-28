const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const https = require('https')
const express = require('express')
const cors = require('cors')
const Redis = require('ioredis')

const uploader = require('./uploader')
const jwt2shard = require('./jwt2shard')

const app = express()
const port = 3000
const ports = 3001

const redisConn = process.env.REDIS_CONN
const hardid = process.env.HARDID
const panoptickey = 'zap:panoptic'
const mkwebhookkey = shard => `zap:${shard}:webhook`
const mkcontactskey = shard => `zap:${shard}:contacts`

const redis = new Redis(redisConn)

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/sendtextmessage', jwt2shard, express.json(), async (req, res) => {
  const shard = req.shard
  if (Number.isInteger(Number(req.body.to)) && req.body.msg) {
    const jid = `${req.body.to}@s.whatsapp.net`
    const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

    if (alreadyTalkedTo) {
      const type = 'textMessage_v001'
      const mark = crypto.randomBytes(8).toString('base64')
      const rawBreadKey = `zap:${shard}:fifo:rawBread`
      const queueSize = await redis.lpush(rawBreadKey, JSON.stringify({
        type,
        mark,
        jid,
        quote: req.query.quote,
        msg: req.body.msg
      }))

      res.status(200).json({
        type: 'sendtextmessage',
        to: req.body.to,
        mark,
        quote: req.query.quote,
        msg: req.body.msg,
        from: shard,
        queueSize
      })
    } else {
      res.status(404).end()
    }
  } else {
    res.status(400).end()
  }
})

app.post('/sendlocationmessage', jwt2shard, express.json(), async (req, res) => {
  const shard = req.shard
  if (Number.isInteger(Number(req.body.to))) {
    const jid = `${req.body.to}@s.whatsapp.net`
    const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

    if (alreadyTalkedTo) {
      const type = 'locationMessage_v001'
      const mark = crypto.randomBytes(8).toString('base64')
      const rawBreadKey = `zap:${shard}:fifo:rawBread`
      const queueSize = await redis.lpush(rawBreadKey, JSON.stringify({
        type,
        mark,
        jid,
        quote: req.query.quote,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude
      }))

      res.status(200).json({
        type: 'sendlocationmessage',
        to: req.body.to,
        mark,
        quote: req.query.quote,
        description: req.body.description,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        from: shard,
        queueSize
      })
    } else {
      res.status(404).end()
    }
  } else {
    res.status(400).end()
  }
})

app.post('/sendcontactmessage', jwt2shard, express.json(), async (req, res) => {
  const shard = req.shard
  if (Number.isInteger(Number(req.body.to))) {
    const jid = `${req.body.to}@s.whatsapp.net`
    const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

    if (alreadyTalkedTo) {
      const type = 'contactMessage_v001'
      const mark = crypto.randomBytes(8).toString('base64')
      const rawBreadKey = `zap:${shard}:fifo:rawBread`
      const queueSize = await redis.lpush(rawBreadKey, JSON.stringify({
        type,
        mark,
        jid,
        quote: req.query.quote,
        vcard: req.body.vcard
      }))

      res.status(200).json({
        send: 'sendcontactmessage',
        to: req.body.to,
        mark,
        quote: req.query.quote,
        name: req.body.name,
        whatsapp: req.body.whatsapp,
        organization: req.body.organization,
        from: shard,
        queueSize
      })
    } else {
      res.status(404).end()
    }
  } else {
    res.status(400).end()
  }
})

app.post('/forwardmessage', jwt2shard, express.json(), async (req, res) => {
  const shard = req.shard
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
    const rawBreadKey = `zap:${shard}:fifo:rawBread`
    const deduplicated = Array.from(new Set(to))
    const pipeline = redis.pipeline()
    for (const el of deduplicated) {
      pipeline.sismember(`zap:${shard}:contacts`, `${el}@s.whatsapp.net`)
    }
    const alreadytalkedto = await pipeline.exec()
    const mark = crypto.randomBytes(8).toString('base64')
    const messages = alreadytalkedto.map((el, idx) => ({
      to: el[1] === 1 ? deduplicated[idx] : false
    }))
      .filter(el => !!el.to)
      .map((el, idx) => ({
        to: el.to,
        mark: `${mark}${idx}`
      }))
    const type = 'forwardMessage_v001'
    const sourceJid = `${source}@s.whatsapp.net`
    const queueSize = await redis.lpush(rawBreadKey, messages.map(el => ({
      ...el,
      source: sourceJid,
      type,
      wid,
      to: undefined,
      jid: `${el.to}@s.whatsapp.net`
    })).map(JSON.stringify))

    res.status(200).json({
      type: 'forwardmessage',
      source,
      wid,
      to: messages,
      from: shard,
      queueSize
    })
  } else {
    res.status(400).end()
  }
})

app.post('/senddocumentmessage/:to', jwt2shard, async (req, res) => {
  const shard = req.shard
  const upload = uploader().single('document')
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
          quote: req.query.quote,
          path: req.file.path,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
        const rawBreadKey = `zap:${shard}:fifo:rawBread`
        const queueSize = await redis.lpush(rawBreadKey, JSON.stringify(rawBread))

        res.status(200).json({
          type: 'senddocumentmessage',
          from: shard,
          mark,
          to: req.params.to,
          quote: req.query.quote,
          filename: rawBread.filename,
          mimetype: rawBread.mimetype,
          size: rawBread.size,
          queueSize
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
})

app.post('/sendaudiomessage/:to', jwt2shard, async (req, res) => {
  const shard = req.shard
  const upload = uploader().single('audio')
  upload(req, res, async (err) => {
    if (!err) {
      const jid = `${req.params.to}@s.whatsapp.net`
      const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

      if (alreadyTalkedTo) {
        const mark = crypto.randomBytes(8).toString('base64')
        const rawBread = {
          type: 'audioMessage_v001',
          mark,
          jid,
          quote: req.query.quote,
          path: req.file.path,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
        const rawBreadKey = `zap:${shard}:fifo:rawBread`
        const queueSize = await redis.lpush(rawBreadKey, JSON.stringify(rawBread))

        res.status(200).json({
          type: 'sendaudiomessage',
          from: shard,
          mark,
          quote: req.query.quote,
          to: req.params.to,
          filename: rawBread.filename,
          mimetype: rawBread.mimetype,
          size: rawBread.size,
          queueSize
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
})

app.post('/sendimagemessage/:to', jwt2shard, async (req, res) => {
  const shard = req.shard
  const upload = uploader().single('image')
  upload(req, res, async (err) => {
    if (!err) {
      const jid = `${req.params.to}@s.whatsapp.net`
      const alreadyTalkedTo = await redis.sismember(`zap:${shard}:contacts`, jid)

      if (alreadyTalkedTo) {
        const mark = crypto.randomBytes(8).toString('base64')
        const rawBread = {
          type: 'imageMessage_v001',
          mark,
          jid,
          quote: req.query.quote,
          path: req.file.path,
          filename: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
        const rawBreadKey = `zap:${shard}:fifo:rawBread`
        const queueSize = await redis.lpush(rawBreadKey, JSON.stringify(rawBread))

        res.status(200).json({
          type: 'sendimagemessage',
          from: shard,
          mark,
          quote: req.query.quote,
          to: req.params.to,
          filename: rawBread.filename,
          mimetype: rawBread.mimetype,
          size: rawBread.size,
          queueSize
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
})

app.get('/stats', jwt2shard, async (req, res) => {
  const shard = req.shard
  const pipeline = redis.pipeline()
  pipeline.get(`zap:${shard}:pong`) // 0
  pipeline.hget(`zap:${shard}:stats`, 'lastsentmessagetimestamp') // 1
  pipeline.hget(`zap:${shard}:stats`, 'sortmeandelta') // 2
  pipeline.hget(`zap:${shard}:stats`, 'longmeandelta') // 3
  pipeline.hget(`zap:${shard}:stats`, 'totalsentmessage') // 4

  const [
    [, pong],
    [, lastsentmessagetimestamp],
    [, sortmeandelta],
    [, longmeandelta],
    [, totalsentmessage]
  ] = await pipeline.exec()

  res.status(200).json({
    type: 'stats',
    pong,
    lastsentmessagetimestamp,
    sortmeandelta,
    longmeandelta,
    totalsentmessage
  })
})

app.post('/signupconnection', jwt2shard, express.json(), async (req, res) => {
  if (req.body.url && req.body.shard) {
    const type = 'signupconnection'
    const bread = JSON.stringify({ hardid, type, url: req.body.url, shard: req.body.shard })

    await redis.publish(panoptickey, bread)
    res.status(200).json({ type, url: req.body.url, shard: req.body.shard })
  } else {
    res.status(400).end()
  }
})

app.get('/connect', jwt2shard, async (req, res) => {
  const shard = req.shard
  const typeDisconnect = 'disconnect'
  const bread = JSON.stringify({ hardid, type: typeDisconnect, shard })
  await redis.publish(panoptickey, bread)

  setTimeout(async () => {
    const typeConnect = 'connect'
    const bread = JSON.stringify({ hardid, type: typeConnect, shard })
    await redis.publish(panoptickey, bread)

    res.status(200).json({ type: typeConnect, shard })
  }, 500)
})

app.get('/disconnect', jwt2shard, async (req, res) => {
  const shard = req.shard
  const type = 'disconnect'
  const bread = JSON.stringify({ hardid, type, shard })

  await redis.publish(panoptickey, bread)
  res.status(200).json({ type, shard })
})

app.post('/webhook', jwt2shard, express.json(), async (req, res) => {
  const shard = req.shard
  const webhook = req.webhook
  await redis.set(mkwebhookkey(shard), webhook)
  res.status(200).json({
    type: 'createwebhook',
    shard,
    webhook
  })
})
app.get('/webhook', jwt2shard, async (req, res) => {
  const shard = req.shard
  const webhook = await redis.get(mkwebhookkey(shard))
  res.status(200).json({
    type: 'readwebhook',
    shard,
    webhook
  })
})
app.put('/webhook', jwt2shard, express.json(), async (req, res) => {
  const shard = req.shard
  const { webhook } = req.body
  const webhookold = await redis.getset(mkwebhookkey(shard), webhook)
  res.status(200).json({
    type: 'updatewebhook',
    shard,
    webhooknew: webhook,
    webhookold
  })
})
app.delete('/webhook', jwt2shard, async (req, res) => {
  const shard = req.shard
  const key = mkwebhookkey(shard)
  const pipeline = redis.pipeline()
  pipeline.get(key)// 0
  pipeline.del(key)// 1
  const result = await pipeline.exec()

  res.status(200).json({
    type: 'removewebhook',
    shard,
    webhook: result[0][1]
  })
})

app.get('/allcontacts', jwt2shard, async (req, res) => {
  const shard = req.shard
  const contacts = await redis.smembers(mkcontactskey(shard))
  res.status(200).json({
    type: 'allcontacts',
    contacts: contacts.map(el => el.split('@s.whatsapp.net')[0])
  })
})
app.get('/alreadytalkedto/:number', jwt2shard, async (req, res) => {
  const shard = req.shard
  const jid = `${req.params.number}@s.whatsapp.net`
  const alreadytalkedto = await redis.sismember(`zap:${shard}:contacts`, jid)
  res.status(200).json({
    type: 'alreadytalkedto',
    alreadytalkedto: !!alreadytalkedto
  })
})

https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'sslcert', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'sslcert', 'server.cert'))
}, app).listen(ports, () => {
  console.log(`Example app listening at https://localhost:${ports}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
