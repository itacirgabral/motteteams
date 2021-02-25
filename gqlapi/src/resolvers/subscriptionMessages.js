const { AuthenticationError } = require('apollo-server')
const Redis = require('ioredis')
const madreRedis = new Redis(process.env.REDIS_CONN)

const subscriptionMessages = {
  subscribe: (parent, args, context, info) => {
    if (context?.user?.shard) {
      const shard = context?.user?.shard
      const redis = madreRedis.duplicate()
      const rtag = String(Math.random()).slice(2)
      const radiohookkey = `zap:${shard}:radiohook`

      console.log(`subscriber ${context.sid}`)

      redis.subscribe(radiohookkey).then(() => {
        redis.on('message', async (channel, message) => {
          const { type, ...leftover } = JSON.parse(message)
          switch (type) {
            case 'textMessage':
              if (leftover.to === shard) {
                context.pubsub.publish(rtag, { messages: `${leftover.from}: ${leftover.msg}\n${leftover.timestamp}:${leftover.wid}` })
              }
              break
            case 'subscriptionTurnoff':
              if (leftover.sid === context.sid) {
                redis.unsubscribe(radiohookkey)
              }
              break
          }
        })
      })

      return context.pubsub.asyncIterator([rtag])
    } else {
      throw new AuthenticationError('do auth')
    }
  }
}

module.exports = subscriptionMessages
