const { AuthenticationError } = require('apollo-server')

const timeout = Number(process.env.TIMEOUT || '5000')

const disconnect = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const radiohookkey = `zap:${context.user.shard}:radiohook`

    await redisB.subscribe(radiohookkey)

    let timeoutId
    const queryResult = new Promise((resolve, reject) => {
      timeoutId = setTimeout(() => {
        redisB.unsubscribe(radiohookkey)
        resolve(null)
      }, timeout)

      redisB.on('message', (channel, message) => {
        const { type } = JSON.parse(message)
        if (type === 'closed') {
          redisB.unsubscribe()
          clearTimeout(timeoutId)
          resolve('disconnected')
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

module.exports = disconnect
