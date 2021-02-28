const { AuthenticationError } = require('apollo-server-express')

const timeout = Number(process.env.TIMEOUT || '5000')

const reconect = async (parent, args, context, info) => {
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
        if (type === 'opened') {
          redisB.unsubscribe()
          clearTimeout(timeoutId)
          resolve('conected')
        }
      })
    })

    await context.redis.publish(context.panoptickey, JSON.stringify({
      type: 'connect',
      hardid: context.hardid,
      shard: context.user.shard
    }))

    return queryResult
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = reconect
