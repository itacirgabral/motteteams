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
const ports = 4443

const redisConn = process.env.REDIS_CONN
const hardid = process.env.HARDID
const panoptickey = 'zap:panoptic'
const mkcredskey = shard => `zap:${shard}:creds`
const mkwebhookkey = shard => `zap:${shard}:webhook`
const mkwebhookhistorykey = shard => `zap:${shard}:webhook:history`
const mkchatskey = shard => `zap:${shard}:chats`
const mkrawbreadkey = shard => `zap:${shard}:fifo:rawBread`
const mkmarkcountkey = shard => `zap:${shard}:markcount`

const redis = new Redis(redisConn)

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/sendtextmessage', jwt2shard, express.json(), router.sendtextmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendlocationmessage', jwt2shard, express.json(), router.sendlocationmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendcontactmessage', jwt2shard, express.json(), router.sendcontactmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }))

app.post('/forwardmessage', jwt2shard, express.json(), router.forwardmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/erasemessage', jwt2shard, express.json(), router.erasemessage({ redis, mkchatskey, mkrawbreadkey }))

app.post('/senddocumentmessage/:to', jwt2shard, router.senddocumentmessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendaudiomessage/:to', jwt2shard, router.sendaudiomessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendimagemessage/:to', jwt2shard, router.sendimagemessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendvideomessage/:to', jwt2shard, router.sendvideomessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.post('/sendmediamessage', jwt2shard, express.json(), router.sendmediamessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }))

app.post('/webhook', jwt2shard, express.json(), router.webhookpost({ redis, mkwebhookkey }))
app.get('/webhook', jwt2shard, router.webhookget({ redis, mkwebhookkey }))
app.put('/webhook', jwt2shard, express.json(), router.webhookput({ redis, mkwebhookkey }))
app.delete('/webhook', jwt2shard, router.webhookdelete({ redis, mkwebhookkey }))
app.get('/webhook/history', jwt2shard, router.webhookhistory({ redis, mkwebhookhistorykey }))

app.get('/alreadytalkedto/:number', jwt2shard, router.alreadytalkedto({ redis }))
app.post('/startnewchat', jwt2shard, express.json(), router.startnewchat({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey }))
app.get('/allchats', jwt2shard, router.allchats({ redis, mkchatskey }))
app.post('/chatinfo', jwt2shard, express.json(), router.chatinfo({ redis, mkchatskey, mkrawbreadkey }))

app.post('/signupconnection', jwt2shard, express.json(), router.signupconnection({ redis, hardid, panoptickey }))
app.get('/connect', jwt2shard, router.connect({ redis, mkcredskey, hardid, panoptickey }))
app.get('/stats', jwt2shard, router.stats({ redis }))
app.get('/connectionstate', jwt2shard, router.connectionstate({ redis, hardid, panoptickey }))
app.get('/spreadrestart', jwt2shard, router.spreadrestart({ redis, hardid, panoptickey }))
app.get('/disconnect', jwt2shard, router.disconnect({ redis, hardid, panoptickey }))
app.get('/queuerestart', jwt2shard, router.queuerestart({ redis, hardid, panoptickey }))
app.get('/queuesize', jwt2shard, router.queuesize({ redis, mkrawbreadkey }))
app.get('/cleanqueue', jwt2shard, router.cleanqueue({ redis, mkrawbreadkey }))

app.post('/loadmessages', jwt2shard, express.json(), router.loadmessages({ redis, hardid, panoptickey }))

https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'sslcert', 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'sslcert', 'cert.pem')),
  ca: fs.readFileSync(path.join(__dirname, 'sslcert', 'chain.pem'))
}, app).listen(ports, () => {
  console.log(`Example app listening at https://localhost:${ports}`)
})

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${3000}`)
})