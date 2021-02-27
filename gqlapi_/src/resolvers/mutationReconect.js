const { AuthenticationError } = require('apollo-server')

const timeout = Number(process.env.TIMEOUT || '5000')

const mutationReconect = async (parent, args, context, info) => {
  if (context.user) {
    const redisB = context.redis.duplicate()
    const radiohookkey = `zap:${context.user.shard}:radiohook`

    await redisB.subscribe(radiohookkey)

    // TODO

  } else {
    throw new AuthenticationError('do auth')
  }
}


module.exports = mutationReconect
