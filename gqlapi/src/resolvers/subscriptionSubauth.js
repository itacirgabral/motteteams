const { AuthenticationError } = require('apollo-server')
const Redis = require('ioredis')
const madreRedis = new Redis(process.env.REDIS_CONN)

const subscriptionSubauth = {
  subscribe: (parent, args, context, info) => {
    const { pubsubkey } = args.input
    if (context?.user?.shard) {
      const redis = madreRedis.duplicate()
      const rtag = String(Math.random()).slice(2)
      const pubkey = `zap:${context.user.shard}:${pubsubkey}`

      console.log(`pubkey=${pubkey}`)

      redis.subscribe(pubkey).then(() => {
        redis.on('message', async (channel, message) => {
          console.log(`channel=${channel} message=${message}`)
          context.pubsub.publish('commentAdded', {
            subauth: message
          })
        })
      })

      return context.pubsub.asyncIterator([rtag])
    } else {
      throw new AuthenticationError('do auth')
    }
  }
}

module.exports = subscriptionSubauth
