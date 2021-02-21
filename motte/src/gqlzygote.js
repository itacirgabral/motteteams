const Redis = require('ioredis')
const { WAConnection, MessageType } = require('@adiwajshing/baileys')
const fetch = require('node-fetch')
const jsonwebtoken = require('jsonwebtoken')

const jwtsecret = process.env.JWT_SECRET
const redisConn = process.env.REDIS_CONN

/*
{
  leftover: {
    queueback: 'tempzap:KIcuxxHBYZU=:qr',
    webhook: 'https://example.com',
    remember: true,
    selflog: true
  }
}
*/
const redis = new Redis(redisConn)

const gqlzygote = async ({ leftover }) => {
  console.log('gqlzygote')
  const WAC = new WAConnection()
  WAC.browserDescription = ['BROODERHEN', 'Chrome', '87']
  WAC.connectOptions.maxRetries = 0
  WAC.autoReconnect = 0

  const local = {
    qr: '',
    creds: '',
    user: '',
    qr2jwtkwy: ''
  }

  const timeoutid = setTimeout(() => {
    WAC.close()
  }, 20000)

  WAC.on('qr', async qr => {
    console.log('qr')
    console.log(`leftover.queueback=${leftover.queueback}`)
    const body = JSON.stringify({ type: 'qr', qr })
    local.qr = qr
    local.qr2jwtkwy = `tempzap:${qr}:jwt`

    Promise.all([
      fetch(leftover.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      }).catch(() => {}),

      redis.rpush(leftover.queueback, body)
    ])
  })
  WAC.on('credentials-updated', async auth => {
    const creds = {
      clientID: auth.clientID,
      serverToken: auth.serverToken,
      clientToken: auth.clientToken,
      encKey: auth.encKey.toString('base64'),
      macKey: auth.macKey.toString('base64')
    }

    local.creds = creds
    console.log('credentials-updated')
  })
  WAC.on('open', async () => {
    console.log('open')
    local.user = WAC.user
    clearTimeout(timeoutid)
    const number = WAC.user.jid.split('@s.whatsapp.net')[0]
    const jwt = jsonwebtoken.sign(number, jwtsecret)
    const body = JSON.stringify({
      type: 'jwt',
      jwt,
      userinfo: {
        number,
        name: WAC.user.name,
        avatar: WAC.user.imgUrl
      }
    })

    const pipeline = redis.pipeline()
    pipeline.rpush(local.qr2jwtkwy, body)
    pipeline.set(`zap:${number}:creds`, JSON.stringify(local.creds))

    if (leftover.webhook) {
      pipeline.set(`zap:${number}:webhook`, leftover.webhook)
    }

    await Promise.all([
      WAC.sendMessage(WAC.user.jid, `*Open the connection:*\nhttps://zapql.com/${number}/dashboard/&jwt=${jwt}`, MessageType.text),
      pipeline.exec(),
      fetch(leftover.webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body
      }).catch(() => {})
    ])

    setTimeout(async () => {
      WAC.close()

      // setar outro timeout para apagar temp::
    }, 6000)
  })

  return WAC.connect().catch(console.error)
}

module.exports = gqlzygote
