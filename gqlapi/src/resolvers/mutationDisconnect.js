const { AuthenticationError } = require('apollo-server')

const mutationDisconnect = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const radiohookkey = `zap:${context.user.shard}:radiohook`

    const disconected = new Promise((resolve, reject) => redisB.subscribe(radiohookkey).then(() => {
      setTimeout(() => {
        redisB.unsubscribe()
        resolve('disconnect timeout')
      }, 20000)

      redisB.on('message', (channel, message) => {
        const { type, reason } = JSON.parse(message)
        if (type === 'closed' && reason === 'intentional') {
          redisB.unsubscribe()
          resolve('disconected')
        } else {
          console.log(message)
        }
      })
    }))

    await context.redis.publish(context.panoptickey, JSON.stringify({
      type: 'disconnect',
      hardid: context.hardid,
      shard: context.user.shard
    }))

    return disconected
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = mutationDisconnect
