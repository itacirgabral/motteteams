const { AuthenticationError } = require('apollo-server')

const queryWebhook = async (parent, args, context, info) => {
  if (context.user) {
    const webhookkey = `zap:${context.user.shard}:webhook`
    const webhook = await context.redis.get(webhookkey)

    return webhook
  } else {
    throw new AuthenticationError('do auth')
  }
}

module.exports = queryWebhook
