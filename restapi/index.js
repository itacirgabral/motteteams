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

const redisConn = process.env.REDIS_CONN
const hardid = process.env.HARDID
const panoptickey = 'zap:panoptic'
const mkcredskey = shard => `zap:${shard}:creds`
const mkconnstunkey = shard => `zap:${shard}:connstun`
const mkwebhookkey = shard => `zap:${shard}:webhook`
const mkwebhook2key = shard => `zap:${shard}:webhook2`
const mkwebhookhistorykey = shard => `zap:${shard}:webhook:history`
const mkchatskey = shard => `zap:${shard}:chats`
const mkrawbreadkey = shard => `zap:${shard}:fifo:rawBread`
const mkmarkcountkey = shard => `zap:${shard}:markcount`
const mkmaxtkey = shard => `zap:${shard}:maxt`
const mktsroutekey = ({ shard, route }) => `zap:${shard}:ts:route:${route}`

const redis = new Redis(redisConn)

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/sendtextmessage', jwt2shard, express.json(), router.sendtextmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.post('/sendlocationmessage', jwt2shard, express.json(), router.sendlocationmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.post('/sendcontactmessage', jwt2shard, express.json(), router.sendcontactmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))

app.post('/forwardmessage', jwt2shard, express.json(), router.forwardmessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.post('/erasemessage', jwt2shard, express.json(), router.erasemessage({ redis, mkchatskey, mkrawbreadkey, mktsroutekey }))

app.post('/senddocumentmessage/:to', jwt2shard, router.senddocumentmessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.post('/sendaudiomessage/:to', jwt2shard, router.sendaudiomessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.post('/sendimagemessage/:to', jwt2shard, router.sendimagemessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.post('/sendvideomessage/:to', jwt2shard, router.sendvideomessage({ redis, uploader, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.post('/sendmediamessage', jwt2shard, express.json(), router.sendmediamessage({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))

app.post('/webhook', jwt2shard, express.json(), router.webhookpost({ redis, mkwebhookkey, mktsroutekey }))
app.get('/webhook', jwt2shard, router.webhookget({ redis, mkwebhookkey, mktsroutekey }))
app.put('/webhook', jwt2shard, express.json(), router.webhookput({ redis, mkwebhookkey, mktsroutekey }))
app.delete('/webhook', jwt2shard, router.webhookdelete({ redis, mkwebhookkey, mktsroutekey }))
app.get('/webhook/history', jwt2shard, router.webhookhistory({ redis, mkwebhookhistorykey, mktsroutekey }))
app.post('/webhook2', jwt2shard, express.json(), router.webhook2post({ redis, mkwebhook2key, mktsroutekey }))
app.get('/webhook2', jwt2shard, router.webhook2get({ redis, mkwebhook2key, mktsroutekey }))
app.put('/webhook2', jwt2shard, express.json(), router.webhook2put({ redis, mkwebhook2key, mktsroutekey }))
app.delete('/webhook2', jwt2shard, router.webhook2delete({ redis, mkwebhook2key, mktsroutekey }))
app.get('/webhook2/history', jwt2shard, router.webhookhistory({ redis, mkwebhookhistorykey, mktsroutekey }))

// mkwebhook2key

app.post('/maxt', jwt2shard, express.json(), router.maxtpost({ redis, mkmaxtkey, mktsroutekey }))
app.delete('/maxt', jwt2shard, router.maxtdelete({ redis, mkmaxtkey, mktsroutekey }))

app.get('/alreadytalkedto/:number', jwt2shard, router.alreadytalkedto({ redis, mktsroutekey }))
app.post('/startnewchat', jwt2shard, express.json(), router.startnewchat({ redis, mkchatskey, mkmarkcountkey, mkrawbreadkey, mktsroutekey }))
app.get('/allchats', jwt2shard, router.allchats({ redis, mkchatskey, mktsroutekey }))
app.post('/chatinfo', jwt2shard, express.json(), router.chatinfo({ redis, mkchatskey, mkrawbreadkey, mktsroutekey }))

app.post('/signupconnection', jwt2shard, express.json(), router.signupconnection({ redis, hardid, panoptickey, mktsroutekey }))
app.get('/connect', jwt2shard, router.connect({ redis, mkcredskey, mkconnstunkey, hardid, panoptickey, mktsroutekey }))
app.get('/stats', jwt2shard, router.stats({ redis, mktsroutekey }))
app.get('/connectionstate', jwt2shard, router.connectionstate({ redis, hardid, panoptickey, mktsroutekey }))
app.get('/spreadrestart', jwt2shard, router.spreadrestart({ redis, hardid, mkconnstunkey, panoptickey, mktsroutekey }))
app.get('/disconnect', jwt2shard, router.disconnect({ redis, hardid, panoptickey, mktsroutekey }))
app.get('/queuerestart', jwt2shard, router.queuerestart({ redis, hardid, mkconnstunkey, panoptickey, mktsroutekey }))
app.get('/queuesize', jwt2shard, router.queuesize({ redis, mkrawbreadkey, mktsroutekey }))
app.get('/cleanqueue', jwt2shard, router.cleanqueue({ redis, mkrawbreadkey, mktsroutekey }))
app.post('/loadmessages', jwt2shard, express.json(), router.loadmessages({ redis, mkchatskey, mkrawbreadkey, mktsroutekey }))

try {
  https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'sslcert', 'privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'sslcert', 'cert.pem')),
    ca: fs.readFileSync(path.join(__dirname, 'sslcert', 'chain.pem'))
  }, app).listen(4443, () => {
    console.log(`Example app listening at https://localhost:${4443}`)
  })
} catch (error) {
  console.error(error)
}

app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:${3000}`)
})
