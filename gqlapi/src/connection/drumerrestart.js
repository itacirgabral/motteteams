const { AuthenticationError } = require('apollo-server-express')

const timeout = Number(process.env.TIMEOUT || '5000')

const drumerrestart = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const radiohookkey = `zap:${context.user.shard}:radiohook`

    await redisB.subscribe(radiohookkey)

    let timeoutId
    const queryResult = new Promise((resolve, reject) => {
      let queue = false
      let spread = false

      timeoutId = setTimeout(() => {
        redisB.unsubscribe(radiohookkey)
        if (!queue && !spread) {
          resolve(null)
        } else {
          resolve(`queue${queue ? '' : ' not'} started; spread${spread ? '' : ' not'} started;`)
        }
      }, timeout)

      redisB.on('message', (channel, message) => {
        const { type } = JSON.parse(message)
        if (type === 'queue starting') {
          if (spread) {
            redisB.unsubscribe()
            clearTimeout(timeoutId)
            resolve('all restarted')
          } else {
            queue = true
          }
        } else if (type === 'spread starting') {
          if (queue) {
            redisB.unsubscribe()
            clearTimeout(timeoutId)
            resolve('all restarted')
          } else {
            spread = true
          }
        }
      })
    })

    const pipeline = context.redis.pipeline()
    pipeline.publish(context.panoptickey, JSON.stringify({
      type: 'queuerestart',
      hardid: context.hardid,
      shard: context.user.shard
    }))
    pipeline.publish(context.panoptickey, JSON.stringify({
      type: 'spreadrestart',
      hardid: context.hardid,
      shard: context.user.shard
    }))
    await pipeline.exec()

    return queryResult
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = drumerrestart
