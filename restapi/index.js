const fs = require('fs')
const path = require('path')
const https = require('https')
const express = require('express')
const cors = require('cors')
const Redis = require('ioredis')

const uploader = require('./uploader')
const jwt2shard = require('./jwt2shard')
const router = require('./router')

const app = express()
const port = 3000
const ports = 3001

const redisConn = process.env.REDIS_CONN
const hardid = process.env.HARDID
const panoptickey = 'zap:panoptic'
const mkwebhookkey = shard => `zap:${shard}:webhook`
const mkwebhookhistorykey = shard => `zap:${shard}:webhook:history`
const mkcontactskey = shard => `zap:${shard}:contacts`
const mkrawbreadkey = shard => `zap:${shard}:fifo:rawBread`
const mkmarkcountkey = shard => `zap:${shard}:markcount`

const redis = new Redis(redisConn)

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/sendtextmessage', jwt2shard, express.json(), router.sendtextmessage({ redis, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendlocationmessage', jwt2shard, express.json(), router.sendlocationmessage({ redis, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendcontactmessage', jwt2shard, express.json(), router.sendcontactmessage({ redis, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))

app.post('/forwardmessage', jwt2shard, express.json(), router.forwardmessage({ redis, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))

app.post('/senddocumentmessage/:to', jwt2shard, router.senddocumentmessage({ redis, uploader, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendaudiomessage/:to', jwt2shard, router.sendaudiomessage({ redis, uploader, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendimagemessage/:to', jwt2shard, router.sendimagemessage({ redis, uploader, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendmediamessage', jwt2shard, express.json(), router.sendmediamessage({ redis, mkcontactskey, mkmarkcountkey, mkrawbreadkey }))

app.post('/webhook', jwt2shard, express.json(), router.webhookpost({ redis, mkwebhookkey }))
app.get('/webhook', jwt2shard, router.webhookget({ redis, mkwebhookkey }))
app.put('/webhook', jwt2shard, express.json(), router.webhookput({ redis, mkwebhookkey }))
app.delete('/webhook', jwt2shard, router.webhookdelete({ redis, mkwebhookkey }))
app.get('/webhook/history', jwt2shard, router.webhookhistory({ redis, mkwebhookhistorykey }))

app.get('/alreadytalkedto/:number', jwt2shard, router.alreadytalkedto({ redis }))
app.get('/allcontacts', jwt2shard, router.allcontacts({ redis, mkcontactskey }))
app.post('/contactinfo', jwt2shard, express.json(), router.contactinfo({ redis, mkcontactskey, mkrawbreadkey }))

app.post('/signupconnection', jwt2shard, express.json(), router.signupconnection({ redis, hardid, panoptickey }))
app.get('/connect', jwt2shard, router.connect({ redis, hardid, panoptickey }))
app.get('/stats', jwt2shard, router.stats({ redis }))
app.get('/connectionstate', jwt2shard, router.connectionstate({ redis, hardid, panoptickey }))
app.get('/spreadrestart', jwt2shard, router.spreadrestart({ redis, hardid, panoptickey }))
app.get('/disconnect', jwt2shard, router.disconnect({ redis, hardid, panoptickey }))
app.get('/queuerestart', jwt2shard, router.queuerestart({ redis, hardid, panoptickey }))

app.post('/loadmessages', jwt2shard, express.json(), router.loadmessages({ redis, hardid, panoptickey }))

https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'sslcert', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'sslcert', 'server.cert'))
}, app).listen(ports, () => {
  console.log(`Example app listening at https://localhost:${ports}`)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
