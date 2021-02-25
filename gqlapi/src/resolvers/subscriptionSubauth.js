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

      // 1 subscribe por shard
      // se nao tiver sub, cria sub e manda conect
      // se ja tiver sub, manda connectionstate
      /*
          onConnect
          pubkey=zap:556599375661:opa
          onConnect
          pubkey=zap:556599375661:opa
          onConnect
          pubkey=zap:556599375661:opa
          onConnect
          pubkey=zap:556599375661:opa
          onConnect
          pubkey=zap:556599375661:opa
          onDisconnect
          onDisconnect
          onDisconnect
          onDisconnect
          onDisconnect
          // doideira, o playground e' zicado, talvez de pra usar o controle de lifecycle do rgaphql mesmo
      */
      redis.subscribe(pubkey).then(() => {
        redis.on('message', async (channel, message) => {
          context.pubsub.publish(rtag, { subauth: message })
        })
      })

      return context.pubsub.asyncIterator([rtag])
    } else {
      throw new AuthenticationError('do auth')
    }
  }
}

module.exports = subscriptionSubauth
