const { AuthenticationError } = require('apollo-server')

const mutationQueuerestart = async (parent, args, context, info) => {
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
        const { type, queueSize } = JSON.parse(message)
        if (type === 'queue starting') {
          redisB.unsubscribe()
          resolve(`queue starting size ${queueSize}`)
        }
      })
    })

    await context.redis.publish(context.panoptickey, JSON.stringify({
      type: 'queuerestart',
      hardid: context.hardid,
      shard: context.user.shard
    }))

    return queryResult
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = mutationQueuerestart
