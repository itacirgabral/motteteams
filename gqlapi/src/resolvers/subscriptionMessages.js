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

      console.log(radiohookkey)

      context.bee = 'boop'

      redis.subscribe(radiohookkey).then(() => {
        redis.on('message', async (channel, message) => {
          const { type, timestamp, to, from, msg, wid } = JSON.parse(message)
          if (type === 'textMessage' && to === shard) {
            context.pubsub.publish(rtag, { messages: `${from}: ${msg}\n${timestamp}:${wid}` })
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
