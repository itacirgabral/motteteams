const { AuthenticationError } = require('apollo-server')

const mutationWebhook = async (parent, args, context, info) => {
  if (context.user) {
    const webhookkey = `zap:${context.user.shard}:webhook`

    let old
    if (args.input) {
      old = await context.redis.getset(webhookkey, args.input)
    } else {
      const pipeline = context.redis.pipeline()
      pipeline.get(webhookkey)// 0
      pipeline.del(webhookkey)// 1
      const pipeback = await pipeline.exec()
      old = pipeback[0][1]
    }

    return old
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = mutationWebhook
