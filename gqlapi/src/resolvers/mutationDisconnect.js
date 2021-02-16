const { AuthenticationError } = require('apollo-server')

const timeout = Number(process.env.TIMEOUT || '5000')

const mutationDisconnect = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const radiohookkey = `zap:${context.user.shard}:radiohook`

    await redisB.subscribe(radiohookkey)
    const queryResult = new Promise((resolve, reject) => {
      setTimeout(() => {
        redisB.unsubscribe(radiohookkey)
        resolve('disconnect timeout')
      }, timeout)

      redisB.on('message', (channel, message) => {
        const { type, reason } = JSON.parse(message)
        if (type === 'closed' && reason === 'intentional') {
          redisB.unsubscribe()
          resolve('disconected')
        }
      })
    })

    await context.redis.publish(context.panoptickey, JSON.stringify({
      type: 'disconnect',
      hardid: context.hardid,
      shard: context.user.shard
    }))

    return queryResult
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = mutationDisconnect
