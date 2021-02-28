const { AuthenticationError } = require('apollo-server-express')

const messages = {
  subscribe: (parent, args, context, info) => {
    if (context?.user?.shard) {
      const shard = context?.user?.shard
      const redisB = context.redis.duplicate()
      const rtag = String(Math.random()).slice(2)
      const radiohookkey = `zap:${shard}:radiohook`

      redisB.subscribe(radiohookkey).then(() => {
        redisB.on('message', async (channel, message) => {
          const { type, ...leftover } = JSON.parse(message)
          switch (type) {
            case 'textMessage':
              if (leftover.to === shard) {
                context.pubsub.publish(rtag, {
                  messages: {
                    wid: leftover.wid,
                    timestamp: leftover.timestamp,
                    to: leftover.to,
                    from: leftover.from,
                    author: leftover.author,
                    msg: leftover.msg,
                    quote: leftover.quote,
                    forwarded: leftover.forwarded
                  }
                })
              }
              break
            case 'subscriptionTurnoff':
              if (leftover.sid === context.sid) {
                redisB.unsubscribe(radiohookkey)
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

module.exports = messages
