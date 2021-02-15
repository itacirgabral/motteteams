const { AuthenticationError } = require('apollo-server')

const queryConnectionstate = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const radiohookkey = `zap:${context.user.shard}:radiohook`

    await redisB.subscribe(radiohookkey)
    const queryResult = new Promise((resolve, reject) => {
      setTimeout(() => {
        redisB.unsubscribe(radiohookkey)
        resolve('disconnect timeout')
      }, 20000)

      redisB.on('message', (channel, message) => {
        const { type, state } = JSON.parse(message)
        if (type === 'connectionstate') {
          redisB.unsubscribe()
          resolve(state)
        }
      })
    })

    await context.redis.publish(context.panoptickey, JSON.stringify({
      type: 'connectionstate',
      hardid: context.hardid,
      shard: context.user.shard
    }))

    return queryResult
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = queryConnectionstate
