const Redis = require('ioredis')
const { WAConnection } = require('@adiwajshing/baileys')
const fetch = require('node-fetch')
const jsonwebtoken = require('jsonwebtoken')

const jwtsecret = process.env.JWT_SECRET
const redisConn = process.env.REDIS_CONN

const mkcredskey = shard => `zap:${shard}:creds`
const mkwebhookkey = shard => `zap:${shard}:webhook`
const bornskey = 'borns'
const redis = new Redis(redisConn)
const zigotopanel = new Map()

const zygote = ({ leftover, hardid }) => {
  if (!zigotopanel.has(leftover.shard)) {
    let attempts = 0
    const WA = new WAConnection()
    WA.browserDescription = ['BROODERHEN', 'Chrome', '87']

    const timeoutid = setTimeout(() => {
      WA.close()
      zigotopanel.delete(leftover.shard)
    }, 100000)

    zigotopanel.set(leftover.shard, { WA })

    WA.on('qr', async qr => {
      attempts += 1

      console.log(`${leftover.shard} qr=${qr}`)
      await fetch(leftover.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'qr', qr, attempts })
      }).catch(() => {})
    })

    WA.on('credentials-updated', async auth => {
      console.log('credentials-updated')
      const creds = JSON.stringify({
        clientID: auth.clientID,
        serverToken: auth.serverToken,
        clientToken: auth.clientToken,
        encKey: auth.encKey.toString('base64'),
        macKey: auth.macKey.toString('base64')
      })

      const birthcert = JSON.stringify({
        hardid,
        mitochondria: leftover.mitochondria,
        shard: leftover.shard,
        timestamp: Date.now()
      })

      const pipeline = redis.pipeline()
      pipeline.set(mkcredskey(leftover.shard), creds)
      pipeline.sadd(bornskey, birthcert)
      await pipeline.exec()
      console.log(`${leftover.shard} creds=${creds}`)
    })

    WA.on('open', async () => {
      const foundShard = WA.user.jid.split('@s.whatsapp.net')[0]
      const jwt = jsonwebtoken.sign(leftover.shard, jwtsecret)

      if (leftover.shard === foundShard) {
        await redis.set(mkwebhookkey(leftover.shard), leftover.url)
        console.log(`${leftover.shard} jwt=${jwt}`)

        setTimeout(async () => {
          clearTimeout(timeoutid)
          WA.close()
          zigotopanel.delete(leftover.shard)
          const userinfo = {
            number: foundShard,
            name: WA.user.name,
            avatar: WA.user.imgUrl
          }
          await fetch(leftover.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type: 'jwt', jwt, userinfo })
          }).catch(() => {})
        }, 6000)
      } else {
        console.log(`${leftover.shard} !== ${foundShard}`)
        await redis.del(mkcredskey(leftover.shard))
        await fetch(leftover.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'error',
            message: 'mismatch numbers',
            wanted: leftover.shard,
            found: foundShard
          })
        }).catch(() => {})
      }
    })

    WA.connect().catch(console.error)
  }
}

module.exports = zygote
